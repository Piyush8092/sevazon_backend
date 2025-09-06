let AccountDeletionModel = require('../../model/AccountDeletionModel');

const getSpecificAccountDeletePolicy = async (req, res) => {
    try {       
        let id = req.params.id;
        const result = await AccountDeletionModel.findById(id);
        if (!result) {
            return res.status(404).json({
                message: 'Account deletion policy not found', 
                status: 404, 
                data: {}, 
                success: false, 
                error: true
            });
        }
        res.json({
            message: 'Account deletion policy retrieved successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getSpecificAccountDeletePolicy };



