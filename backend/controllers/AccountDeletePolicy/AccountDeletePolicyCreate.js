let AccountDeletionModel = require('../../model/AccountDeletionModel');

const createAccountDeletePolicy = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Check admin authorization
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        // console.log(payload.title)
        // Validate required fields according to schema
        if (!payload.title ) {
            return res.status(400).json({
                message: 'Title and lastUpdated are required fields',
                status: 400,
                success: false,
                error: true
            });
        }
        
        // Validate sections array if provided
        if (payload.sections && Array.isArray(payload.sections)) {
            for (let section of payload.sections) {
                if (!section.number || !section.title) {
                    return res.status(400).json({
                        message: 'Section number and title are required for each section',
                        status: 400,
                        success: false,
                        error: true
                    });
                }
            }
        }
        
        const newAccountDeletion = new AccountDeletionModel(payload);
        const result = await newAccountDeletion.save();
        
        res.json({
            message: 'Account deletion policy created successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    }
    catch (e) {
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

module.exports = { createAccountDeletePolicy };
