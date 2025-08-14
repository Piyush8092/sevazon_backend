let NewsPostModel = require('../../model/NewsPost');

const updateNews = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistNews = await NewsPostModel.findById({_id: id});
        if (!ExistNews && req.user.role!='EDITOR') {
            return res.status(400).json({message: 'News post not found'});
        }

        let UserId = req.user._id;
        if (ExistNews.userId.toString() !== UserId.toString()) {
            return res.status(400).json({message: 'Unauthorized access'});
        }

        // Handle likes array management
        if (payload.action === 'add_like' && payload.userId) {
            const isAlreadyLiked = ExistNews.likes.some(like => like.userId === payload.userId);
            if (!isAlreadyLiked) {
                ExistNews.likes.push({ userId: payload.userId });
                // Remove from dislikes if exists
                ExistNews.dislikes = ExistNews.dislikes.filter(dislike => dislike.userId !== payload.userId);
            }
            delete payload.action;
            delete payload.userId;
        }
        // Handle dislikes array management
        else if (payload.action === 'add_dislike' && payload.userId) {
            const isAlreadyDisliked = ExistNews.dislikes.some(dislike => dislike.userId === payload.userId);
            if (!isAlreadyDisliked) {
                ExistNews.dislikes.push({ userId: payload.userId });
                // Remove from likes if exists
                ExistNews.likes = ExistNews.likes.filter(like => like.userId !== payload.userId);
            }
            delete payload.action;
            delete payload.userId;
        }
        // Handle comments array management
        else if (payload.action === 'add_comment' && payload.comment && payload.commentUserId) {
            ExistNews.comments.push({ 
                userId: payload.commentUserId, 
                comment: payload.comment 
            });
            delete payload.action;
            delete payload.comment;
            delete payload.commentUserId;
        }
        // Handle shares increment
        else if (payload.action === 'increment_shares') {
            ExistNews.shares = (ExistNews.shares || 0) + 1;
            delete payload.action;
        }

        // Preserve existing arrays if not updating them
        payload.likes = ExistNews.likes;
        payload.dislikes = ExistNews.dislikes;
        payload.comments = ExistNews.comments;
        payload.shares = ExistNews.shares;

        const result = await NewsPostModel.findByIdAndUpdate({_id: id}, payload, {new: true});
        res.json({message: 'News updated successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { updateNews };
