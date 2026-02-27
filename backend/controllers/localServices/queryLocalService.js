const LocalServiceModel = require("../../model/localServices");

 
const queryLocalServices = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search across multiple fields based on the local service model
        const searchQuery = {
            $or: [
                { profileId: regexQuery },
                { title: regexQuery },
                { yourNameBusinessInstituteFirmOrganisation: regexQuery },
                { selectCategory: regexQuery },
                { selectSubCategory: regexQuery },
                { subCategoryOther: regexQuery },
                { address: regexQuery },
                { pincode: regexQuery },
                { description: regexQuery },
                { locationURL: regexQuery },
                { timing: regexQuery },
                { experience: regexQuery },
                { establishedInYear: regexQuery },                
                { workServiceImages: regexQuery },
                { catalogImages: regexQuery },
                { timeSlot: regexQuery },
                { importantLink: regexQuery },
            ]
        };
        
        const result = await LocalServiceModel.find(searchQuery).skip(skip).limit(limit);
        const total = await LocalServiceModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Local services retrieved successfully', 
            status: 200, 
            data: result,
            total,
            totalPages,
            currentPage: page,
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

module.exports = { queryLocalServices };