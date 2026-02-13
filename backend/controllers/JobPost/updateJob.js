let jobModel = require('../../model/jobmodel');
const userModel = require('../../model/userModel');
const VerifiedPhone = require('../../model/verifiedPhoneModel');

const updateJob = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistJob = await jobModel.findById(id);
        if (!ExistJob) {
            return res.status(404).json({message: 'Job not found'});
        }

        let UserId = req.user._id;
        if (ExistJob.userId.toString() !== UserId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate array fields if being updated
        if (payload.workShift && (!Array.isArray(payload.workShift) || payload.workShift.length === 0)) {
            return res.status(400).json({message: 'Work shift must be a non-empty array'});
        }
        if (payload.workMode && (!Array.isArray(payload.workMode) || payload.workMode.length === 0)) {
            return res.status(400).json({message: 'Work mode must be a non-empty array'});
        }
        if (payload.workType && (!Array.isArray(payload.workType) || payload.workType.length === 0)) {
            return res.status(400).json({message: 'Work type must be a non-empty array'});
        }

        // Validate sub-category other field if being updated
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-category other field is required when Other is selected'});
        }

        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : ExistJob.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || ExistJob.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }

            // Check if phone number is verified (unless it's the user's registered phone)
            let userId = req.user._id;
            const user = await userModel.findById(userId);
            const registeredPhone = user.phone?.toString() || '';
            const cleanedPhone = phoneNumber.toString().replace(/\D/g, '');
            const last10Digits = cleanedPhone.slice(-10);

            // If it's not the registered phone, check if it's verified
            if (registeredPhone !== last10Digits) {
                const isVerified = await VerifiedPhone.isPhoneVerified(userId, last10Digits);
                if (!isVerified) {
                    return res.status(400).json({
                        message: 'Phone number must be verified via OTP before updating the job post. Please verify the phone number first.',
                        status: 400,
                        success: false,
                        error: true,
                        data: {
                            phoneNotVerified: true,
                            phone: last10Digits
                        }
                    });
                }
                console.log(`✅ Alternative phone ${last10Digits} is verified for user ${userId}`);
            } else {
                console.log(`✅ Using registered phone ${registeredPhone} - no verification needed`);
            }
        } else if (payload.allowCallViaPhone === false) {
            // If call via phone is disabled, set phone number to null
            payload.phoneNumberForCalls = null;
        }

        // Validate salary range if both values are being updated
        const salaryFrom = payload.salaryFrom !== undefined ? payload.salaryFrom : ExistJob.salaryFrom;
        const salaryTo = payload.salaryTo !== undefined ? payload.salaryTo : ExistJob.salaryTo;
        if (salaryFrom >= salaryTo) {
            return res.status(400).json({message: 'Salary from must be less than salary to'});
        }

        // Validate enum values if being updated
        if (payload.salaryPer) {
            const validSalaryPer = ['Per Month', 'Per Year', 'Per Day', 'Per Hour'];
            if (!validSalaryPer.includes(payload.salaryPer)) {
                return res.status(400).json({message: 'Invalid salary period'});
            }
        }

        if (payload.workShift) {
            const validWorkShift = ['Day Shift', 'Night Shift'];
            if (!payload.workShift.every(shift => validWorkShift.includes(shift))) {
                return res.status(400).json({message: 'Invalid work shift value'});
            }
        }

        if (payload.workMode) {
            const validWorkMode = ['On-site', 'Remote', 'Hybrid'];
            if (!payload.workMode.every(mode => validWorkMode.includes(mode))) {
                return res.status(400).json({message: 'Invalid work mode value'});
            }
        }

        if (payload.workType) {
            const validWorkType = ['Full-time', 'Part-time', 'Intern'];
            if (!payload.workType.every(type => validWorkType.includes(type))) {
                return res.status(400).json({message: 'Invalid work type value'});
            }
        }

        const result = await jobModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Job updated successfully', 
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

module.exports = { updateJob };
