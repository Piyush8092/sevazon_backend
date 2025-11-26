let serviceListModel = require('../../model/ServiceListModel');

const GetAllServiceListName = async (req, res) => {
    try {  
        //make subctagory name unique object of array ,array conatin catagory name and subcatagory name
        const result = await serviceListModel.find().distinct('name');
        const subResult = await serviceListModel.find().distinct('subService.name');
        const finalResult = result.map((item) => ({
            category: item,
            subCategory: subResult
        }));


        res.json({message: 'Service List created successfully', status: 200, data: finalResult, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { GetAllServiceListName };


