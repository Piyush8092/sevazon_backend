const Payment = require('../../model/paymentModel');
const PricingPlan = require('../../model/pricingPlanModel');
const ServiceProfile = require('../../model/createAllServiceProfileModel');

/**
 * Sync user's service/business profile serviceTypes based on their active subscriptions
 * This endpoint can be called to fix existing profiles or after subscription changes
 * 
 * POST /api/sync-service-profile-types
 * Auth: Required
 */
const syncServiceProfileTypes = async (req, res) => {
    try {
        const userId = req.user._id;

        console.log(`🔄 Starting serviceType sync for user ${userId}`);

        // Find all active service-business subscriptions for this user
        const activeSubscriptions = await Payment.find({
            userId: userId,
            status: 'success',
            planCategory: 'service-business',
            endDate: { $gte: new Date() } // Only active subscriptions
        }).populate('planId');

        console.log(`📋 Found ${activeSubscriptions.length} active service-business subscription(s)`);

        let serviceType = 'null';
        let highestPlanTitle = 'None';

        // Determine the highest tier plan (Featured > Premium > Regular)
        for (const subscription of activeSubscriptions) {
            if (subscription.planId) {
                const plan = subscription.planId;
                
                if (plan.isFeatured) {
                    serviceType = 'featured';
                    highestPlanTitle = plan.title;
                    break; // Featured is the highest, no need to check further
                } else if (plan.isPremium && serviceType === 'null') {
                    serviceType = 'premium';
                    highestPlanTitle = plan.title;
                }
            }
        }

        console.log(`✨ Determined serviceType: ${serviceType} (Plan: ${highestPlanTitle})`);

        // Update all active service/business profiles for this user
        const updateResult = await ServiceProfile.updateMany(
            { 
                userId: userId,
                isActive: true
            },
            { 
                $set: { serviceType: serviceType } 
            }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} service profile(s) for user ${userId}`);

        res.status(200).json({
            message: 'Service profile types synced successfully',
            data: {
                userId: userId,
                activeSubscriptions: activeSubscriptions.length,
                appliedServiceType: serviceType,
                appliedPlan: highestPlanTitle,
                profilesUpdated: updateResult.modifiedCount,
                profilesMatched: updateResult.matchedCount
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error('❌ Error syncing service profile types:', error);
        res.status(500).json({
            message: 'Error syncing service profile types',
            error: error.message,
            success: false,
            error: true
        });
    }
};

/**
 * Admin endpoint to sync all users' service profiles
 * Useful for fixing historical data after deployment
 * 
 * POST /api/admin/sync-all-service-profile-types
 * Auth: Required (Admin only)
 */
const syncAllServiceProfileTypes = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Unauthorized. Admin access required.',
                success: false,
                error: true
            });
        }

        console.log(`🔄 Starting bulk serviceType sync (Admin: ${req.user._id})`);

        // Get all unique user IDs who have service profiles
        const uniqueUserIds = await ServiceProfile.distinct('userId', { isActive: true });
        
        console.log(`📋 Found ${uniqueUserIds.length} users with active service profiles`);

        let successCount = 0;
        let errorCount = 0;
        const results = [];

        // Process each user
        for (const userId of uniqueUserIds) {
            try {
                // Find active service-business subscriptions
                const activeSubscriptions = await Payment.find({
                    userId: userId,
                    status: 'success',
                    planCategory: 'service-business',
                    endDate: { $gte: new Date() }
                }).populate('planId');

                let serviceType = 'null';

                // Determine serviceType
                for (const subscription of activeSubscriptions) {
                    if (subscription.planId) {
                        const plan = subscription.planId;
                        
                        if (plan.isFeatured) {
                            serviceType = 'featured';
                            break;
                        } else if (plan.isPremium && serviceType === 'null') {
                            serviceType = 'premium';
                        }
                    }
                }

                // Update profiles
                const updateResult = await ServiceProfile.updateMany(
                    { 
                        userId: userId,
                        isActive: true
                    },
                    { 
                        $set: { serviceType: serviceType } 
                    }
                );

                results.push({
                    userId: userId,
                    serviceType: serviceType,
                    profilesUpdated: updateResult.modifiedCount
                });

                successCount++;
                
            } catch (error) {
                console.error(`❌ Error syncing user ${userId}:`, error);
                errorCount++;
                results.push({
                    userId: userId,
                    error: error.message
                });
            }
        }

        console.log(`✅ Bulk sync complete: ${successCount} success, ${errorCount} errors`);

        res.status(200).json({
            message: 'Bulk service profile type sync completed',
            data: {
                totalUsers: uniqueUserIds.length,
                successCount: successCount,
                errorCount: errorCount,
                results: results
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error('❌ Error in bulk sync:', error);
        res.status(500).json({
            message: 'Error in bulk service profile type sync',
            error: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { 
    syncServiceProfileTypes,
    syncAllServiceProfileTypes 
};
