let NewsPostModel = require('../../model/NewsPost');
let userModel = require('../../model/userModel');

/**
 * Block a news author - prevents all news from this author from appearing in user's feed
 * PUT /api/block-news-author/:newsId
 * This blocks the author of the specified news post
 */
const blockNewsAuthor = async (req, res) => {
    try {       
        let newsId = req.params.newsId;
        let userId = req.user._id;
        
        // Find the news post to get the author
        let news = await NewsPostModel.findById(newsId);
        if (!news) {
            return res.status(404).json({
                message: 'News not found',
                status: 404,
                success: false,
                error: true
            });
        }

        let authorId = news.userId;
        
        // Prevent blocking yourself
        if (authorId.toString() === userId.toString()) {
            return res.status(400).json({
                message: 'You cannot block yourself',
                status: 400,
                success: false,
                error: true
            });
        }

        // Find the current user
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Check if author is already blocked
        const alreadyBlocked = user.blockedNewsAuthors?.some(
            (blockedAuthorId) => blockedAuthorId.toString() === authorId.toString()
        );

        if (alreadyBlocked) {
            return res.status(400).json({
                message: 'You have already blocked this news author',
                status: 400,
                success: false,
                error: true
            });
        }

        // Initialize blockedNewsAuthors array if it doesn't exist
        if (!user.blockedNewsAuthors) {
            user.blockedNewsAuthors = [];
        }

        // Add author to blocked list
        user.blockedNewsAuthors.push(authorId);
        await user.save();

        res.json({
            message: 'News author blocked successfully. You will no longer see posts from this author.',
            status: 200,
            data: {
                blockedAuthorId: authorId,
                totalBlockedAuthors: user.blockedNewsAuthors.length
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Error blocking news author:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

/**
 * Unblock a news author
 * PUT /api/unblock-news-author/:authorId
 */
const unblockNewsAuthor = async (req, res) => {
    try {
        let authorId = req.params.authorId;
        let userId = req.user._id;

        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Check if author is blocked
        if (!user.blockedNewsAuthors || !user.blockedNewsAuthors.includes(authorId)) {
            return res.status(400).json({
                message: 'This author is not blocked',
                status: 400,
                success: false,
                error: true
            });
        }

        // Remove author from blocked list
        user.blockedNewsAuthors = user.blockedNewsAuthors.filter(
            (id) => id.toString() !== authorId.toString()
        );
        await user.save();

        res.json({
            message: 'News author unblocked successfully',
            status: 200,
            data: {
                unblockedAuthorId: authorId,
                totalBlockedAuthors: user.blockedNewsAuthors.length
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Error unblocking news author:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { blockNewsAuthor, unblockNewsAuthor };

