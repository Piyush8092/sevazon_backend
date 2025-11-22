let leadModel = require('../../model/leadModel');

const getLeadCreaterView = async (req, res) => {
    try {
        let userId = req.user._id;

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

