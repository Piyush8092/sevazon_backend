let NewsPostModel = require('../../model/NewsPost');
let userModel = require('../../model/userModel');

const queryNews = async (req, res) => {
    try {
        let query = req.query.query;
        let location = req.query.location; // Optional location filter
        let category = req.query.category; // Optional category filter

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {};

        // If query parameter is provided, search across multiple fields
        if (query) {
            let regexQuery = new RegExp(query, 'i');
            searchQuery.$or = [
                { title: regexQuery },
                { description: regexQuery },
                { hashtag: regexQuery },
                { mentions: regexQuery },
                { content: regexQuery },
            ];
        }

        // Add location filter if provided
        if (location) {
            searchQuery.location = location;
        }

        // Add category filter if provided
        if (category && category !== 'All') {
            searchQuery.category = category;
        }

        // Get user's blocked authors list (if authenticated)
        if (req.user && req.user._id) {
            const user = await userModel.findById(req.user._id).select('blockedNewsAuthors');
            if (user && user.blockedNewsAuthors && user.blockedNewsAuthors.length > 0) {
                // Exclude news from blocked authors
                searchQuery.userId = {$nin: user.blockedNewsAuthors};
            }
        }

        const result = await NewsPostModel.find(searchQuery).skip(skip).limit(limit).populate('userId', 'name email ');
        const total = await NewsPostModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'News retrieved successfully', 
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

module.exports = { queryNews };
