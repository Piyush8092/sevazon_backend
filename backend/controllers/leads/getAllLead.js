let leadModel = require('../../model/leadModel');

const getAllLead = async (req, res) => {
    try {
        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering

        // Fetch all leads without pagination
        let result = await leadModel
            .find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone pincode'); // Include pincode in populated user data

        // Filter by pincode if provided (location-based filtering)
        // Since leads don't have their own pincode, we filter based on the creator's (userId) pincode
        if (pincode) {
            result = result.filter(lead => lead.userId && lead.userId.pincode === pincode);
        }

        const total = result.length;

        res.json({
            message: 'Leads fetched successfully',
            status: 200,
            data: result,
            success: true,
            error: false,
            total,
            totalPages: 1
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getAllLead };
