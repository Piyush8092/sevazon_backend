let TermsAndConditionsModel = require('../../model/termModel');

const deleteTermsAndConditions = async (req, res) => {
    try {       
        let id = req.params.id;
        if(req.user.role!=='ADMIN'){
            return res.status(403).json({message: 'Unauthorized access'});
        }
        const result = await TermsAndConditionsModel.findByIdAndDelete(id);
        res.json({message: 'Terms and conditions deleted successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { deleteTermsAndConditions };


