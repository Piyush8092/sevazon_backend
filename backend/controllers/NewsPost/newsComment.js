let model = require('../../model/NewsPost');

const newsComment = async (req, res) => {
    try {       
        let news_id = req.params.news_id;
        let payload = req.body;
        let userId = req.user._id;
        
        // Validate required fields
        if (!payload.comment) {
            return res.status(400).json({
                message: 'Comment is required',
                status: 400,
                success: false,
                error: true
            });
        }
        
        // Find the news post
        let news = await model.findById(news_id);
        if (!news) {
            return res.status(404).json({
                message: 'News not found',
                status: 404,
                success: false,
                error: true
            });
        }
        
        // Check if user already commented
        const alreadyCommented = news.comments.some(
            (c) => c.userId.toString() === userId.toString()
        );
        if (alreadyCommented) {
            return res.status(400).json({
                message: 'You already commented on this news',
                status: 400,
                success: false,
                error: true
            });
        }
        
        // Add comment with authenticated user ID
        news.comments.push({ 
            userId: userId, 
            comment: payload.comment 
        });
        
        await news.save();
        
        res.json({
            message: 'Comment added successfully', 
            status: 200, 
            data: news, 
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

module.exports = { newsComment };

