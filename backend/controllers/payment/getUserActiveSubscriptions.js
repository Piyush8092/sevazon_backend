const Payment = require("../../model/paymentModel");
const PricingPlan = require("../../model/pricingPlanModel");

/**
 * Get user's active subscriptions with full plan details
 * GET /api/user/active-subscriptions
 *
 * Returns all active subscriptions for the logged-in user
 * - Filters by status = 'success'
 * - Filters by endDate > current date
 * - Populates full plan details including features
 * - Groups by category for easy access
 */
const getUserActiveSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    console.log(`🔍 Fetching active subscriptions for user: ${userId}`);

    // Find all successful payments for the user
    const payments = await Payment.find({
      userId,
      status: "success",
    })
      .populate("planId") // Populate full plan details
      .sort({ createdAt: -1 });

    // Filter only active subscriptions (not expired)
    const now = new Date();
    const activeSubscriptions = payments.filter((payment) => {
      if (!payment.endDate) return false;
      return new Date(payment.endDate) > now;
    });

    // Group subscriptions by category
    const groupedSubscriptions = {
      "service-business": [],
      post: [],
      ads: [],
      all: [],
    };

    // Process each active subscription
    const processedSubscriptions = activeSubscriptions.map((payment) => {
      const subscription = {
        subscriptionId: payment._id,
        planId: payment.planId?._id || payment.planId,
        planTitle: payment.planTitle,
        planCategory: payment.planCategory,
        amount: payment.amount,
        currency: payment.currency,
        duration: payment.duration,
        startDate: payment.startDate,
        endDate: payment.endDate,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        // Include plan details if populated
        planDetails:
          payment.planId && typeof payment.planId === "object"
            ? {
                title: payment.planId.title,
                category: payment.planId.category,
                features: payment.planId.features || [],
                isFeatured: payment.planId.isFeatured,
                isPremium: payment.planId.isPremium,
                PaymentType: payment.planId.PaymentType,
              }
            : null,
      };

      // Add to category group
      if (groupedSubscriptions[payment.planCategory]) {
        groupedSubscriptions[payment.planCategory].push(subscription);
      }
      groupedSubscriptions.all.push(subscription);

      return subscription;
    });

    // Extract all features the user has access to
    const allFeatures = new Set();
    processedSubscriptions.forEach((sub) => {
      if (sub.planDetails && sub.planDetails.features) {
        sub.planDetails.features.forEach((feature) => allFeatures.add(feature));
      }
    });

    console.log(`✅ Found ${activeSubscriptions.length} active subscriptions for user ${userId}`);
    console.log(`   - Service & Business: ${groupedSubscriptions["service-business"].length}`);
    console.log(`   - Post: ${groupedSubscriptions["post"].length}`);
    console.log(`   - Ads: ${groupedSubscriptions["ads"].length}`);
    console.log(`   - Total features: ${allFeatures.size}`);

    res.status(200).json({
      message: "Active subscriptions retrieved successfully",
      data: {
        subscriptions: processedSubscriptions,
        groupedByCategory: {
          "service-business": groupedSubscriptions["service-business"],
          post: groupedSubscriptions["post"],
          ads: groupedSubscriptions["ads"],
        },
        summary: {
          totalActive: activeSubscriptions.length,
          serviceBusinessCount: groupedSubscriptions["service-business"].length,
          postCount: groupedSubscriptions["post"].length,
          adsCount: groupedSubscriptions["ads"].length,
          allFeatures: Array.from(allFeatures),
        },
      },
      count: activeSubscriptions.length,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching active subscriptions:", error);
    res.status(500).json({
      message: "Error fetching active subscriptions",
      error: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { getUserActiveSubscriptions };
