let MatrimonyModel = require('../../model/Matrimony');

const getAllMatrimony = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        // Populate applyMatrimony.applyUserId to include user IDs for frontend checking
        const result = await MatrimonyModel.find({userId:{$nin: [req.user._id]}})
            .populate('applyMatrimony.applyUserId', '_id name email phone')
            .skip(skip)
            .limit(limit);

        const total = await MatrimonyModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Matrimony profiles retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllMatrimony };
