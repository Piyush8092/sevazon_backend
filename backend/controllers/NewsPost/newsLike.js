let model = require("../../model/NewsPost");

const newsLike = async (req, res) => {
  try {
    let news_id = req.params.news_id;
    let userId = req.user._id;

    // Find the news post
    let news = await model.findById(news_id);
    if (!news) {
      return res.status(404).json({
        message: "News not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Check if user already liked
    const alreadyLiked = news.likes.some((like) => like.userId.toString() === userId.toString());

    if (alreadyLiked) {
      // Remove like
      news.likes = news.likes.filter((like) => like.userId.toString() !== userId.toString());
      await news.save();

      return res.json({
        message: "Like removed successfully",
        status: 200,
        data: news,
        success: true,
        error: false,
      });
    } else {
      // Add like and remove dislike if exists
      news.likes.push({ userId: userId });
      news.dislikes = news.dislikes.filter(
        (dislike) => dislike.userId.toString() !== userId.toString()
      );
      await news.save();

      return res.json({
        message: "Like added successfully",
        status: 200,
        data: news,
        success: true,
        error: false,
      });
    }
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { newsLike };
