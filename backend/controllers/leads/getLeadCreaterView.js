let leadModel = require('../../model/leadModel');
let userModel = require('../../model/userModel');

const getLeadCreaterView = async (req, res) => {
    try {
        let userId = req.user._id;

        // Check if user has created a Service/Business profile
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Verify user has Service/Business profile
        if (!user.AnyServiceCreate) {
            return res.status(403).json({
                message: 'You need to create a Service/Business profile to view leads',
                status: 403,
                success: false,
                error: true,
                requiresProfile: true
            });
        }

        // Fetch all user's leads without pagination
        const result = await leadModel
            .find({userId: userId})
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone');

        const total = await leadModel.countDocuments({userId: userId});

        res.json({
            message: 'User leads fetched successfully',
            status: 200,
            data: result,
            success: true,
            error: false,
            total,
            totalPages: 1
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getLeadCreaterView };

