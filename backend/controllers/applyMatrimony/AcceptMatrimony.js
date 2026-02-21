let MatrimonyModel = require('../../model/Matrimony');


const acceptMatrimony = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const userId = req.user._id;
        const index = parseInt(req.params.index);
        
        console.log(`[acceptMatrimony] userId: ${userId}, profileId: ${id}, index: ${index}`);
        
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
                message: 'You cannot accept applications for this profile', 
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
                message: 'You have already accepted this application', 
                data: null 
            });
        }
        if (application.reject === true) {
            return res.status(409).json({ 
                success: false, 
                message: 'This application was already rejected', 
                data: null 
            });
        }
        
        // Update application status
        ExistMatrimony.applyMatrimony[index].accept = true;
        ExistMatrimony.applyMatrimony[index].reject = false;
        ExistMatrimony.applyMatrimony[index].status = 'Accepted';
        
        await ExistMatrimony.save();
        
        // Get the applicant's user ID
        const applicantUserId = application.applyUserId;
        
        // Find the applicant's matrimony profile and update it to show connection
        const applicantProfile = await MatrimonyModel.findOne({ userId: applicantUserId });
        if (applicantProfile) {
            // Check if connection already exists
            const existingConnectionIndex = applicantProfile.applyMatrimony.findIndex(
                app => app.applyUserId && app.applyUserId.toString() === userId.toString()
            );
            
            if (existingConnectionIndex !== -1) {
                // Update existing entry
                applicantProfile.applyMatrimony[existingConnectionIndex].accept = true;
                applicantProfile.applyMatrimony[existingConnectionIndex].reject = false;
                applicantProfile.applyMatrimony[existingConnectionIndex].status = 'Accepted';
            } else {
                // Create new entry showing the bidirectional connection
                applicantProfile.applyMatrimony.push({
                    applyUserId: userId,
                    applyMatrimonyStatus: true,
                    status: 'Accepted',
                    reject: false,
                    accept: true
                });
            }
            
            await applicantProfile.save();
            console.log(`[acceptMatrimony] ✅ Updated applicant's profile for bidirectional connection: applicantUserId=${applicantUserId}`);
        } else {
            console.log(`[acceptMatrimony] ⚠️ Applicant profile not found for userId=${applicantUserId}`);
        }
        
        console.log(`[acceptMatrimony] ✅ Application accepted: userId=${userId}, profileId=${id}, index=${index}`);
        
        return res.json({
            success: true,
            message: 'Matrimony application accepted successfully',
            data: ExistMatrimony
        });
    } catch (e) {
        console.error('[acceptMatrimony] ❌ Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while accepting the application',
            data: e.message || e
        });
    }
};

module.exports = { acceptMatrimony };


