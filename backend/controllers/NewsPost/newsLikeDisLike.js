let model = require('../../model/NewsPost');

const newsLikeDisLike = async (req, res) => {

    try {       
        let news_id = req.params.news_id;
        let payload = req.body;
        let news = await model.findById({_id: news_id});
        if (!news) {
            return res.status(400).json({message: 'News not found'});
        }
        if (payload.action === 'add_like') {
            news.likes.push({ userId: payload.userId });
            await news.save();
            res.json({message: 'Like added successfully', status: 200, data: news, success: true, error: false});
        }
        else if (payload.action === 'add_dislike') {
            news.dislikes.push({ userId: payload.userId });
            await news.save();
            res.json({message: 'Dislike added successfully', status: 200, data: news, success: true, error: false});
        }
        else {
            return res.status(400).json({message: 'Invalid action'});
        }
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { newsLikeDisLike };


