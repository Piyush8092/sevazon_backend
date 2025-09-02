let jobModel = require('../../model/jobmodel');

const createJob = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields
        if ( !payload.title || !payload.yourNameBusinessInstituteFirmCompany || 
            !payload.selectCategory || !payload.selectSubCategory || !payload.address || 
            !payload.pincode || !payload.description || !payload.salaryFrom || 
            !payload.salaryTo || !payload.salaryPer || !payload.requiredExperience || 
            !payload.workShift || !payload.workMode || !payload.workType ||
            payload.allowCallInApp === undefined  || 
            payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate array fields
        if (!Array.isArray(payload.workShift) || payload.workShift.length === 0) {
            return res.status(400).json({message: 'Work shift is required'});
        }
        if (!Array.isArray(payload.workMode) || payload.workMode.length === 0) {
            return res.status(400).json({message: 'Work mode is required'});
        }
        if (!Array.isArray(payload.workType) || payload.workType.length === 0) {
            return res.status(400).json({message: 'Work type is required'});
        }

        // Validate sub-category other field
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-category other field is required when Other is selected'});
        }

       

        // Validate salary range
        if (payload.salaryFrom >= payload.salaryTo) {
            return res.status(400).json({message: 'Salary from must be less than salary to'});
        }

        // Validate enum values
        const validSalaryPer = ['Per Month', 'Per Year', 'Per Day', 'Per Hour'];
        if (!validSalaryPer.includes(payload.salaryPer)) {
            return res.status(400).json({message: 'Invalid salary period'});
        }

        const validWorkShift = ['Day Shift', 'Night Shift'];
        if (!payload.workShift.every(shift => validWorkShift.includes(shift))) {
            return res.status(400).json({message: 'Invalid work shift value'});
        }

        const validWorkMode = ['On-site', 'Remote', 'Hybrid'];
        if (!payload.workMode.every(mode => validWorkMode.includes(mode))) {
            return res.status(400).json({message: 'Invalid work mode value'});
        }

        const validWorkType = ['Full-time', 'Part-time', 'Intern'];
        if (!payload.workType.every(type => validWorkType.includes(type))) {
            return res.status(400).json({message: 'Invalid work type value'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        payload.userId = userId;
        payload.phoneNumberForCalls = req.user.phone;
        payload.isVerified = true;

        const newJob = new jobModel(payload);
        const result = await newJob.save();

        res.json({
            message: 'Job created successfully', 
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

module.exports = { createJob };
