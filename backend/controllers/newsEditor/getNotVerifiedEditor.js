let editorModel = require('../../model/EditorModel');

const getNotVerifiedUser = async (req, res) => {
    try {  
        let role=req.user.role;
        if(role!=='ADMIN'){
            return res.json({message: 'Unauthorized access', status: 403, data: {}, success: false, error: true});
        }
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await editorModel.find({isVerified: false}).skip(skip).limit(limit).populate('userId', 'name email ');
        const total = await editorModel.countDocuments({isVerified: false});
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Not verified editor retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

            }
};

module.exports = { getNotVerifiedUser };


