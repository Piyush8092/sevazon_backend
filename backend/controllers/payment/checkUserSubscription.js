const Payment = require('../../model/paymentModel');
const User = require('../../model/userModel');

/**
 * Check if a specific user has an active subscription in a given category
 * GET /api/user/check-subscription/:userId
 * 
 * Query parameters:
 * - category: Optional category filter (service-business, post, ads)
 * 
 * Returns whether the specified user has an active subscription
 * and details about their premium/featured plan status
 */
const checkUserSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const { category } = req.query;

        console.log(`🔍 Checking subscription for user: ${userId}`);
        if (category) {
            console.log(`   Category filter: ${category}`);
        }

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
                success: false,
                error: true
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
                error: true
            });
        }

        // Build query for active subscriptions
        const query = { 
            userId,
            status: 'success'
        };

        // Add category filter if provided
        if (category) {
            query.planCategory = category;
        }

        // Find all successful payments for the user
        const payments = await Payment.find(query)
            .populate('planId')
            .sort({ createdAt: -1 });

        // Filter only active subscriptions (not expired)
        const now = new Date();
        const activeSubscriptions = payments.filter(payment => {
            if (!payment.endDate) return false;
            return new Date(payment.endDate) > now;
        });

        console.log(`   Found ${activeSubscriptions.length} active subscriptions`);

        // Check for premium/featured plans
        let hasPremiumPlan = false;
        let hasFeaturedPlan = false;
        const subscriptionDetails = [];

        activeSubscriptions.forEach(payment => {
            if (payment.planId && typeof payment.planId === 'object') {
                const planDetails = {
                    subscriptionId: payment._id,
                    planTitle: payment.planTitle,
                    planCategory: payment.planCategory,
                    endDate: payment.endDate,
                    isPremium: payment.planId.isPremium || false,
                    isFeatured: payment.planId.isFeatured || false,
                };

                subscriptionDetails.push(planDetails);

                // Check if this is a premium or featured plan
                if (payment.planId.isPremium) {
                    hasPremiumPlan = true;
                }
                if (payment.planId.isFeatured) {
                    hasFeaturedPlan = true;
                }
            }
        });

        const hasActiveSubscription = activeSubscriptions.length > 0;
        const hasPremiumOrFeatured = hasPremiumPlan || hasFeaturedPlan;

        console.log(`✅ Subscription check complete for user ${userId}`);
        console.log(`   Has active subscription: ${hasActiveSubscription}`);
        console.log(`   Has premium plan: ${hasPremiumPlan}`);
        console.log(`   Has featured plan: ${hasFeaturedPlan}`);

        res.status(200).json({
            message: 'Subscription check completed successfully',
            data: {
                userId,
                hasActiveSubscription,
                hasPremiumPlan,
                hasFeaturedPlan,
                hasPremiumOrFeatured,
                totalActiveSubscriptions: activeSubscriptions.length,
                subscriptions: subscriptionDetails,
            },
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Error checking user subscription:', error);
        res.status(500).json({
            message: 'Error checking user subscription',
            error: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { checkUserSubscription };

