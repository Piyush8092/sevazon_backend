let MatrimonyModel = require('../../model/Matrimony');


const cancelMatrimonyRequest = async (req, res) => {
    try {
        const matrimonyId = req.params.id;
        const userId = req.user._id;
        console.log(`[cancelMatrimonyRequest] userId: ${userId}, profileId: ${matrimonyId}`);
        // Find the matrimony profile
        const ExistMatrimony = await MatrimonyModel.findById(matrimonyId);
        if (!ExistMatrimony) {
            return res.status(404).json({ success: false, message: 'Matrimony profile not found', data: null });
        }
        // Find the application by the current user
        const applicationIndex = ExistMatrimony.applyMatrimony.findIndex(
            app => app.applyUserId.toString() === userId.toString()
        );
        if (applicationIndex === -1) {
            return res.status(404).json({ success: false, message: 'No application found for this profile', data: null });
        }
        // Remove the application from the array
        ExistMatrimony.applyMatrimony.splice(applicationIndex, 1);
        // Save the updated matrimony profile
        await ExistMatrimony.save();
        console.log(`[cancelMatrimonyRequest] Application cancelled: userId=${userId}, profileId=${matrimonyId}`);
        return res.json({
            success: true,
            message: 'Matrimony request cancelled successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[cancelMatrimonyRequest] Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            data: e.message || e
        });
    }
};

module.exports = { cancelMatrimonyRequest };

