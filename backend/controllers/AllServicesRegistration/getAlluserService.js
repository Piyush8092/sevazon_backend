 let createServiceModel = require('../../model/createAllServiceProfileModel');
const getAllUserService = async (req, res) => {
    try {  
         let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await createServiceModel.find().skip(skip).limit(limit);
        const total = await createServiceModel.countDocuments();
        const totalPages = Math.ceil(total / limit);
        res.json({message: 'User services retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllUserService };

