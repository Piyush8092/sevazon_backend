let AboutUsModel = require("../../model/aboutUsModel");

const getAboutUs = async (req, res) => {
  try {
    // Get the active About Us content
    // We'll typically have only one active About Us document
    const result = await AboutUsModel.findOne({ isActive: true }).sort({ lastUpdated: -1 });

    if (!result) {
      return res.status(404).json({
        message: "About Us content not found",
        status: 404,
        data: null,
        success: false,
        error: true,
      });
    }

    res.json({
      message: "About Us content retrieved successfully",
      status: 200,
      data: result,
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

module.exports = { getAboutUs };
