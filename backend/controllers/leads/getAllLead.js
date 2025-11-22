let leadModel = require('../../model/leadModel');

const getAllLead = async (req, res) => {
    try {
        // Fetch all leads without pagination
        const result = await leadModel
            .find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone');

        const total = await leadModel.countDocuments();

        res.json({
            message: 'Leads fetched successfully',
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

module.exports = { getAllLead };
