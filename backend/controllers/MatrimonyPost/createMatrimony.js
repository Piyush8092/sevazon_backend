let MatrimonyModel = require('../../model/Matrimony');

const createMatrimony = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields - handle arrays properly
        if (!payload.profileCreatedFor || !payload.fullName || !payload.dateOfBirth || 
            !payload.gender || !payload.motherTongue || !Array.isArray(payload.motherTongue) || payload.motherTongue.length === 0 ||
            !payload.maritalStatus || !payload.height || !Array.isArray(payload.height) || payload.height.length === 0 ||
            !payload.religion || !Array.isArray(payload.religion) || payload.religion.length === 0 ||
            !payload.caste || !Array.isArray(payload.caste) || payload.caste.length === 0 ||
            !payload.profession || !Array.isArray(payload.profession) || payload.profession.length === 0 ||
            !payload.highestQualification || !Array.isArray(payload.highestQualification) || payload.highestQualification.length === 0 ||
            !payload.employmentType || !Array.isArray(payload.employmentType) || payload.employmentType.length === 0 ||
            !payload.pincode || !Array.isArray(payload.pincode) || payload.pincode.length === 0 ||
            !payload.city || !Array.isArray(payload.city) || payload.city.length === 0 ||
            !payload.state || !Array.isArray(payload.state) || payload.state.length === 0 ) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Remove the nested object validation for partnerAge and partnerHeight since they're arrays now
        // if (!payload.partnerAge.min || !payload.partnerAge.max) {
        //     return res.status(400).json({message: 'Partner age range (min and max) is required'});
        // }
        // if (!payload.partnerHeight.min || !payload.partnerHeight.max) {
        //     return res.status(400).json({message: 'Partner height range (min and max) is required'});
        // }

        // Remove age range validation since partnerAge is now an array
        // if (payload.partnerAge.min >= payload.partnerAge.max) {
        //     return res.status(400).json({message: 'Partner minimum age must be less than maximum age'});
        // }

        // Validate enum values for arrays
        if (payload.employmentType && Array.isArray(payload.employmentType)) {
            const validEmploymentType = ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'];
            if (!payload.employmentType.every(type => validEmploymentType.includes(type))) {
                return res.status(400).json({message: 'Invalid employment type value'});
            }
        }

        if (payload.annualIncome && Array.isArray(payload.annualIncome)) {
            const validAnnualIncome = ['Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs', '3-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20+ Lakhs'];
            if (!payload.annualIncome.every(income => validAnnualIncome.includes(income))) {
                return res.status(400).json({message: 'Invalid annual income value'});
            }
        }

        // Validate motherTongue array
        if (payload.motherTongue && Array.isArray(payload.motherTongue)) {
            const validMotherTongue = ['Hindi', 'English', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Urdu', 'Other'];
            if (!payload.motherTongue.every(tongue => validMotherTongue.includes(tongue))) {
                return res.status(400).json({message: 'Invalid mother tongue value'});
            }
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

        // Check if user has completed KYC verification
        if (!req.user.isKycVerified) {
            return res.status(403).json({
                message: 'Please complete KYC verification first',
                status: 403,
                success: false,
                error: true,
                errorType: 'VERIFICATION_REQUIRED'
            });
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
