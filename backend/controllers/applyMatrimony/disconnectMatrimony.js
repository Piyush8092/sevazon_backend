let MatrimonyModel = require("../../model/Matrimony");

const disconnectMatrimony = async (req, res) => {
  try {
    const matrimonyId = req.params.id; // The profile being disconnected from
    const userId = req.user._id; // Current user

    console.log(`[disconnectMatrimony] userId: ${userId}, targetMatrimonyId: ${matrimonyId}`);

    // 1. Find the profile where the application is stored
    // The application could be:
    // a) Current user applied to the target profile
    // b) Target profile owner applied to current user's profile

    // Check Case (a): Current user is the sender
    let profile = await MatrimonyModel.findById(matrimonyId);
    let applicationIndex = -1;

    if (profile) {
      applicationIndex = profile.applyMatrimony.findIndex(
        (app) => app.applyUserId.toString() === userId.toString() && app.status === "Accepted"
      );
    }

    if (profile && applicationIndex !== -1) {
      console.log(`[disconnectMatrimony] Case A: Current user is sender. Found application in target profile.`);
      profile.applyMatrimony[applicationIndex].status = "Rejected";
      profile.applyMatrimony[applicationIndex].accept = false;
      profile.applyMatrimony[applicationIndex].reject = true;
      await profile.save();
    } else {
      // Check Case (b): Current user is the receiver
      // We need to find current user's matrimony profile first
      const myProfile = await MatrimonyModel.findOne({ userId: userId });
      if (!myProfile) {
        return res.status(404).json({
          success: false,
          message: "Your matrimony profile not found",
          data: null,
        });
      }

      // Find the application from the target profile owner in my profile
      // We need the userId of the target profile owner
      const targetProfile = await MatrimonyModel.findById(matrimonyId);
      if (!targetProfile) {
        return res.status(404).json({
          success: false,
          message: "Target profile not found",
          data: null,
        });
      }

      applicationIndex = myProfile.applyMatrimony.findIndex(
        (app) => app.applyUserId.toString() === targetProfile.userId.toString() && app.status === "Accepted"
      );

      if (applicationIndex !== -1) {
        console.log(`[disconnectMatrimony] Case B: Current user is receiver. Found application in my profile.`);
        myProfile.applyMatrimony[applicationIndex].status = "Rejected";
        myProfile.applyMatrimony[applicationIndex].accept = false;
        myProfile.applyMatrimony[applicationIndex].reject = true;
        await myProfile.save();
      } else {
        return res.status(404).json({
          success: false,
          message: "No accepted connection found between these profiles",
          data: null,
        });
      }
    }

    return res.json({
      success: true,
      message: "Disconnected successfully",
      data: null,
    });
  } catch (e) {
    console.error("[disconnectMatrimony] Error:", e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while disconnecting",
      data: e.message || e,
    });
  }
};

module.exports = { disconnectMatrimony };
