const ProfileModel = require('../../model/createAllServiceProfileModel');

// Update Dislike
const updateDislike = async (req, res) => {
  try {
    let id = req.params.id; // profileId from URL
    let userId = req.user._id; // userId from auth middleware
    let payload = req.body;

    // Find the profile
    let profile = await ProfileModel.findById(id);
    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found',
        status: 404,
        data: {},
        success: false,
        error: true
      });
    }

    // Prevent profile owner from disliking own profile
    if (profile.userId.toString() === userId.toString()) {
      return res.status(403).json({
        message: 'You cannot dislike your own profile',
        status: 403,
        data: {},
        success: false,
        error: true
      });
    }

    // Check if already disliked by this user
    const alreadyDisliked = profile.dislikes.some(
      (d) => d.userId.toString() === userId.toString()
    );

    // Handle dislike toggle
    if (payload.dislike === false) {
      // Remove dislike if exists
      if (alreadyDisliked) {
        profile.dislikes = profile.dislikes.filter(
          (d) => d.userId.toString() !== userId.toString()
        );
        await profile.save();
        return res.status(200).json({
          message: 'Dislike removed successfully',
          status: 200,
          data: profile,
          success: true,
          error: false
        });
      } else {
        return res.status(400).json({
          message: 'You have not disliked this profile yet',
          status: 400,
          data: {},
          success: false,
          error: true
        });
      }
    }

    // Add dislike (payload.dislike === true or undefined)
    if (alreadyDisliked) {
      return res.status(400).json({
        message: 'You already disliked this profile',
        status: 400,
        data: {},
        success: false,
        error: true
      });
    }

    // Add dislike with default value true
    profile.dislikes.push({ 
      userId: userId,
      dislike: true
    });

    // Remove like if the same user had liked before
    profile.likes = profile.likes.filter(
      (l) => l.userId.toString() !== userId.toString()
    );

    await profile.save();

    res.status(200).json({
      message: 'Dislike added successfully',
      status: 200,
      data: profile,
      success: true,
      error: false
    });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong',
      status: 500,
      data: e.message,
      success: false,
      error: true
    });
  }
};

module.exports = { updateDislike };
