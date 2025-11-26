let NewsPostModel = require('../../model/NewsPost');

const getAllNews = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let location = req.query.location; // Optional location filter
        const skip = (page - 1) * limit;

        // Build query filter
        let queryFilter = {userId:{$nin: [req.user._id]}};

        // Add location filter if provided
        if (location) {
            queryFilter.location = location;
        }

        const result = await NewsPostModel.find(queryFilter).skip(skip).limit(limit).populate('userId', 'name email ');
        const total = await NewsPostModel.countDocuments(queryFilter);
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'News created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllNews };


