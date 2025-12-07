const Payment = require('../../model/paymentModel');
const PricingPlan = require('../../model/pricingPlanModel');

/**
 * Check if user has access to a specific feature
 * POST /api/user/check-feature-access
 * 
 * Request body: { feature: "Feature Name" } or { features: ["Feature 1", "Feature 2"] }
 * 
 * Returns whether the user has access to the requested feature(s)
 * based on their active subscriptions
 */
const checkFeatureAccess = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { feature, features, category } = req.body;

        // Validate input
        if (!feature && !features) {
            return res.status(400).json({ 
                message: 'Either feature or features array is required',
                success: false,
                error: true
            });
        }

        const featuresToCheck = features || [feature];

        console.log(`🔍 Checking feature access for user: ${userId}`);
        console.log(`   Features to check: ${featuresToCheck.join(', ')}`);
        if (category) {
            console.log(`   Category filter: ${category}`);
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

        res.status(200).json({
            message: 'Feature access checked successfully',
            data: {
                hasAccess,
                partialAccess,
                featureAccess: featureAccessMap,
                userFeatures: Array.from(userFeatures),
                activeSubscriptions: subscriptionDetails,
                totalActiveSubscriptions: activeSubscriptions.length
            },
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

