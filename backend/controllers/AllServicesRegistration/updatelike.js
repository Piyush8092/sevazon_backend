const ProfileModel = require("../../model/createAllServiceProfileModel");

// Update Like
const updateLike = async (req, res) => {
  try {
    let id = req.params.id; // profileId from URL
    let userId = req.user._id; // userId from auth middleware
    let payload = req.body;

    // Find the profile
    let profile = await ProfileModel.findById(id);
    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
        status: 404,
        data: {},
        success: false,
        error: true,
      });
    }

    // Prevent self-like
    if (profile.userId.toString() === userId.toString()) {
      return res.status(403).json({
        message: "You cannot like your own profile",
        status: 403,
        data: {},
        success: false,
        error: true,
      });
    }

    // Check if already liked
    const alreadyLiked = profile.likes.some((l) => l.userId.toString() === userId.toString());

    // Handle like toggle
    if (payload.like === false) {
      // Remove like if exists
      if (alreadyLiked) {
        profile.likes = profile.likes.filter((l) => l.userId.toString() !== userId.toString());
        await profile.save();
        return res.status(200).json({
          message: "Like removed successfully",
          status: 200,
          data: profile,
          success: true,
          error: false,
        });
      } else {
        return res.status(400).json({
          message: "You have not liked this profile yet",
          status: 400,
          data: {},
          success: false,
          error: true,
        });
      }
    }

    // Add like (payload.like === true or undefined)
    if (alreadyLiked) {
      return res.status(400).json({
        message: "You already liked this profile",
        status: 400,
        data: {},
        success: false,
        error: true,
      });
    }

    // Add like with default value true
    profile.likes.push({
      userId: userId,
      like: true,
    });

    // Remove dislike if the same user had disliked before
    profile.dislikes = profile.dislikes.filter((d) => d.userId.toString() !== userId.toString());

    await profile.save();

    res.status(200).json({
      message: "Like added successfully",
      status: 200,
      data: profile,
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

module.exports = { updateLike };
