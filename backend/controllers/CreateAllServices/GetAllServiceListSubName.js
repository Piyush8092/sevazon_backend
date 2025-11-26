let serviceListModel = require('../../model/ServiceListModel');

const GetAllServiceListSubName = async (req, res) => {
    try {  
        let categoryName = req.params.categoryName;
        const result = await serviceListModel.find({name:categoryName}).distinct('subService.name');
        res.json({message: 'Service List created successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { GetAllServiceListSubName };



