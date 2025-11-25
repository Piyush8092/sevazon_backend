let PropertyModel = require('../../model/property');

const getAllProperty = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await PropertyModel.find( {userId:{$nin: [req.user._id]}}).skip(skip).limit(limit);
        const total = await PropertyModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Property created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllProperty };
