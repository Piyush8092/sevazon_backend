let leadModel = require('../../model/leadModel');

const createLead = async (req, res) => {
    try {       
        let payload = req.body;

        if (!payload.serviceRequire) {
            return res.status(400).json({message: 'Service is required'});
        }

        payload.userId = req.user._id;
        
        const newLead = new leadModel(payload);
        const result = await newLead.save();

        res.json({
            message: 'Lead created successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { createLead };

