let MatrimonyModel = require('../../model/Matrimony');

const getAllApplyApplication = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let userId = req.user._id;

        // Find matrimony profiles that belong to the current user AND have received applications
        // This shows profiles where others have applied to the current user's profile
        const result = await MatrimonyModel.find({
            userId: userId, // Profile belongs to current user
            'applyMatrimony.0': { $exists: true }, // Has at least one application
            applyMatrimony: { $elemMatch: { applyMatrimonyStatus: true } } // Has active applications
        })
            .populate('userId', 'name email phone')
            .populate('applyMatrimony.applyUserId', 'name email phone')
            .skip(skip)
            .limit(limit);

        const total = await MatrimonyModel.countDocuments({
            userId: userId,
            'applyMatrimony.0': { $exists: true },
            applyMatrimony: { $elemMatch: { applyMatrimonyStatus: true } }
        });
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'All applications retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getAllApplyApplication };

