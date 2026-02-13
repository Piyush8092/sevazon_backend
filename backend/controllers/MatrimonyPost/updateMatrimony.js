let MatrimonyModel = require('../../model/Matrimony');
const userModel = require('../../model/userModel');
const VerifiedPhone = require('../../model/verifiedPhoneModel');

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

        // Validate partnerAge array if being updated - each object must have min and max
        if (payload.partnerAge) {
            if (!Array.isArray(payload.partnerAge) || payload.partnerAge.length === 0) {
                return res.status(400).json({message: 'Partner age preferences must be a non-empty array'});
            }

            for (let ageRange of payload.partnerAge) {
                if (!ageRange.min || !ageRange.max) {
                    return res.status(400).json({message: 'Partner age range must have both min and max values'});
                }
                if (ageRange.min >= ageRange.max) {
                    return res.status(400).json({message: 'Partner minimum age must be less than maximum age'});
                }
            }
        }

        // Validate partnerHeight array if being updated - each object must have min and max
        if (payload.partnerHeight) {
            if (!Array.isArray(payload.partnerHeight) || payload.partnerHeight.length === 0) {
                return res.status(400).json({message: 'Partner height preferences must be a non-empty array'});
            }

            for (let heightRange of payload.partnerHeight) {
                if (!heightRange.min || !heightRange.max) {
                    return res.status(400).json({message: 'Partner height range must have both min and max values'});
                }
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
            if (payload.employmentType.length === 0) {
                return res.status(400).json({message: 'Employment type array cannot be empty'});
            }
            if (!payload.employmentType.every(type => validEmploymentType.includes(type))) {
                return res.status(400).json({message: 'Invalid employment type value'});
            }
        }

        // Validate annual income array if being updated
        if (payload.annualIncome && Array.isArray(payload.annualIncome)) {
            const validAnnualIncome = ['Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs', '3-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20+ Lakhs'];
            if (payload.annualIncome.length === 0) {
                return res.status(400).json({message: 'Annual income array cannot be empty'});
            }
            if (!payload.annualIncome.every(income => validAnnualIncome.includes(income))) {
                return res.status(400).json({message: 'Invalid annual income value'});
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

        // Validate partner preference arrays if being updated
        if (payload.partnerMaritalStatus) {
            if (!Array.isArray(payload.partnerMaritalStatus) || payload.partnerMaritalStatus.length === 0) {
                return res.status(400).json({message: 'Partner marital status must be a non-empty array'});
            }
        }

        if (payload.partnerCity && Array.isArray(payload.partnerCity)) {
            if (payload.partnerCity.length === 0) {
                return res.status(400).json({message: 'Partner city array cannot be empty'});
            }
        }

        if (payload.partnerState && Array.isArray(payload.partnerState)) {
            if (payload.partnerState.length === 0) {
                return res.status(400).json({message: 'Partner state array cannot be empty'});
            }
        }

        if (payload.partnerEmploymentType && Array.isArray(payload.partnerEmploymentType)) {
            const validEmploymentType = ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'];
            if (payload.partnerEmploymentType.length === 0) {
                return res.status(400).json({message: 'Partner employment type array cannot be empty'});
            }
            if (!payload.partnerEmploymentType.every(type => validEmploymentType.includes(type))) {
                return res.status(400).json({message: 'Invalid partner employment type value'});
            }
        }

        if (payload.partnerReligion && Array.isArray(payload.partnerReligion)) {
            if (payload.partnerReligion.length === 0) {
                return res.status(400).json({message: 'Partner religion array cannot be empty'});
            }
        }

        if (payload.partnerMotherTongue) {
            const validMotherTongue = ['Hindi', 'English', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Urdu', 'Other'];
            if (!validMotherTongue.includes(payload.partnerMotherTongue)) {
                return res.status(400).json({message: 'Invalid partner mother tongue value'});
            }
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

        // Validate single value employment type if being updated (not array)
        if (payload.employmentType && !Array.isArray(payload.employmentType)) {
            const validEmploymentType = ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'];
            if (!validEmploymentType.includes(payload.employmentType)) {
                return res.status(400).json({message: 'Invalid employment type value'});
            }
        }

        // Validate single value annual income if being updated (not array)
        if (payload.annualIncome && !Array.isArray(payload.annualIncome)) {
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

        // Validate contactNumber if being updated
        if (payload.contactNumber && payload.contactNumber.trim() !== '') {
            const user = await userModel.findById(UserId);
            const registeredPhone = user.phone?.toString() || '';
            const cleanedContact = payload.contactNumber.toString().replace(/\D/g, '');
            const last10Digits = cleanedContact.slice(-10);

            // If it's not the registered phone, check if it's verified
            if (registeredPhone !== last10Digits) {
                const isVerified = await VerifiedPhone.isPhoneVerified(UserId, last10Digits);
                if (!isVerified) {
                    return res.status(400).json({
                        message: 'Contact number must be verified via OTP before updating matrimony profile. Please verify the phone number first.',
                        status: 400,
                        success: false,
                        error: true,
                        data: {
                            phoneNotVerified: true,
                            phone: last10Digits
                        }
                    });
                }
                console.log(`✅ Alternative contact number ${last10Digits} is verified for user ${UserId}`);
            } else {
                console.log(`✅ Using registered phone ${registeredPhone} as contact number - no verification needed`);
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
