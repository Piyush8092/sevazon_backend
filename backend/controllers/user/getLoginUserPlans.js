const User = require("../../model/userModel");
const ServiceProfile = require("../../model/createAllServiceProfileModel");
const jobModel = require("../../model/jobmodel");
const MatrimonyModel = require("../../model/Matrimony");
const PropertyModel = require("../../model/property");
const offerModel = require("../../model/OfferModel");

const getLoginUserPlans = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    const user = await User.findById(userId).populate({
      path: "purchasedPlans.planId",
      model: "PricingPlan",
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const currentDate = new Date();
    let hasChanges = false;

    // 1. Mark expired purchasedPlans
    if (user.purchasedPlans) {
      user.purchasedPlans.forEach((plan) => {
        if (plan.endDate && plan.endDate < currentDate && plan.status !== "expired") {
          plan.status = "expired";
          hasChanges = true;
        }
      });
    }

    // 2. Mark expired adPlans
    if (user.adPlansId) {
      user.adPlansId.forEach((plan) => {
        if (plan.endDate && plan.endDate < currentDate && plan.status !== "expired") {
          plan.status = "expired";
          hasChanges = true;
        }
      });
    }

    // 3. Deactivate expired postFeatures
    if (user.postFeatures) {
      // It's an object with categories like 'job', 'matrimony', etc.
      // Need to use .toObject() or just iterate keys if it's a Mongoose subdoc, but Mongoose subdocs don't always behave like raw objects with Object.keys.
      // We can iterate the paths we know:
      const categories = ['job', 'matrimony', 'property', 'offer'];
      categories.forEach(category => {
        if (user.postFeatures[category]) {
          const featureKeys = ['featuredProfileBadge', 'topVisibilityInSearch', 'premiumProfileBadge', 'viewContactNumbers', 'unlimitedMessages'];
          featureKeys.forEach(key => {
            if (user.postFeatures[category][key] && user.postFeatures[category][key].expiresAt) {
              if (user.postFeatures[category][key].expiresAt < currentDate && user.postFeatures[category][key].isActive) {
                user.postFeatures[category][key].isActive = false;
                hasChanges = true;
              }
            }
          });
        }
      });
    }

    // 4. Deactivate expired serviceBusinessFeatures
    if (user.serviceBusinessFeatures) {
      const featureKeys = ['featuredProfileBadge', 'premiumProfileBadge', 'topVisibilityInSearch', 'getMoreLeads', 'videoCallAccess', 'securePaymentSystem', 'profileTimeSlots', 'uploadMoreImages', 'serviceCatalogue', 'socialMediaLinks', 'websiteLink'];
      featureKeys.forEach(key => {
        if (user.serviceBusinessFeatures[key] && user.serviceBusinessFeatures[key].expiresAt) {
          if (user.serviceBusinessFeatures[key].expiresAt < currentDate && user.serviceBusinessFeatures[key].isActive) {
            user.serviceBusinessFeatures[key].isActive = false;
            hasChanges = true;
          }
        }
      });
    }

    // 5. Deactivate activePlan
    if (user.activePlan && user.activePlan.endDate) {
      if (user.activePlan.endDate < currentDate && user.activePlan.status !== "expired") {
        user.activePlan.status = "expired";
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await user.save();
      
      // Also downgrade Service Profiles if no active service-business plans remain
      let hasActiveServicePlan = false;
      if (user.purchasedPlans) {
        user.purchasedPlans.forEach((plan) => {
          if (plan.endDate && plan.endDate > currentDate && plan.planId && plan.planId.category === 'service-business') {
            hasActiveServicePlan = true;
          }
        });
      }

      if (!hasActiveServicePlan) {
        try {
          await ServiceProfile.updateMany(
            { userId: userId, isActive: true },
            { $set: { serviceType: "standard", isPremium: false, isFeatured: false } }
          );
        } catch(e) {
          console.error("❌ Failed to downgrade service profiles:", e);
        }
      }

      // Also deactivate expired features in individual posts
      try {
        const postModels = [jobModel, MatrimonyModel, PropertyModel, offerModel];
        const featureKeys = ['featuredProfileBadge', 'topVisibilityInSearch', 'premiumProfileBadge', 'viewContactNumbers', 'unlimitedMessages'];
        
        for (const Model of postModels) {
          for (const key of featureKeys) {
            const query = { userId: userId };
            query[`${key}.isActive`] = true;
            query[`${key}.expiresAt`] = { $lt: currentDate, $ne: null };
            
            const update = { $set: {} };
            update.$set[`${key}.isActive`] = false;
            
            await Model.updateMany(query, update);
          }
        }
      } catch(e) {
        console.error("❌ Failed to downgrade post features:", e);
      }
    }

    // ✅ Filter only active plans to return to frontend
    const activePlans = user.purchasedPlans.filter(
      (plan) => plan.endDate && plan.endDate > currentDate
    );

    return res.status(200).json({
      message: "Active plans retrieved successfully",
      success: true,
      data: activePlans,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getLoginUserPlans };
