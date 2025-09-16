let userModel = require('../../model/userModel');

const adminAllUserView = async (req, res) => {
    try {  

            let page = req.query.page || 1;
            let limit = req.query.limit || 10;
            const skip = (page - 1) * limit;

            let role=req.user.role;
            if(role!=='ADMIN'){
                return res.json({message: 'Unauthorized access', status: 403, data: {}, success: false, error: true});
            }
            const result = await userModel.find().skip(skip).limit(limit);
            const total = await userModel.countDocuments();
            const totalPages = Math.ceil(total / limit);

            res.json({message: 'User detail retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

            }
};

module.exports = { adminAllUserView };

