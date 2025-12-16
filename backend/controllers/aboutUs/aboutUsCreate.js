let AboutUsModel = require('../../model/aboutUsModel');

const createAboutUs = async (req, res) => {
    try {       
        let payload = req.body;

        // Check admin authorization
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                message: 'Unauthorized access. Only admins can create About Us content.',
                status: 403,
                success: false,
                error: true
            });
        }

        // Validate required fields
        if (!payload.title || !payload.content) {
            return res.status(400).json({
                message: 'Title and content are required fields',
                status: 400,
                success: false,
                error: true
            });
        }

        // Set lastUpdated to current date
        payload.lastUpdated = new Date();

        const newAboutUs = new AboutUsModel(payload);
        const result = await newAboutUs.save();
        
        res.json({
            message: 'About Us content created successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { createAboutUs };

