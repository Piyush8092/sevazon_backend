let leadModel = require('../../model/leadModel');

const getQueryLead = async (req, res) => {
    try {
        let query = req.query.query;

        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }

        // Fetch all matching leads without pagination
        const result = await leadModel
            .find({serviceRequire: {$regex: query, $options: 'i'}})
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone');

        const total = await leadModel.countDocuments({
            serviceRequire: {$regex: query, $options: 'i'}
        });

        if(!result || result.length === 0){
            return res.status(404).json({message: 'No data found'});
        }

        res.json({
            message: 'Leads retrieved successfully',
            status: 200,
            data: result,
            total,
            totalPages: 1,
            currentPage: 1,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getQueryLead };

