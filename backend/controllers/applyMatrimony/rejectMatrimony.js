let MatrimonyModel = require('../../model/Matrimony');


const rejectMatrimony = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const userId = req.user._id;
        console.log(`[rejectMatrimony] userId: ${userId}, profileId: ${id}, index: ${req.params.index}`);
        const ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({ success: false, message: 'Matrimony profile not found', data: null });
        }
        if (ExistMatrimony.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'You cannot reject this profile', data: null });
        }
        const index = req.params.index;
        if (ExistMatrimony.applyMatrimony[index].accept === true) {
            return res.status(409).json({ success: false, message: 'You have already accepted this profile', data: null });
        }
        if (ExistMatrimony.applyMatrimony[index].reject === true) {
            return res.status(409).json({ success: false, message: 'You have already rejected this profile', data: null });
        }
        ExistMatrimony.applyMatrimony[index].reject = payload.reject;
        ExistMatrimony.applyMatrimony[index].status = 'Rejected';
        await ExistMatrimony.save();
        console.log(`[rejectMatrimony] Application rejected: userId=${userId}, profileId=${id}, index=${index}`);
        return res.json({
            success: true,
            message: 'Matrimony application rejected successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[rejectMatrimony] Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            data: e.message || e
        });
    }
};

module.exports = { rejectMatrimony };



