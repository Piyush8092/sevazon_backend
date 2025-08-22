let MatrimonyModel = require('../../model/Matrimony');

const updateMatrimony = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({message: 'Matrimony profile not found'});
        }

        let UserId = req.user._id;
        if (ExistMatrimony.userId.toString() !== UserId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate nested objects if being updated
        if (payload.partnerAge) {
            if (!payload.partnerAge.min || !payload.partnerAge.max) {
                return res.status(400).json({message: 'Partner age range (min and max) is required'});
            }
            if (payload.partnerAge.min >= payload.partnerAge.max) {
                return res.status(400).json({message: 'Partner minimum age must be less than maximum age'});
            }
        }

        if (payload.partnerHeight) {
            if (!payload.partnerHeight.min || !payload.partnerHeight.max) {
                return res.status(400).json({message: 'Partner height range (min and max) is required'});
            }
        }

        // Validate images array if being updated
        if (payload.images && (!Array.isArray(payload.images) || payload.images.length < 2)) {
            return res.status(400).json({message: 'Minimum 2 images are required'});
        }

        // Validate array fields if being updated
        if (payload.partnerMaritalStatus && (!Array.isArray(payload.partnerMaritalStatus) || payload.partnerMaritalStatus.length === 0)) {
            return res.status(400).json({message: 'Partner marital status must be a non-empty array'});
        }

        // Validate enum values if being updated
        if (payload.profileCreatedFor) {
            const validProfileCreatedFor = ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'];
            if (!validProfileCreatedFor.includes(payload.profileCreatedFor)) {
                return res.status(400).json({message: 'Invalid profile created for value'});
            }
        }

        if (payload.gender) {
            const validGender = ['Male', 'Female'];
            if (!validGender.includes(payload.gender)) {
                return res.status(400).json({message: 'Invalid gender value'});
            }
        }

        if (payload.maritalStatus) {
            const validMaritalStatus = ['Never Married', 'Divorced', 'Widowed', 'Separated'];
            if (!validMaritalStatus.includes(payload.maritalStatus)) {
                return res.status(400).json({message: 'Invalid marital status value'});
            }
        }

        if (payload.employmentType) {
            const validEmploymentType = ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'];
            if (!validEmploymentType.includes(payload.employmentType)) {
                return res.status(400).json({message: 'Invalid employment type value'});
            }
        }

        if (payload.annualIncome) {
            const validAnnualIncome = ['Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs', '3-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20+ Lakhs'];
            if (!validAnnualIncome.includes(payload.annualIncome)) {
                return res.status(400).json({message: 'Invalid annual income value'});
            }
        }

        if (payload.partnerMaritalStatus) {
            const validMaritalStatus = ['Never Married', 'Divorced', 'Widowed', 'Separated'];
            if (!payload.partnerMaritalStatus.every(status => validMaritalStatus.includes(status))) {
                return res.status(400).json({message: 'Invalid partner marital status value'});
            }
        }

        // Validate date of birth if being updated
        if (payload.dateOfBirth) {
            const dob = new Date(payload.dateOfBirth);
            if (isNaN(dob.getTime())) {
                return res.status(400).json({message: 'Invalid date of birth format'});
            }
            
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            if (age < 18) {
                return res.status(400).json({message: 'Age must be at least 18 years'});
            }
        }

        const result = await MatrimonyModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Matrimony profile updated successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
        // Handle validation errors
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { updateMatrimony };
