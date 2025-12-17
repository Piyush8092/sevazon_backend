let propertyModel = require('../../model/PropertyModel');
const userModel = require('../../model/userModel');

const UpdateReportAndBlockProperty = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        let report = payload.report;
        let block = payload.block;
        let reportAndBlockID = userId;
        
        let ExistProperty = await propertyModel.findById(id);
        if (!ExistProperty) {
            return res.status(404).json({message: 'Property not found'});
        }
        
        if (ExistProperty.userId.toString() === userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        // Check if user already reported and blocked
        const alreadyReported = ExistProperty.reportAndBlock.some(
            (r) => r.reportAndBlockID.toString() === userId.toString()
        );
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this property' });
        }
        
        ExistProperty.reportAndBlock.push({ report: report, block: block, reportAndBlockID: userId });
        const result = await ExistProperty.save();
        
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.propertyReportAndBlockID.includes(id)) {
            return res.status(400).json({ message: 'You have already reported this property' });
        }
        
        user.propertyReportAndBlockID.push(id);
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

module.exports = { UpdateReportAndBlockProperty };

