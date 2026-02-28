let NewsPostModel = require("../../model/NewsPost");

const updateNews = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;

    let ExistNews = await NewsPostModel.findById(id);
    if (!ExistNews) {
      return res.status(404).json({ message: "News post not found" });
    }

    // Authorization check - only owner or EDITOR/ADMIN can update
    let UserId = req.user._id;
    if (ExistNews.userId.toString() !== UserId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate newsImages array if being updated
    // Note: newsImages can be either base64 encoded strings or Firebase Storage URLs
    if (
      payload.newsImages &&
      (!Array.isArray(payload.newsImages) ||
        payload.newsImages.length < 1 ||
        payload.newsImages.length > 5)
    ) {
      return res.status(400).json({ message: "Minimum 1 and maximum 5 news images are required" });
    }

    // Handle likes array management
    if (payload.action === "add_like" && payload.userId) {
      const isAlreadyLiked = ExistNews.likes.some((like) => like.userId === payload.userId);
      if (!isAlreadyLiked) {
        ExistNews.likes.push({ userId: payload.userId });
        // Remove from dislikes if exists
        ExistNews.dislikes = ExistNews.dislikes.filter(
          (dislike) => dislike.userId !== payload.userId
        );
      }
      payload.likes = ExistNews.likes;
      payload.dislikes = ExistNews.dislikes;
      delete payload.action;
      delete payload.userId;
    }
    // Handle remove like
    else if (payload.action === "remove_like" && payload.userId) {
      ExistNews.likes = ExistNews.likes.filter((like) => like.userId !== payload.userId);
      payload.likes = ExistNews.likes;
      delete payload.action;
      delete payload.userId;
    }
    // Handle dislikes array management
    else if (payload.action === "add_dislike" && payload.userId) {
      const isAlreadyDisliked = ExistNews.dislikes.some(
        (dislike) => dislike.userId === payload.userId
      );
      if (!isAlreadyDisliked) {
        ExistNews.dislikes.push({ userId: payload.userId });
        // Remove from likes if exists
        ExistNews.likes = ExistNews.likes.filter((like) => like.userId !== payload.userId);
      }
      payload.likes = ExistNews.likes;
      payload.dislikes = ExistNews.dislikes;
      delete payload.action;
      delete payload.userId;
    }
    // Handle remove dislike
    else if (payload.action === "remove_dislike" && payload.userId) {
      ExistNews.dislikes = ExistNews.dislikes.filter(
        (dislike) => dislike.userId !== payload.userId
      );
      payload.dislikes = ExistNews.dislikes;
      delete payload.action;
      delete payload.userId;
    }
    // Handle comments array management
    else if (payload.action === "add_comment" && payload.comment && payload.commentUserId) {
      ExistNews.comments.push({
        userId: payload.commentUserId,
        comment: payload.comment,
      });
      payload.comments = ExistNews.comments;
      delete payload.action;
      delete payload.comment;
      delete payload.commentUserId;
    }
    // Handle remove comment
    else if (payload.action === "remove_comment" && payload.commentIndex !== undefined) {
      if (payload.commentIndex >= 0 && payload.commentIndex < ExistNews.comments.length) {
        ExistNews.comments.splice(payload.commentIndex, 1);
        payload.comments = ExistNews.comments;
      }
      delete payload.action;
      delete payload.commentIndex;
    }
    // Handle shares increment
    else if (payload.action === "increment_shares") {
      ExistNews.shares = (ExistNews.shares || 0) + 1;
      payload.shares = ExistNews.shares;
      delete payload.action;
    }
    // Handle shares decrement
    else if (payload.action === "decrement_shares") {
      ExistNews.shares = Math.max((ExistNews.shares || 0) - 1, 0);
      payload.shares = ExistNews.shares;
      delete payload.action;
    }
    // Handle direct array updates
    else if (
      payload.likes ||
      payload.dislikes ||
      payload.comments ||
      payload.shares !== undefined
    ) {
      // Direct update - preserve existing if not provided
      if (!payload.likes) payload.likes = ExistNews.likes;
      if (!payload.dislikes) payload.dislikes = ExistNews.dislikes;
      if (!payload.comments) payload.comments = ExistNews.comments;
      if (payload.shares === undefined) payload.shares = ExistNews.shares;
    } else {
      // Preserve existing arrays if not updating them
      payload.likes = ExistNews.likes;
      payload.dislikes = ExistNews.dislikes;
      payload.comments = ExistNews.comments;
      payload.shares = ExistNews.shares;
    }

    const result = await NewsPostModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "News updated successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    // Handle validation errors
    if (e.name === "ValidationError") {
      const errors = Object.values(e.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        status: 400,
        data: errors,
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateNews };
