let NewsPostModel = require("../../model/NewsPost");
const userModel = require("../../model/userModel");
const UpdateReportAndBlockNews = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;
    let payload = req.body;
    let report = payload.report;

    let ExistNews = await NewsPostModel.findById(id);
    if (!ExistNews) {
      return res.status(404).json({ message: "News not found" });
    }
    if (ExistNews.userId.toString() === userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    //frist check if user already report and block
    const alreadyReported = ExistNews.NewsReport.some(
      (r) => r.reportAndBlockID.toString() === userId.toString()
    );
    if (alreadyReported) {
      return res.status(400).json({ message: "You have already reported this profile" });
    }
    ExistNews.NewsReport.push({ report: report, reportAndBlockID: userId });
    const result = await ExistNews.save();
    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.newsReportID.includes(id)) {
      return res.status(400).json({ message: "You have already reported this profile" });
    }
    user.newsReportID.push(id);
    await user.save();

    res.json({
      message: "Report added successfully",
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

module.exports = { UpdateReportAndBlockNews };
