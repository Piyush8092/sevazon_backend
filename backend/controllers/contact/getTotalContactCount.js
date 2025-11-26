let contactModel = require('../../model/contactModel');

const getTotalContactCount = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        let totalContactCount = await contactModel.countDocuments();
        res.json({
            message: 'Total contact count retrieved successfully',
            status: 200,
            data: totalContactCount,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getTotalContactCount };



