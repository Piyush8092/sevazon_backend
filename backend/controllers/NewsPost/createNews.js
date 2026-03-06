let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");

const createNews = async (req, res) => {
  try {
    let payload = req.body;

    // Validate all required fields according to new model
    if (
      !payload.title ||
      !payload.description ||
      !payload.hashtag ||
      !payload.content ||
      !payload.location
    ) {
      return res
        .status(400)
        .json({ message: "Title, description, hashtag, content and location are required" });
    }

    // Validate newsImages array
    // Note: newsImages can be either base64 encoded strings or Firebase Storage URLs
    if (
      !payload.newsImages ||
      !Array.isArray(payload.newsImages) ||
      payload.newsImages.length < 1 ||
      payload.newsImages.length > 5
    ) {
      return res.status(400).json({ message: "Minimum 1 and maximum 5 news images are required" });
    }

    let userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if user exists and has proper role
    if (req.user.role !== "EDITOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only editors and admins can create news" });
    }

    // Additional check: Verify the user has an approved editor profile
    // (Only applies to EDITOR role, ADMIN can always post)
    if (req.user.role === "EDITOR") {
      const editorModel = require("../../model/EditorModel");
      const editorProfile = await editorModel.findOne({ userId: userId });
      
      if (!editorProfile) {
        return res.status(403).json({ 
          message: "Editor profile not found. Please contact admin." 
        });
      }
      
      if (!editorProfile.isVerified) {
        return res.status(403).json({ 
          message: "Your editor profile is pending approval. You cannot publish news until approved by admin." 
        });
      }
    }

    // Set user ID and default values
    payload.userId = userId;
    payload.isActive = true;
    payload.isVerified = true;
    payload.likes = [];
    payload.dislikes = [];
    payload.comments = [];
    payload.shares = 0;

    const newNews = new NewsPostModel(payload);
    const result = await newNews.save();
    let user = await userModel.findById(userId);
    if (user.AnyServiceCreate === false) {
      user.AnyServiceCreate = true;
      await user.save();
    }

    res.json({
      message: "News created successfully",
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

module.exports = { createNews };
