const mongoose = require("mongoose");

const userModel = require("../../model/userModel");
const adModel = require("../../model/adModel");
const ApplyModel = require('../../model/ApplyModel');
const ProfileModel = require("../../model/createAllServiceProfileModel");
const EditorModel = require('../../model/EditorModel');
const faqModel = require('../../model/FaqModel');
const FCMToken = require("../../model/fcmTokenModel");
const FeedbackModel = require("../../model/feedbackModel");
const jobModel = require('../../model/jobmodel');
const leadModel = require("../../model/leadModel");
const LocalServiceModel = require("../../model/localServices");
const MatrimonyModel = require("../../model/Matrimony");
const NewsPostModel = require("../../model/NewsPost");
const NotificationHistory = require("../../model/notificationHistoryModel");
const NotificationPreferences = require("../../model/notificationPreferencesModel");
const offer = require("../../model/OfferModel");
const Payment = require("../../model/paymentModel");
const PropertyModel = require("../../model/property");
const serviceListModel = require('../../model/ServiceListModel');
const UserActivity = require("../../model/userActivityModel");
const UserReport = require('../../model/UserReportModel');
const VehiclesModel = require("../../model/vehiclesModel");

const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const session = await mongoose.startSession();

  try {
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Authorization
    const isAdmin = req.user.role === "ADMIN";
    const isOwner = req.user._id.toString() === id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    await session.withTransaction(async () => {
      // Direct ownership deletions
      await adModel.deleteMany({ userId: id }).session(session);
      await ApplyModel.deleteMany({ ApplyuserId: id }).session(session);
      await EditorModel.deleteMany({ userId: id }).session(session);
      await faqModel.deleteMany({ userId: id }).session(session);
      await FCMToken.deleteMany({ userId: id }).session(session);
      await FeedbackModel.deleteMany({ userId: id }).session(session);
      await jobModel.deleteMany({ userId: id }).session(session);
      await leadModel.deleteMany({ userId: id }).session(session);
      await LocalServiceModel.deleteMany({ userId: id }).session(session);
      await MatrimonyModel.deleteMany({ userId: id }).session(session);
      await Payment.deleteMany({ userId: id }).session(session);
      await PropertyModel.deleteMany({ userId: id }).session(session);
      await serviceListModel.deleteMany({ userId: id }).session(session);
      await UserActivity.deleteMany({ userId: id }).session(session);
      await NotificationHistory.deleteMany({ userId: id }).session(session);
      await NotificationPreferences.deleteMany({ userId: id }).session(session);
      await offer.deleteMany({ userId: id }).session(session);
      await VehiclesModel.deleteMany({ userId: id }).session(session);

      // Reports involving user
      await UserReport.deleteMany({
        $or: [{ reporterId: id }, { reportedUserId: id }],
      }).session(session);

      // Matrimony nested reference
      await MatrimonyModel.updateMany(
        {},
        { $pull: { applyMatrimony: { applyUserId: id } } },
      ).session(session);

      // Profile nested cleanups
      await ProfileModel.updateMany(
        {},
        {
          $pull: {
            likes: { userId: id },
            dislikes: { userId: id },
            comments: { userId: id },
          },
        },
      ).session(session);

      await ProfileModel.deleteMany({ userId: id }).session(session);

      // NewsPost nested cleanups
      await NewsPostModel.updateMany(
        {},
        {
          $pull: {
            likes: { userId: id },
            dislikes: { userId: id },
            comments: { userId: id },
            emojiReactions: { userId: id },
          },
        },
      ).session(session);

      await NewsPostModel.deleteMany({ userId: id }).session(session);

      // Remove follower references safely
      await userModel
        .updateMany({}, { $pull: { editorFollowers: { userId: id } } })
        .session(session);

      // Finally delete user
      await userModel.findByIdAndDelete(id).session(session);
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting user",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = { deleteUser };
