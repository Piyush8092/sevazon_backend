let AccountDeletionModel = require('../../model/AccountDeletionModel');

const editAccountDeletePolicy = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        if(req.user.role!=='ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        const result = await AccountDeletionModel.findByIdAndUpdate(id, payload, {new: true});
        res.json({message: 'Account deletion policy updated successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { editAccountDeletePolicy };


