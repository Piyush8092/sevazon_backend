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

        // Find all successful payments for the user
        const query = { 
            userId,
            status: 'success'
        };

        // Add category filter if provided
        if (category) {
            query.planCategory = category;
        }

        const payments = await Payment.find(query)
            .populate('planId')
            .sort({ createdAt: -1 });

        // Filter only active subscriptions (not expired)
        const now = new Date();
        const activeSubscriptions = payments.filter(payment => {
            if (!payment.endDate) return false;
            return new Date(payment.endDate) > now;
        });

        // Collect all features from active subscriptions
        const userFeatures = new Set();
        const subscriptionDetails = [];

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

        // Check access for each requested feature
        const featureAccessMap = {};
        featuresToCheck.forEach(f => {
            featureAccessMap[f] = userFeatures.has(f);
        });

        // Determine overall access
        const hasAccess = featuresToCheck.every(f => userFeatures.has(f));
        const partialAccess = featuresToCheck.some(f => userFeatures.has(f));

        console.log(`✅ Feature access check complete for user ${userId}`);
        console.log(`   Has full access: ${hasAccess}`);
        console.log(`   Has partial access: ${partialAccess}`);

        // Include free post information in response for 'post' category
        const responseData = {
            hasAccess,
            partialAccess,
            featureAccess: featureAccessMap,
            userFeatures: Array.from(userFeatures),
            activeSubscriptions: subscriptionDetails,
            totalActiveSubscriptions: activeSubscriptions.length
        };

        // Add free post info if checking 'post' category
        if (category === 'post') {
            const user = await User.findById(userId);
            if (user) {
                responseData.freePostsUsed = user.freePostsUsed || 0;
                responseData.freePostLimit = user.freePostLimit || 10;
                responseData.freePostsRemaining = (user.freePostLimit || 10) - (user.freePostsUsed || 0);
                responseData.accessType = hasAccess ? 'subscription' : 'none';
            }
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

