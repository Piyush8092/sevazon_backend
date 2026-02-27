const Payment = require("../../model/paymentModel");
const razorpayService = require("../../services/razorpayService");
const User = require("../../model/userModel");
const PricingPlan = require("../../model/pricingPlanModel");
const ServiceProfile = require("../../model/createAllServiceProfileModel");

/* =====================================================
   Helper: Calculate Expiry Date
===================================================== */
const calculateExpiryDate = (plan, durationValue) => {
  const endDate = new Date();

  const durationText =
    plan.duration1?.toLowerCase() || plan.duration2?.toLowerCase() || "";

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
      },
    );

    console.log(
      `✅ Updated ${updateResult.modifiedCount} profiles to ${serviceType}`,
    );
    return updateResult;
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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
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
      razorpaySignature,
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
      },
    };

    // If category is ads, push into adPlansId instead
    if (plan.category === "ads") {
      delete pushFields.purchasedPlans;

      pushFields.adPlansId = {
        planId: plan._id,
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
    });

    // ✅ Upgrade ALL service/business profiles
    if (plan.category === "service-business") {
      await updateUserServiceProfiles(userId, plan);
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
