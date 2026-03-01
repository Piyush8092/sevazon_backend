const User = require("../../model/userModel");
const ServiceProfile = require("../../model/createAllServiceProfileModel");
const Payment = require("../../model/paymentModel");
const PricingPlan = require("../../model/pricingPlanModel");
const { extractContactLimit, featureKeyMap } = require("../../utils/planFeature");

/* =====================================================
   Enable Plan Features In User
===================================================== */

const enablePlanFeatures = async (userId, plan, expiryDate) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (!plan.features || !Array.isArray(plan.features)) return;

  for (const featureName of plan.features) {
    // FIRST: Check dynamic contact feature
    const contactLimit = extractContactLimit(featureName);

    if (contactLimit !== null) {
      if (plan.category === "post" && plan.planType) {
        const type = plan.planType; // job / property / offer / matrimony

        user.postFeatures[type].viewContactNumbers.isActive = true;
        user.postFeatures[type].viewContactNumbers.expiresAt = expiryDate;
      }

      continue;
    }

    const mappedKey = featureKeyMap[featureName];
    if (!mappedKey) continue;

    // SERVICE BUSINESS
    if (plan.category === "service-business") {
      if (user.serviceBusinessFeatures[mappedKey]) {
        user.serviceBusinessFeatures[mappedKey].isActive = true;
        user.serviceBusinessFeatures[mappedKey].expiresAt = expiryDate;
      }
    }

    // POST CATEGORY (job / property / offer / matrimony)
    if (plan.category === "post" && plan.planType) {
      const type = plan.planType; // job / property / offer / matrimony

      if (user.postFeatures[type] && user.postFeatures[type][mappedKey]) {
        user.postFeatures[type][mappedKey].isActive = true;
        user.postFeatures[type][mappedKey].expiresAt = expiryDate;
      }
    }
  }

  await user.save();
};

/* Expiry Calculator */
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

/* Upgrade Profiles */
const updateUserServiceProfiles = async (userId, plan) => {
  let serviceType = "null";

  if (plan.isFeatured) serviceType = "featured";
  else if (plan.isPremium) serviceType = "premium";

  if (serviceType === "null") return;

  await ServiceProfile.updateMany(
    { userId, isActive: true },
    {
      $set: {
        serviceType,
        isPremium: serviceType === "premium",
        isFeatured: serviceType === "featured",
      },
    }
  );
};

const verifyZeroAmountSubscription = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);
    console.log(payment);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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

    // If category is ads, push into adPlansId instead
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

    // Enable features in user model
    await enablePlanFeatures(userId, plan, payment.endDate);

    if (plan.category === "service-business") {
      await updateUserServiceProfiles(userId, plan);
    }

    return res.status(200).json({
      message: "Zero amount subscription verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error verifying zero subscription",
      error: error.message,
    });
  }
};

module.exports = { verifyZeroAmountSubscription };
