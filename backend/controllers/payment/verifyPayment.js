const Payment = require("../../model/paymentModel");
const razorpayService = require("../../services/razorpayService");
const User = require("../../model/userModel");
const PricingPlan = require("../../model/pricingPlanModel");
const ServiceProfile = require("../../model/createAllServiceProfileModel");
const { extractContactLimit, featureKeyMap } = require("../../utils/planFeature");
const jobModel = require("../../model/jobmodel");
const MatrimonyModel = require("../../model/Matrimony");
const PropertyModel = require("../../model/property");
const offerModel = require("../../model/OfferModel");

const postModelMap = {
  job: jobModel,
  property: PropertyModel,
  offer: offerModel,
  matrimony: MatrimonyModel,
};

/* =====================================================
   Enable Plan Features In post
===================================================== */
const enablePostFeatures = async (postId, plan, expiryDate) => {
  const Model = postModelMap[plan.planType];
  if (!Model) return;

  const post = await Model.findById(postId);
  if (!post) return;

  for (const featureName of plan.features) {
    // FIRST: Check dynamic contact feature
    const contactLimit = extractContactLimit(featureName);

    if (contactLimit !== null) {
      post.viewContactNumbers.isActive = true;
      post.viewContactNumbers.expiresAt = expiryDate;

      continue;
    }
    const mappedKey = featureKeyMap[featureName];
    if (!mappedKey) continue;

    if (post[mappedKey]) {
      post[mappedKey].isActive = true;
      post[mappedKey].expiresAt = expiryDate;
    }
  }

  await post.save();
};

/* =====================================================
   Helper: Calculate Expiry Date
===================================================== */
const calculateExpiryDate = (plan, durationValue) => {
  const endDate = new Date();

  const durationText = plan.duration1?.toLowerCase() || plan.duration2?.toLowerCase() || "";

  if (durationText.includes("day")) {
    endDate.setDate(endDate.getDate() + durationValue);
  } else {
    endDate.setMonth(endDate.getMonth() + durationValue);
  }

  return endDate;
};

/* =====================================================
   Helper: Update ALL User Profiles (Service + Business)
===================================================== */
const updateUserServiceProfiles = async (userId, plan) => {
  try {
    let serviceType = "null";

    if (plan.isFeatured) {
      serviceType = "featured";
    } else if (plan.isPremium) {
      serviceType = "premium";
    }

    if (serviceType === "null") return;

    const updateResult = await ServiceProfile.updateMany(
      {
        userId: userId,
        isActive: true,
      },
      {
        $set: {
          serviceType: serviceType,
          isPremium: serviceType === "premium",
          isFeatured: serviceType === "featured",
        },
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} profiles to ${serviceType}`);
    return updateResult;
  } catch (error) {
    console.error("❌ Profile update error:", error);
    throw error;
  }
};

/* =====================================================
   Helper: Update one specific User Profile (Service + Business)
===================================================== */
const updateUserServiceProfile = async (userId, plan, serviceProfileId, expiryDate) => {
  try {
    const serviceProfile = await ServiceProfile.findOne({
      _id: serviceProfileId,
      userId: userId,
      isActive: true,
    });

    console.log("serviceProfile:=", serviceProfile);
    for (const featureName of plan.features) {
      const mappedKey = featureKeyMap[featureName];
      if (!mappedKey) continue;
      console.log("serviceProfile:=", mappedKey);

      // SERVICE BUSINESS
      if (serviceProfile[mappedKey]) {
        serviceProfile[mappedKey].isActive = true;
        serviceProfile[mappedKey].expiresAt = expiryDate;
      }
    }

    await serviceProfile.save();

    console.log(`✅ Updated user profile`);
  } catch (error) {
    console.error("❌ Profile update error:", error);
    throw error;
  }
};

/* =====================================================
   VERIFY PAYMENT CONTROLLER
===================================================== */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      serviceProfileId = null,
      postId = null,
    } = req.body;
    const userId = req.user._id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "Order ID, Payment ID and Signature are required",
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized payment access" });
    }

    const isValid = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      payment.status = "failed";
      payment.errorDescription = "Invalid signature";
      await payment.save();

      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Fetch Plan
    const plan = await PricingPlan.findById(payment.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Build dynamic increment object for post limits
    let incrementField = {};

    if (plan.category === "post" && plan.postLimit > 0) {
      if (plan.planType === "job") {
        incrementField.jobPostLimit = plan.postLimit;
      } else if (plan.planType === "property") {
        incrementField.propertyPostLimit = plan.postLimit;
      } else if (plan.planType === "offer") {
        incrementField.offerPostLimit = plan.postLimit;
      }
    }

    // Update Payment Record
    payment.status = "success";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.startDate = new Date();
    payment.endDate = calculateExpiryDate(plan, payment.duration);

    await payment.save();

    // Build dynamic push object
    const pushFields = {
      purchasedPlans: {
        planId: plan._id,
        startDate: payment.startDate,
        endDate: payment.endDate,
      },
    };

    // If category is ads, push into adPlansId
    if (plan.category === "ads") {
      pushFields.adPlansId = {
        planId: plan._id,
        startDate: payment.startDate,
        endDate: payment.endDate,
      };
    }

    // Update User Active Plan
    await User.findByIdAndUpdate(userId, {
      $set: {
        activePlan: {
          planId: plan._id,
          planTitle: plan.title,
          planCategory: plan.category,
          features: plan.features,
          startDate: payment.startDate,
          endDate: payment.endDate,
          amount: payment.amount,
          status: payment.status,
        },
      },
      $push: pushFields,
      $addToSet: { subscriptions: payment._id },
      $inc: incrementField,
    });

    // Enable features in post model
    await enablePostFeatures(postId, plan, payment.endDate);

    // ✅ Upgrade ALL service/business profiles
    if (plan.category === "service-business") {
      await updateUserServiceProfiles(userId, plan);
      await updateUserServiceProfile(userId, plan, serviceProfileId, payment.endDate);
    }

    return res.status(200).json({
      message: "Payment verified successfully",
      data: {
        paymentId: payment._id,
        planTitle: plan.title,
        startDate: payment.startDate,
        endDate: payment.endDate,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error("❌ Verify Payment Error:", error);
    return res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

module.exports = { verifyPayment };
