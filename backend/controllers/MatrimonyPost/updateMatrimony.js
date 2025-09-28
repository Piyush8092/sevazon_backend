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
        if (ExistMatrimony.userId.toString() !== UserId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate nested objects if being updated
        if (payload.partnerAge && Array.isArray(payload.partnerAge)) {
            if (payload.partnerAge.length === 0) {
                return res.status(400).json({message: 'Partner age array cannot be empty'});
            }
        }

        if (payload.partnerHeight && Array.isArray(payload.partnerHeight)) {
            if (payload.partnerHeight.length === 0) {
                return res.status(400).json({message: 'Partner height array cannot be empty'});
            }
        }

        // Validate array fields if being updated
        if (payload.motherTongue && Array.isArray(payload.motherTongue)) {
            const validMotherTongue = ['Hindi', 'English', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Urdu', 'Other'];
            if (!payload.motherTongue.every(tongue => validMotherTongue.includes(tongue))) {
                return res.status(400).json({message: 'Invalid mother tongue value'});
            }
        }

        if (payload.height && Array.isArray(payload.height)) {
            if (payload.height.length === 0) {
                return res.status(400).json({message: 'Height array cannot be empty'});
            }
        }

        if (payload.religion && Array.isArray(payload.religion)) {
            if (payload.religion.length === 0) {
                return res.status(400).json({message: 'Religion array cannot be empty'});
            }
        }

        if (payload.caste && Array.isArray(payload.caste)) {
            if (payload.caste.length === 0) {
                return res.status(400).json({message: 'Caste array cannot be empty'});
            }
        }

        if (payload.profession && Array.isArray(payload.profession)) {
            if (payload.profession.length === 0) {
                return res.status(400).json({message: 'Profession array cannot be empty'});
            }
        }

        if (payload.highestQualification && Array.isArray(payload.highestQualification)) {
            if (payload.highestQualification.length === 0) {
                return res.status(400).json({message: 'Highest qualification array cannot be empty'});
            }
        }

        if (payload.employmentType && Array.isArray(payload.employmentType)) {
            const validEmploymentType = ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'];
            if (!payload.employmentType.every(type => validEmploymentType.includes(type))) {
                return res.status(400).json({message: 'Invalid employment type value'});
            }
        }

        if (payload.city && Array.isArray(payload.city)) {
            if (payload.city.length === 0) {
                return res.status(400).json({message: 'City array cannot be empty'});
            }
        }

        if (payload.state && Array.isArray(payload.state)) {
            if (payload.state.length === 0) {
                return res.status(400).json({message: 'State array cannot be empty'});
            }
        }

        if (payload.pincode && Array.isArray(payload.pincode)) {
            if (payload.pincode.length === 0) {
                return res.status(400).json({message: 'Pincode array cannot be empty'});
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
