let leadModel = require('../../model/leadModel');

const getQueryLead = async (req, res) => {
    try {
        let query = req.query.query;
        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering

        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }

        // Fetch all matching leads without pagination
        let result = await leadModel
            .find({serviceRequire: {$regex: query, $options: 'i'}})
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone pincode'); // Include pincode in populated user data

        // Filter by pincode if provided (location-based filtering)
        // Since leads don't have their own pincode, we filter based on the creator's (userId) pincode
        if (pincode) {
            result = result.filter(lead => lead.userId && lead.userId.pincode === pincode);
        }

        const total = result.length;

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

