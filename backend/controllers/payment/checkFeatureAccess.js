const Payment = require('../../model/paymentModel');
const PricingPlan = require('../../model/pricingPlanModel');
const User = require('../../model/userModel');

/**
 * Check if user has access to a specific feature
 * POST /api/user/check-feature-access
 *
 * Request body: { feature: "Feature Name" } or { features: ["Feature 1", "Feature 2"] }
 *
 * Returns whether the user has access to the requested feature(s)
 * based on their active subscriptions OR free post limit
 *
 * For 'post' category: Users get 10 free posts total across all post types
 * (jobs, matrimony, property, offers) before requiring a pricing plan
 */
const checkFeatureAccess = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { feature, features, category } = req.body;

        // Validate input
        if (!feature && !features && !category) {
            return res.status(400).json({
                message: 'Either feature, features array, or category is required',
                success: false,
                error: true
            });
        }

        const featuresToCheck = features || (feature ? [feature] : []);

        console.log(`🔍 Checking feature access for user: ${userId}`);
        if (featuresToCheck.length > 0) {
            console.log(`   Features to check: ${featuresToCheck.join(', ')}`);
        }
        if (category) {
            console.log(`   Category filter: ${category}`);
        }

        // Special handling for 'post' category - check free post limit
        if (category === 'post') {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                    success: false,
                    error: true
                });
            }

            const freePostsRemaining = (user.freePostLimit || 10) - (user.freePostsUsed || 0);
            console.log(`   Free posts: ${user.freePostsUsed || 0}/${user.freePostLimit || 10} used, ${freePostsRemaining} remaining`);

            // If user has free posts remaining, grant access
            if (freePostsRemaining > 0) {
                console.log(`✅ Access granted via free post limit (${freePostsRemaining} free posts remaining)`);
                return res.status(200).json({
                    message: 'Feature access granted via free post limit',
                    data: {
                        hasAccess: true,
                        accessType: 'free',
                        freePostsUsed: user.freePostsUsed || 0,
                        freePostLimit: user.freePostLimit || 10,
                        freePostsRemaining: freePostsRemaining,
                        partialAccess: true,
                        featureAccess: {},
                        userFeatures: [],
                        activeSubscriptions: [],
                        totalActiveSubscriptions: 0
                    },
                    success: true,
                    error: false
                });
            }

            console.log(`⚠️ Free posts exhausted, checking for active subscriptions...`);
        }

        // Try to use user.activePlan for fast access control
        const user = await User.findById(userId);
        let userFeatures = new Set();
        let subscriptionDetails = [];
        let hasAccess = false;
        let partialAccess = false;
        let featureAccessMap = {};
        let totalActiveSubscriptions = 0;

        if (user && user.activePlan && user.activePlan.endDate && new Date(user.activePlan.endDate) > new Date()) {
            // Use activePlan if valid
            if (Array.isArray(user.activePlan.features)) {
                user.activePlan.features.forEach(f => userFeatures.add(f));
            }
            subscriptionDetails.push({
                planId: user.activePlan.planId,
                planTitle: user.activePlan.planTitle,
                planCategory: user.activePlan.planCategory,
                features: user.activePlan.features,
                startDate: user.activePlan.startDate,
                endDate: user.activePlan.endDate,
                amount: user.activePlan.amount,
                status: user.activePlan.status,
            });
            totalActiveSubscriptions = 1;
        } else {
            // Fallback to dynamic check via payments
            const query = { 
                userId,
                status: 'success'
            };
            if (category) {
                query.planCategory = category;
            }
            const payments = await Payment.find(query)
                .populate('planId')
                .sort({ createdAt: -1 });
            const now = new Date();
            const activeSubscriptions = payments.filter(payment => {
                if (!payment.endDate) return false;
                return new Date(payment.endDate) > now;
            });
            activeSubscriptions.forEach(payment => {
                if (payment.planId && typeof payment.planId === 'object' && payment.planId.features) {
                    payment.planId.features.forEach(f => userFeatures.add(f));
                    subscriptionDetails.push({
                        subscriptionId: payment._id,
                        planTitle: payment.planTitle,
                        planCategory: payment.planCategory,
                        features: payment.planId.features,
                        endDate: payment.endDate
                    });
                }
            });
            totalActiveSubscriptions = activeSubscriptions.length;
        }

        featuresToCheck.forEach(f => {
            featureAccessMap[f] = userFeatures.has(f);
        });
        hasAccess = featuresToCheck.every(f => userFeatures.has(f));
        partialAccess = featuresToCheck.some(f => userFeatures.has(f));

        const responseData = {
            hasAccess,
            partialAccess,
            featureAccess: featureAccessMap,
            userFeatures: Array.from(userFeatures),
            activeSubscriptions: subscriptionDetails,
            totalActiveSubscriptions
        };

        // Add free post info if checking 'post' category
        if (category === 'post' && user) {
            responseData.freePostsUsed = user.freePostsUsed || 0;
            responseData.freePostLimit = user.freePostLimit || 10;
            responseData.freePostsRemaining = (user.freePostLimit || 10) - (user.freePostsUsed || 0);
            responseData.accessType = hasAccess ? 'subscription' : 'none';
        }

        res.status(200).json({
            message: 'Feature access checked successfully',
            data: responseData,
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Error checking feature access:', error);
        res.status(500).json({
            message: 'Error checking feature access',
            error: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { checkFeatureAccess };

