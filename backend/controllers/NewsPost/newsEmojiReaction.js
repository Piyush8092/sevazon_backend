let model = require("../../model/NewsPost");

const newsEmojiReaction = async (req, res) => {
  try {
    let news_id = req.params.news_id;
    let userId = req.user._id;
    let { emoji } = req.body;

    // Validate emoji is provided
    if (!emoji) {
      return res.status(400).json({
        message: "Emoji is required",
        status: 400,
        success: false,
        error: true,
      });
    }

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

    // Initialize emojiReactions array if it doesn't exist
    if (!news.emojiReactions) {
      news.emojiReactions = [];
    }

    // Check if user already reacted with any emoji
    const existingReactionIndex = news.emojiReactions.findIndex(
      (reaction) => reaction.userId.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      const existingEmoji = news.emojiReactions[existingReactionIndex].emoji;

      // If user clicked the same emoji, remove it (toggle off)
      if (existingEmoji === emoji) {
        news.emojiReactions.splice(existingReactionIndex, 1);
        await news.save();

        return res.json({
          message: "Emoji reaction removed successfully",
          status: 200,
          data: news,
          success: true,
          error: false,
        });
      } else {
        // User clicked a different emoji, update it
        news.emojiReactions[existingReactionIndex].emoji = emoji;
        await news.save();

        return res.json({
          message: "Emoji reaction updated successfully",
          status: 200,
          data: news,
          success: true,
          error: false,
        });
      }
    } else {
      // Add new emoji reaction
      news.emojiReactions.push({
        emoji: emoji,
        userId: userId.toString(),
      });
      await news.save();

      return res.json({
        message: "Emoji reaction added successfully",
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

module.exports = { newsEmojiReaction };
