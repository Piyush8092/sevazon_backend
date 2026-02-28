let AboutUsModel = require("../../model/aboutUsModel");

const getSpecificAboutUs = async (req, res) => {
  try {
    let id = req.params.id;

    const result = await AboutUsModel.findById(id);

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

module.exports = { getSpecificAboutUs };
