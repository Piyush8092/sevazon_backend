let leadModel = require('../../model/leadModel');

const getLeadCreaterView = async (req, res) => {
    try {  

        let userId = req.user._id;
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;

        const skip = (page - 1) * limit;
        const result = await leadModel.find({userId: userId}).skip(skip).limit(limit);
        const total = await leadModel.countDocuments({userId: userId});
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Lead created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getLeadCreaterView };

