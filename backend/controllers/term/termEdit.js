let TermsAndConditionsModel = require('../../model/termModel');

const editTermsAndConditions = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        // Check admin authorization
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        // Check if terms and conditions exists
        const existingTerms = await TermsAndConditionsModel.findById(id);
        if (!existingTerms) {
            return res.status(404).json({
                message: 'Terms and conditions not found',
                status: 404,
                success: false,
                error: true
            });
        }
        
        // Validate required fields if being updated
        if (payload.title !== undefined && !payload.title) {
            return res.status(400).json({
                message: 'Title cannot be empty',
                status: 400,
                success: false,
                error: true
            });
        }
        
        // Validate sections array if being updated
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
        
        const result = await TermsAndConditionsModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Terms and conditions updated successfully', 
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

module.exports = { editTermsAndConditions };
