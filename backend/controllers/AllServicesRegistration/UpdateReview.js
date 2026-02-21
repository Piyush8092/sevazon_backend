const ProfileModel = require('../../model/createAllServiceProfileModel');
const UserModel = require('../../model/userModel');

const UpdateReview = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;
    let userId = req.user._id;

    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
        data: {},
        success: false,
        error: true
      });
    }

    let profile = await ProfileModel.findOne({ _id: id });
    if (!profile) {
      return res.status(404).json({
        message: 'No data found',
        status: 404,
        data: {},
        success: false,
        error: true
      });
    }

    // console.log(profile);
    // Prevent self-review
    if (profile.userId.toString() === userId.toString()) {
      return res.status(403).json({
        message: 'You cannot comment on your own profile',
        status: 403,
        data: {},
        success: false,
        error: true
      });
    }

    // ✅ Check if user already commented
    const alreadyCommented = profile.comments.some(
      (c) => c.userId.toString() === userId.toString()
    );
    if (alreadyCommented) {
      return res.status(400).json({
        message: 'You already commented on this profile',
        status: 400,
        data: {},
        success: false,
        error: true
      });
    }

    // Add new comment with user name and timestamp
    profile.comments.push({
      userId: userId,
      userName: user.name,
      review: payload.review,
      ratting: payload.ratting,
      createdAt: new Date()
    });

    await profile.save();

    res.status(200).json({
      message: 'Comment added successfully',
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

module.exports = { UpdateReview };
