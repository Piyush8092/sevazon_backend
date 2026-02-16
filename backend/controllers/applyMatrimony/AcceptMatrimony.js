let MatrimonyModel = require('../../model/Matrimony');


const acceptMatrimony = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const userId = req.user._id;
        console.log(`[acceptMatrimony] userId: ${userId}, profileId: ${id}, index: ${req.params.index}`);
        const ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({ success: false, message: 'Matrimony profile not found', data: null });
        }
        if (ExistMatrimony.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'You cannot accept this profile', data: null });
        }
        const index = req.params.index;
        if (ExistMatrimony.applyMatrimony[index].accept === true) {
            return res.status(409).json({ success: false, message: 'You have already accepted this profile', data: null });
        }
        if (ExistMatrimony.applyMatrimony[index].reject === true) {
            return res.status(409).json({ success: false, message: 'You have already rejected this profile', data: null });
        }
        ExistMatrimony.applyMatrimony[index].accept = payload.accept;
        ExistMatrimony.applyMatrimony[index].status = 'Accepted';
        await ExistMatrimony.save();
        console.log(`[acceptMatrimony] Application accepted: userId=${userId}, profileId=${id}, index=${index}`);
        return res.json({
            success: true,
            message: 'Matrimony application accepted successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[acceptMatrimony] Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            data: e.message || e
        });
    }
};

module.exports = { acceptMatrimony };


