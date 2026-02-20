let leadModel = require('../../model/leadModel');
let userModel = require('../../model/userModel');

const createLead = async (req, res) => {
    try {

        let payload = req.body;

        if (!payload.serviceRequire) {
            return res.status(400).json({message: 'Service is required'});
        }

        payload.userId = req.user._id;

        // Only include serviceid and businessid if present in payload
        const leadData = {
            userId: payload.userId,
            serviceRequire: payload.serviceRequire,
        };
        if (payload.serviceid) leadData.serviceid = payload.serviceid;
        if (payload.businessid) leadData.businessid = payload.businessid;

        console.log('DEBUG: Creating lead with:', leadData);

        const newLead = new leadModel(leadData);
        const result = await newLead.save();
        console.log('DEBUG: Lead saved:', result);

        // Set AnyServiceCreate flag for user if not already set
        let user = await userModel.findById(req.user._id);
        if (user && user.AnyServiceCreate === false) {
            user.AnyServiceCreate = true;
            await user.save();
        }

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

