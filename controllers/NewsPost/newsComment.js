let model = require('../../model/NewsPost');

const newsComment = async (req, res) => {
    try {       
        let news_id = req.params.news_id;
        let payload = req.body;
        let news = await model.findById({_id: news_id});
        if (!news) {
            return res.status(400).json({message: 'News not found'});
        }
        news.comments.push({ 
            userId: payload.userId, 
            comment: payload.comment 
        });
        await news.save();
        res.json({message: 'Comment added successfully', status: 200, data: news, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { newsComment };

