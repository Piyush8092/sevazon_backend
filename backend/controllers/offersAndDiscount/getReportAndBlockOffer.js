const userModel = require('../../model/userModel');
const offerModel = require('../../model/OfferModel');

const getReportAndBlockOffer = async (req, res) => {
    try {
        let userId = req.user._id;
        let user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get all reported and blocked offers
        const reportedOffers = await offerModel.find({
            _id: { $in: user.offerReportAndBlockID }
        });
        
        res.json({
            message: 'Reported and blocked offers retrieved successfully',
            status: 200,
            data: reportedOffers,
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

module.exports = { getReportAndBlockOffer };

