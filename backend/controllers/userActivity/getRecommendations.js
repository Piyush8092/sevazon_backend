const UserActivity = require('../../model/userActivityModel');
const createServiceModel = require('../../model/createAllServiceProfileModel');
const jobModel = require('../../model/jobmodel');
const PropertyModel = require('../../model/property');
const OfferModel = require('../../model/OfferModel');

/**
 * Get personalized recommendations based on user activity
 * GET /get-recommendations
 */
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user?._id || req.query.userId;
        
        if (!userId) {
            return res.status(401).json({
                message: 'User not authenticated',
                status: 401,
                success: false,
                error: true
            });
        }

        const limit = parseInt(req.query.limit) || 20;

        // Get user's recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentActivities = await UserActivity.find({
            userId,
            timestamp: { $gte: thirtyDaysAgo }
        }).sort({ timestamp: -1 }).limit(100).lean();

        // Analyze user preferences
        const categoryScores = {};
        const subcategoryScores = {};
        const contentTypeScores = {};

        recentActivities.forEach(activity => {
            // Weight different activity types
            let weight = 1;
            switch (activity.activityType) {
                case 'bookmark':
                case 'like':
                case 'apply_job':
                    weight = 3;
                    break;
                case 'contact_view':
                    weight = 2.5;
                    break;
                case 'view_service':
                case 'view_job':
                case 'view_property':
                case 'view_offer':
                    weight = 2;
                    break;
                case 'search':
                case 'category_click':
                    weight = 1.5;
                    break;
            }

            // Score categories
            if (activity.category) {
                categoryScores[activity.category] = (categoryScores[activity.category] || 0) + weight;
            }

            // Score subcategories
            if (activity.subcategory) {
                subcategoryScores[activity.subcategory] = (subcategoryScores[activity.subcategory] || 0) + weight;
            }

            // Score content types
            contentTypeScores[activity.contentType] = (contentTypeScores[activity.contentType] || 0) + weight;
        });

        // Get top categories and subcategories
        const topCategories = Object.entries(categoryScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat]) => cat);

        const topSubcategories = Object.entries(subcategoryScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([subcat]) => subcat);

        // Fetch recommendations based on preferences
        const [services, jobs, properties, offers] = await Promise.all([
            // Recommended services
            createServiceModel.find({
                $or: [
                    { selectCategory: { $in: topCategories } },
                    { selectSubCategory: { $in: topSubcategories } }
                ],
                isActive: true
            }).limit(Math.ceil(limit * 0.4)).lean(),

            // Recommended jobs
            jobModel.find({
                $or: [
                    { selectCategory: { $in: topCategories } },
                    { selectSubCategory: { $in: topSubcategories } }
                ],
                isActive: true
            }).limit(Math.ceil(limit * 0.3)).lean(),

            // Recommended properties
            PropertyModel.find({
                isActive: true
            }).limit(Math.ceil(limit * 0.15)).lean(),

            // Recommended offers
            OfferModel.find({
                $or: [
                    { selectCategory: { $in: topCategories } },
                    { selectSubCategory: { $in: topSubcategories } }
                ],
                isActive: true
            }).limit(Math.ceil(limit * 0.15)).lean()
        ]);

        // Combine and shuffle recommendations
        const recommendations = {
            services: services.map(item => ({ ...item, type: 'service' })),
            jobs: jobs.map(item => ({ ...item, type: 'job' })),
            properties: properties.map(item => ({ ...item, type: 'property' })),
            offers: offers.map(item => ({ ...item, type: 'offer' }))
        };

        res.json({
            message: 'Recommendations retrieved successfully',
            status: 200,
            data: recommendations,
            preferences: {
                topCategories,
                topSubcategories,
                contentTypePreferences: contentTypeScores
            },
            totalRecommendations: services.length + jobs.length + properties.length + offers.length,
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Get recommendations error:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getRecommendations };

