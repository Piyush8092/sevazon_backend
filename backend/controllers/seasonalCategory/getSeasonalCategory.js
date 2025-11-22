const SeasonalCategoryModel = require('../../model/SeasonalCategoryModel');

/**
 * Get the currently active seasonal category
 * This endpoint is public and can be accessed without authentication
 */
const getSeasonalCategory = async (req, res) => {
    try {
        // Find the active seasonal category
        const seasonalCategory = await SeasonalCategoryModel
            .findOne({ isActive: true })
            .populate('categoryId', 'name image subService')
            .sort({ createdAt: -1 }); // Get the most recent one if multiple exist

        if (!seasonalCategory) {
            return res.json({
                message: 'No seasonal category set',
                status: 200,
                data: null,
                success: true,
                error: false
            });
        }

        // Check if the seasonal category has expired (if dates are set)
        const now = new Date();
        if (seasonalCategory.endDate && seasonalCategory.endDate < now) {
            // Deactivate expired seasonal category
            seasonalCategory.isActive = false;
            await seasonalCategory.save();
            
            return res.json({
                message: 'Seasonal category has expired',
                status: 200,
                data: null,
                success: true,
                error: false
            });
        }

        res.json({
            message: 'Seasonal category retrieved successfully',
            status: 200,
            data: seasonalCategory,
            success: true,
            error: false
        });

    } catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getSeasonalCategory };

