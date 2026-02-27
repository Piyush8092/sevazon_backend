let serviceListModel = require('../../model/ServiceListModel');

const queryServiceList = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search in both name and subService names
        const searchQuery = {
            $or: [
                { name: regexQuery },
                { 'subService.name': regexQuery },
                
            ]
        };
        
        const result = await serviceListModel.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await serviceListModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Service List retrieved successfully', 
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
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { queryServiceList };
