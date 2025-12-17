let offerModel = require('../../model/OfferModel');
const userModel = require('../../model/userModel');

const UpdateReportAndBlockOffer = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        let report = payload.report;
        let block = payload.block;
        let reportAndBlockID = userId;
        
        let ExistOffer = await offerModel.findById(id);
        if (!ExistOffer) {
            return res.status(404).json({message: 'Offer not found'});
        }
        
        if (ExistOffer.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        // Check if user already reported and blocked
        const alreadyReported = ExistOffer.reportAndBlock.some(
            (r) => r.reportAndBlockID.toString() === userId.toString()
        );
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this offer' });
        }
        
        ExistOffer.reportAndBlock.push({ report: report, block: block, reportAndBlockID: userId });
        const result = await ExistOffer.save();
        
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.offerReportAndBlockID.includes(id)) {
            return res.status(400).json({ message: 'You have already reported this offer' });
        }
        
        user.offerReportAndBlockID.push(id);
        await user.save();
        
        res.json({
            message: 'Report and block added successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    } catch (e) {
        res.status(500).json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { UpdateReportAndBlockOffer };

