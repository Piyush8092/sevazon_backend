const editorModel = require('../../model/EditorModel');
const userModel = require('../../model/userModel');

const updateEditorVerifyStatus = async (req, res) => {
  try {
    const editorId = req.params.id;
    const { isVerified } = req.body;

    // Only ADMIN can update
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only admin can update editor verification status',
        success: false,
        error: true
      });
    }

    // Check editor exists
    const editor = await editorModel.findById(editorId);
    if (!editor) {
      return res.status(404).json({
        message: 'Editor not found',
        success: false,
        error: true
      });
    }

    // Update editor verification
    editor.isVerified = isVerified === true;
    await editor.save();

    // If verified true → change User role to EDITOR
    if (isVerified === true) {
      await userModel.findByIdAndUpdate(
        editor.userId,
        { role: 'EDITOR' },
        { new: true }
      );
    }

    // Optional: If unverified → revert role to USER
    if (isVerified === false) {
      await userModel.findByIdAndUpdate(
        editor.userId,
        { role: 'USER' },
        { new: true }
      );
    }

    return res.json({
      message: 'Editor verification status updated successfully',
      status: 200,
      data: editor,
      success: true,
      error: false
    });

  } catch (e) {
    return res.status(500).json({
      message: 'Something went wrong',
      data: e.message,
      success: false,
      error: true
    });
  }
};

module.exports = { updateEditorVerifyStatus };