const serviceListModel = require('../../model/ServiceListModel');

const updateServiceListDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        let userId = req.user._id;
        let existUser = await serviceListModel.findById({_id: id});
        
        if (!existUser) {
            return res.status(400).json({message: 'not specific user exist'});
        }

        if (userId != existUser.userId) {
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await serviceListModel.findByIdAndUpdate({_id: id}, payload, {new: true});
        res.json({message: 'Service List updated successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};
        
module.exports = { updateServiceListDetail };
