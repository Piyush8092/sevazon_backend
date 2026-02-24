const editorModel = require("../../model/EditorModel");
const userModel = require("../../model/userModel");

const updateEditor = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    const ExistEditor = await editorModel.findById(id);
    if (!ExistEditor) {
      return res.status(404).json({ message: "Editor not found" });
    }

    const UserId = req.user._id;

    // Authorization check FIRST
    if (
      ExistEditor.userId.toString() !== UserId.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // ===============================
    // ✅ ADMIN Verification Section
    // ===============================
    if (req.user.role === "ADMIN" && payload.isVerified !== undefined) {
      ExistEditor.isVerified = payload.isVerified;
      await ExistEditor.save();

      // If verified → make user EDITOR
      if (payload.isVerified === true) {
        await userModel.findByIdAndUpdate(
          ExistEditor.userId,
          { role: "EDITOR" },
          { new: true },
        );
      }

      // If unverified → revert role
      if (payload.isVerified === false) {
        await userModel.findByIdAndUpdate(
          ExistEditor.userId,
          { role: "USER" },
          { new: true },
        );
      }
    }

    // ===============================
    // Follow / Unfollow Logic
    // ===============================
    if (payload.action === "follow" && payload.targetEditorId) {
      const TargetEditor = await editorModel.findById(payload.targetEditorId);
      if (!TargetEditor) {
        return res.status(404).json({ message: "Target editor not found" });
      }

      const isAlreadyFollowing = ExistEditor.following.some(
        (f) => f.following_Id.toString() === payload.targetEditorId,
      );

      if (!isAlreadyFollowing) {
        ExistEditor.following.push({ following_Id: payload.targetEditorId });
        await ExistEditor.save();
      }

      const isAlreadyFollower = TargetEditor.followers.some(
        (f) => f.editor_Id.toString() === id,
      );

      if (!isAlreadyFollower) {
        TargetEditor.followers.push({ editor_Id: id });
        await TargetEditor.save();
      }

      return res.json({
        message: "Followed successfully",
        success: true,
        error: false,
      });
    }

    if (payload.action === "unfollow" && payload.targetEditorId) {
      ExistEditor.following = ExistEditor.following.filter(
        (f) => f.following_Id.toString() !== payload.targetEditorId,
      );

      await ExistEditor.save();

      const TargetEditor = await editorModel.findById(payload.targetEditorId);
      if (TargetEditor) {
        TargetEditor.followers = TargetEditor.followers.filter(
          (f) => f.editor_Id.toString() !== id,
        );
        await TargetEditor.save();
      }

      return res.json({
        message: "Unfollowed successfully",
        success: true,
        error: false,
      });
    }

    // ===============================
    // Normal Update (Profile Update)
    // ===============================

    const result = await editorModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return res.json({
      message: "Editor updated successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong",
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateEditor };
