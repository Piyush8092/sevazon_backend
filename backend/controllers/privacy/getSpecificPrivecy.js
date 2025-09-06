let PrivacyPolicyModel = require('../../model/privacyModel');

const getSpecificPrivacyPolicy = async (req, res) => {
    try {       
        let id = req.params.id;
        const result = await PrivacyPolicyModel.findById(id);
        if (!result) {
            return res.status(404).json({
                message: 'Privacy policy not found', 
                status: 404, 
                data: {}, 
                success: false, 
                error: true
            });
        }

        res.json({
            message: 'Privacy policy retrieved successfully', 
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

module.exports = { getSpecificPrivacyPolicy };


