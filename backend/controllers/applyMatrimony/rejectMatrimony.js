let MatrimonyModel = require('../../model/Matrimony');


const rejectMatrimony = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const userId = req.user._id;
        const index = parseInt(req.params.index);
        
        console.log(`[rejectMatrimony] userId: ${userId}, profileId: ${id}, index: ${index}`);
        
        // Validate index
        if (isNaN(index) || index < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid application index', 
                data: null 
            });
        }
        
        const ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({ 
                success: false, 
                message: 'Matrimony profile not found', 
                data: null 
            });
        }
        
        // Verify ownership
        if (ExistMatrimony.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false, 
                message: 'You cannot reject applications for this profile', 
                data: null 
            });
        }
        
        // Check if application exists at index
        if (!ExistMatrimony.applyMatrimony[index]) {
            return res.status(404).json({ 
                success: false, 
                message: `No application found at index ${index}`, 
                data: null 
            });
        }
        
        const application = ExistMatrimony.applyMatrimony[index];
        
        // Check if already processed
        if (application.accept === true) {
            return res.status(409).json({ 
                success: false, 
                message: 'This application was already accepted', 
                data: null 
            });
        }
        if (application.reject === true) {
            return res.status(409).json({ 
                success: false, 
                message: 'You have already rejected this application', 
                data: null 
            });
        }
        
        // Update application status
        ExistMatrimony.applyMatrimony[index].reject = true;
        ExistMatrimony.applyMatrimony[index].accept = false;
        ExistMatrimony.applyMatrimony[index].status = 'Rejected';
        
        await ExistMatrimony.save();
        
        console.log(`[rejectMatrimony] ✅ Application rejected: userId=${userId}, profileId=${id}, index=${index}`);
        
        return res.json({
            success: true,
            message: 'Matrimony application rejected successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[rejectMatrimony] ❌ Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while rejecting the application',
            data: e.message || e
        });
    }
};

module.exports = { rejectMatrimony };



