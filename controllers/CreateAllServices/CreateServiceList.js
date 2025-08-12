
const serviceListModel = require('../../model/ServiceListModel');

const createVarityServiceList = async (req, res) => {
    try {       
        let payload = req.body;
        if (!payload.name || !payload.image || !payload.subService) {
            return res.status(400).json({message: 'All fields are required'});
        }   
        const newService = new serviceListModel(payload);
        const result = await newService.save();

        res.json({message: 'Service created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { createVarityServiceList };
