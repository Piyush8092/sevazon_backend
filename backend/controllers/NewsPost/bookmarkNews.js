let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");
//bookmark like job bookmar

//make bookmark like matrimony bookmark
const bookmarkNews = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;
    let news = await NewsPostModel.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    if (userId.toString() === news.userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot bookmark your own news", success: false, error: true });
    }
    // Find the logged-in user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }
    // Check if the news is already bookmarked

    const isBookmarked = user.newsBookmarkID.includes(id);
    if (isBookmarked) {
      // Remove bookmark if it exists
      user.newsBookmarkID.pull(id);
    } else {
      // Add bookmark if it doesn't exist
      user.newsBookmarkID.push(id);
    }
    const result = await user.save();
    res.status(200).json({
      message: isBookmarked
        ? "News bookmark removed successfully"
        : "News bookmark added successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { bookmarkNews };
