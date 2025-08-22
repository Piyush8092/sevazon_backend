let NewsPostModel = require('../../model/NewsPost');

const createNews = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields according to new model
        if (!payload.title || !payload.description || !payload.hashtag || !payload.content) {
            return res.status(400).json({message: 'Title, description, hashtag and content are required'});
        }

        // Validate newsImages array
        if (!payload.newsImages || !Array.isArray(payload.newsImages) || 
            payload.newsImages.length < 1 || payload.newsImages.length > 5) {
            return res.status(400).json({message: 'Minimum 1 and maximum 5 news images are required'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        // Check if user exists and has proper role
        if (req.user.role !== 'EDITOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Only editors and admins can create news'});
        }

        // Set user ID and default values
        payload.userId = userId;
        payload.isActive = true;
        payload.isVerified = false;
        payload.likes = [];
        payload.dislikes = [];
        payload.comments = [];
        payload.shares = 0;

        const newNews = new NewsPostModel(payload);
        const result = await newNews.save();

        res.json({
            message: 'News created successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
        // Handle validation errors
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { createNews };
