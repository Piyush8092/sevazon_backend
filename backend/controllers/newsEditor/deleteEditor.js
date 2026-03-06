let editorModel = require("../../model/EditorModel");
let userModel = require("../../model/userModel");

const deleteEditor = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;

    let ExistEditor = await editorModel.findById(id);
    if (!ExistEditor) {
      return res.status(404).json({ message: "Editor not found" });
    }

    if (ExistEditor.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // IMPORTANT: Remove EDITOR role from user when editor profile is deleted
    await userModel.findByIdAndUpdate(
      ExistEditor.userId,
      { role: "USER" },
      { new: true }
    );

    // Remove this editor from all other editors' followers and following lists
    await editorModel.updateMany(
      { "followers.editor_Id": id },
      { $pull: { followers: { editor_Id: id } } }
    );

    await editorModel.updateMany(
      { "following.following_Id": id },
      { $pull: { following: { following_Id: id } } }
    );

    const result = await editorModel.findByIdAndDelete(id);

    res.json({
      message: "Editor deleted successfully",
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

module.exports = { deleteEditor };
