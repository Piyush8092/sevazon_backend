let MatrimonyModel = require('../../model/Matrimony');

const getAcceptMetrimony = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let userId = req.user._id;
const result = await MatrimonyModel.find({
  $and: [
    { userId: userId },
    { 'applyMatrimony.accept': true }
  ]
}).populate('userId', 'name email phone')
            .populate('applyMatrimony.applyUserId', 'name email phone')
            .skip(skip)
            .limit(limit);
        const total = await MatrimonyModel.countDocuments();
            const totalPages = Math.ceil(total / limit);

            res.json({message: 'All applications retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
        }
};

module.exports = { getAcceptMetrimony };

