let MatrimonyModel = require('../../model/Matrimony');


const applyMatrimony = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;
        console.log(`[applyMatrimony] userId: ${userId}, profileId: ${id}`);
        const ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            console.log(`[applyMatrimony] Matrimony profile not found: ${id}`);
            return res.status(404).json({ success: false, message: 'Matrimony profile not found', data: null });
        }
        if (ExistMatrimony.userId.toString() === userId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot apply to your own profile', data: null });
        }

        // Prevent duplicate requests (idempotency)
        const existingApplicationIndex = ExistMatrimony.applyMatrimony.findIndex(
            app => app.applyUserId.toString() === userId.toString()
        );

        if (existingApplicationIndex !== -1) {
            const existingApp = ExistMatrimony.applyMatrimony[existingApplicationIndex];
            // If the previous application was rejected, allow re-apply by removing old
            if (existingApp.reject === true || existingApp.status === 'Rejected') {
                ExistMatrimony.applyMatrimony.splice(existingApplicationIndex, 1);
            } else if (existingApp.status === 'Pending' || existingApp.accept === true || existingApp.status === 'Accepted') {
                return res.status(409).json({ success: false, message: 'You have already applied to this profile', data: null });
            }
        }

        // Add new application
        ExistMatrimony.applyMatrimony.push({
            applyUserId: userId,
            applyMatrimonyStatus: true,
            status: 'Pending',
            reject: false,
            accept: false
        });

        await ExistMatrimony.save();
        console.log(`[applyMatrimony] Application submitted: userId=${userId}, profileId=${id}`);
        return res.json({
            success: true,
            message: 'Matrimony application submitted successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[applyMatrimony] Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            data: e.message || e
        });
    }
};

module.exports = { applyMatrimony };
