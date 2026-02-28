let AboutUsModel = require("../../model/aboutUsModel");

const editAboutUs = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;

    // Check admin authorization
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access. Only admins can edit About Us content.",
        status: 403,
        success: false,
        error: true,
      });
    }

    // Check if About Us content exists
    const existingAboutUs = await AboutUsModel.findById(id);
    if (!existingAboutUs) {
      return res.status(404).json({
        message: "About Us content not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Validate required fields if being updated
    if (payload.title !== undefined && !payload.title) {
      return res.status(400).json({
        message: "Title cannot be empty",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (payload.content !== undefined && !payload.content) {
      return res.status(400).json({
        message: "Content cannot be empty",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Update lastUpdated timestamp
    payload.lastUpdated = new Date();

    const result = await AboutUsModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "About Us content updated successfully",
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

module.exports = { editAboutUs };
