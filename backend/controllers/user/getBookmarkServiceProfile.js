let userModel = require('../../model/userModel');

const getBookmarkServiceProfile = async (req, res) => {
    try {
        let userId = req.user._id;

        // Find user and populate bookmarked service profiles
        let result = await userModel.findById(userId).populate({
            path: 'serviceProfileBookmarkID',
            select: 'profileType profileImage yourName businessName selectCategory selectSubCategory area city state pincode timing experienceYear experienceMonth averageRating reviewsCount isVerified serviceType createdAt _id userId',
            match: { isActive: true } // Only show active profiles
        });

        if (!result) {
            return res.json({
                message: 'User not found',
                status: 404,
                data: [],
                success: false,
                error: true
            });
        }

        res.json({
            message: 'Bookmarked service profiles retrieved successfully',
            status: 200,
            data: result.serviceProfileBookmarkID || [],
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getBookmarkServiceProfile };


