let MatrimonyModel = require('../../model/Matrimony');

const createMatrimony = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields
        if (!payload.profileCreatedFor || !payload.fullName || !payload.dateOfBirth || 
            !payload.gender || !payload.motherTongue || !payload.maritalStatus || 
            !payload.height || !payload.religion || !payload.caste || 
            !payload.profession || !payload.highestQualification || !payload.employmentType || 
            !payload.pincode || !payload.city || !payload.state  ||
            !payload.partnerAge || !payload.partnerHeight || !payload.partnerMaritalStatus ||
            !payload.partnerReligion || !payload.partnerMotherTongue) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate nested objects
        if (!payload.partnerAge.min || !payload.partnerAge.max) {
            return res.status(400).json({message: 'Partner age range (min and max) is required'});
        }
        if (!payload.partnerHeight.min || !payload.partnerHeight.max) {
            return res.status(400).json({message: 'Partner height range (min and max) is required'});
        }

        // Validate age range
        if (payload.partnerAge.min >= payload.partnerAge.max) {
            return res.status(400).json({message: 'Partner minimum age must be less than maximum age'});
        }

        // Validate images array
        if (!payload.images || !Array.isArray(payload.images) || payload.images.length < 2) {
            return res.status(400).json({message: 'Minimum 2 images are required'});
        }

        // Validate array fields
        if (!Array.isArray(payload.partnerMaritalStatus) || payload.partnerMaritalStatus.length === 0) {
            return res.status(400).json({message: 'Partner marital status is required'});
        }

        // Validate enum values
        const validProfileCreatedFor = ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'];
        if (!validProfileCreatedFor.includes(payload.profileCreatedFor)) {
            return res.status(400).json({message: 'Invalid profile created for value'});
        }

        const validGender = ['Male', 'Female'];
        if (!validGender.includes(payload.gender)) {
            return res.status(400).json({message: 'Invalid gender value'});
        }

        const validMaritalStatus = ['Never Married', 'Divorced', 'Widowed', 'Separated'];
        if (!validMaritalStatus.includes(payload.maritalStatus)) {
            return res.status(400).json({message: 'Invalid marital status value'});
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

        if (!payload.partnerMaritalStatus.every(status => validMaritalStatus.includes(status))) {
            return res.status(400).json({message: 'Invalid partner marital status value'});
        }

        // Validate date of birth
        const dob = new Date(payload.dateOfBirth);
        if (isNaN(dob.getTime())) {
            return res.status(400).json({message: 'Invalid date of birth format'});
        }

        // Calculate age and validate
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
            return res.status(400).json({message: 'Age must be at least 18 years'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        payload.userId = userId;
        payload.isVerified = true;
        payload.contactNumber = req.user.phone;

        const newMatrimony = new MatrimonyModel(payload);
        const result = await newMatrimony.save();

        res.json({
            message: 'Matrimony profile created successfully', 
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

module.exports = { createMatrimony };
