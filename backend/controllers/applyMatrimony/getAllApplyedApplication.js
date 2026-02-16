let MatrimonyModel = require('../../model/Matrimony');


const getAllApplyApplication = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.user._id;
        console.log(`[getAllApplyApplication] userId: ${userId}, page: ${page}, limit: ${limit}`);
        // Find matrimony profiles that belong to the current user AND have received applications
        // This shows profiles where others have applied to the current user's profile
        const myProfiles = await MatrimonyModel.find({
            userId: userId, // Profile belongs to current user
            'applyMatrimony.0': { $exists: true }, // Has at least one application
            applyMatrimony: { $elemMatch: { applyMatrimonyStatus: true } } // Has active applications
        })
            .populate('userId', 'name email phone')
            .populate('applyMatrimony.applyUserId', 'name email phone');
        // Extract all applicant user IDs from the current user's profiles
        const applicantIds = new Set();
        myProfiles.forEach(profile => {
            profile.applyMatrimony.forEach(app => {
                if (app.applyMatrimonyStatus === true && app.applyUserId) {
                    applicantIds.add(app.applyUserId._id.toString());
                }
            });
        });
        // Now fetch the matrimony profiles of those applicants
        const applicantProfiles = await MatrimonyModel.find({
            userId: { $in: Array.from(applicantIds) }
        })
            .populate('userId', 'name email phone')
            .skip(skip)
            .limit(limit);
        const total = applicantIds.size;
        const totalPages = Math.ceil(total / limit);
        return res.json({
            success: true,
            message: 'All applications retrieved successfully',
            data: applicantProfiles,
            total,
            totalPages
        });
    } catch (e) {
        console.error('[getAllApplyApplication] Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            data: e.message || e
        });
    }
};

module.exports = { getAllApplyApplication };

