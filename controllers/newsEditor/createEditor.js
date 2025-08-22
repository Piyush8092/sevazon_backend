let editorModel = require('../../model/EditorModel');

const createEditor = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields according to EditorModel
        if (!payload.yourNameChannelMedia || !payload.userName || !payload.yourBio || 
            !payload.yourEmail || !payload.pincode || !payload.uploadAadhaarCard || 
            !payload.verifyAadhaarOrPanId || !payload.aboutYourself || 
            !payload.title || !payload.content) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        // Check if user exists
        let existUser = await editorModel.findOne({userId: userId});
        if (existUser) {
            return res.status(400).json({message: 'Editor profile already exists for this user'});
        }

        // Check if userName is unique
        let existingUserName = await editorModel.findOne({userName: payload.userName});
        if (existingUserName) {
            return res.status(400).json({message: 'Username already exists'});
        }

        payload.userId = userId;
        payload.isVerified = false;
        payload.isActive = true;

        const neweditor = new editorModel(payload);
        const result = await neweditor.save();

        res.json({
            message: 'Editor profile created successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
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
        
        if (e.code === 11000) {
            return res.status(400).json({
                message: 'Username already exists', 
                status: 400, 
                data: {}, 
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

module.exports = { createEditor };
