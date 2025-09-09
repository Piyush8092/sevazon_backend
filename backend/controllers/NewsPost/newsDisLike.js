
let model = require('../../model/NewsPost');

const newsDislike = async (req, res) => {
    try {       
        let news_id = req.params.news_id;
        let userId = req.user._id;
        
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
        
        // Check if user already disliked
        const alreadyDisliked = news.dislikes.some(
            (dislike) => dislike.userId.toString() === userId.toString()
        );
        
        if (alreadyDisliked) {
            // Remove dislike
            news.dislikes = news.dislikes.filter(
                (dislike) => dislike.userId.toString() !== userId.toString()
            );
            await news.save();
            
            return res.json({
                message: 'Dislike removed successfully', 
                status: 200, 
                data: news, 
                success: true, 
                error: false
            });
        } else {
            // Add dislike and remove like if exists
            news.dislikes.push({ userId: userId });
            news.likes = news.likes.filter(
                (like) => like.userId.toString() !== userId.toString()
            );
            await news.save();
            
            return res.json({
                message: 'Dislike added successfully', 
                status: 200, 
                data: news, 
                success: true, 
                error: false
            });
        }
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

module.exports = { newsDislike };

