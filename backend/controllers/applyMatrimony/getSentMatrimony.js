let MatrimonyModel = require('../../model/Matrimony');

const getSentMatrimony = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let userId = req.user._id;

        // Find all matrimony profiles where the current user has applied
        const result = await MatrimonyModel.find({
            'applyMatrimony.applyUserId': userId
        })
        .populate('userId', 'name email phone')
        .populate('applyMatrimony.applyUserId', 'name email phone')
        .skip(skip)
        .limit(limit);

        // Filter to only return profiles where user has applied
        // and extract the application status for each profile
        const sentRequests = result.map(matrimony => {
            // Find the user's application in this profile
            const userApplication = matrimony.applyMatrimony.find(
                app => app.applyUserId._id.toString() === userId.toString()
            );

            // Return the matrimony profile with application status
            return {
                ...matrimony.toObject(),
                applicationStatus: userApplication ? userApplication.status : 'Unknown',
                hasApplied: true,
                isPending: userApplication ? userApplication.status === 'Pending' : false
            };
        });

        const total = await MatrimonyModel.countDocuments({
            'applyMatrimony.applyUserId': userId
        });
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Sent matrimony requests retrieved successfully',
            status: 200,
            data: sentRequests,
            success: true,
            error: false,
            total,
            totalPages
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

module.exports = { getSentMatrimony };

