const UserActivity = require('../../model/userActivityModel');

/**
 * Track user activity
 * POST /track-activity
 */
const trackActivity = async (req, res) => {
    try {
        const userId = req.user?._id || req.body.userId;
        
        if (!userId) {
            return res.status(401).json({
                message: 'User not authenticated',
                status: 401,
                success: false,
                error: true
            });
        }

        const {
            activityType,
            contentType,
            contentId,
            category,
            subcategory,
            searchQuery,
            metadata,
            sessionId,
            deviceInfo
        } = req.body;

        // Validate required fields
        if (!activityType || !contentType || !contentId) {
            return res.status(400).json({
                message: 'Missing required fields: activityType, contentType, contentId',
                status: 400,
                success: false,
                error: true
            });
        }

        // Create activity record
        const activity = new UserActivity({
            userId,
            activityType,
            contentType,
            contentId,
            category,
            subcategory,
            searchQuery,
            metadata,
            sessionId,
            deviceInfo
        });

        await activity.save();

        res.json({
            message: 'Activity tracked successfully',
            status: 200,
            data: activity,
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Track activity error:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

/**
 * Get user activity history
 * GET /get-user-activity
 */
const getUserActivity = async (req, res) => {
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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const activityType = req.query.activityType;
        const contentType = req.query.contentType;

        // Build query
        const query = { userId };
        if (activityType) query.activityType = activityType;
        if (contentType) query.contentType = contentType;

        const [activities, total] = await Promise.all([
            UserActivity.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            UserActivity.countDocuments(query)
        ]);

        res.json({
            message: 'User activity retrieved successfully',
            status: 200,
            data: activities,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Get user activity error:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = {
    trackActivity,
    getUserActivity
};

