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

        // Populate userId with user data (name, email, phone) before returning
        const populatedLead = await leadModel
            .findById(result._id)
            .populate('userId', 'name email phone');

        res.json({
            message: 'Lead created successfully',
            status: 200,
            data: populatedLead,
            success: true,
            error: false
        });

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { createLead };

