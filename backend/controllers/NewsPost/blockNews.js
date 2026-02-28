let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");
const blockNews = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;
    let payload = req.body;
    let block = payload.block;
    let news = await NewsPostModel.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    //frist check if user already block the news
    const alreadyBlocked = news.NewsBlock.some(
      (r) => r.reportAndBlockID.toString() === userId.toString()
    );
    if (alreadyBlocked) {
      return res.status(400).json({ message: "You have already blocked this news" });
    }
    news.NewsBlock.push({ report: report, reportAndBlockID: userId });
    const result = await news.save();

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.newsBlockID.includes(id)) {
      return res.status(400).json({ message: "You have already blocked this news" });
    }
    user.newsBlockID.push(id);
    await user.save();

    res.json({
      message: "News blocked successfully",
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

module.exports = { blockNews };
