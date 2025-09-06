let AccountDeletionModel = require('../../model/AccountDeletionModel');

const deleteAccountDeletePolicy = async (req, res) => {
    try {       
        let id = req.params.id;
       if(req.user.role!=='ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        const result = await AccountDeletionModel.findByIdAndDelete(id);
        res.json({message: 'Account deletion policy deleted successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { deleteAccountDeletePolicy };


