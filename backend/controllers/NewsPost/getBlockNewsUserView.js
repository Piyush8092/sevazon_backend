let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");
const getBlockNewsUserView = async (req, res) => {
  try {
    let userId = req.user._id;
    //find newsBlockID in newsPostModel where reportAndBlockID is userId
    let result = await NewsPostModel.find({ "NewsBlock.reportAndBlockID": userId }).populate(
      "userId",
      "name email phone profileImage "
    );

    if (!result || result.length === 0) {
      return res.json({
        message: "No blocked news found",
        status: 404,
        data: [],
        success: false,
        error: true,
      });
    }

    let newsBlockID = result.newsBlockID;
    res.json({
      message: "Blocked news retrieved successfully",
      status: 200,
      data: newsBlockID,
      total: result.length,
      success: true,
      error: false,
    });
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

module.exports = { getBlockNewsUserView };
