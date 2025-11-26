let serviceListModel = require('../../model/ServiceListModel');

const GetAllServiceListName = async (req, res) => {
    try {
        // Get all unique category names
        const result = await serviceListModel.find().distinct('name');

        // Create object with category names as keys and subcategories as values
        const categoriesObject = {};

        await Promise.all(
            result.map(async (categoryName) => {
                const subResult = await serviceListModel.find({name: categoryName}).distinct('subService.name');
                // Only add categories that have subcategories
                if (subResult.length > 0) {
                    categoriesObject[categoryName] = subResult;
                }
            })
        );

        res.json({
            message: 'Service categories retrieved successfully',
            status: 200,
            data: categoriesObject,
            success: true,
            error: false
        });
    }
    
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { GetAllServiceListName };


