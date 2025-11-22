const SeasonalCategoryModel = require('../../model/SeasonalCategoryModel');

/**
 * Clear/deactivate the current seasonal category (Admin only)
 */
const clearSeasonalCategory = async (req, res) => {
    try {
        // Deactivate all seasonal categories
        const result = await SeasonalCategoryModel.updateMany(
            { isActive: true },
            { isActive: false }
        );

        res.json({
            message: 'Seasonal category cleared successfully',
            status: 200,
            data: { modifiedCount: result.modifiedCount },
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

module.exports = { clearSeasonalCategory };

