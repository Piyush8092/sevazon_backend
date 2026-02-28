const faqModel = require("../../model/FaqModel");

const deleteFAQ = async (req, res) => {
  try {
    let id = req.params.id;
    let existFAQ = await faqModel.findById(id);

    if (!existFAQ) {
      return res
        .status(404)
        .json({ message: "FAQ not found", status: 404, success: false, error: true });
    }
    if (req.user.role !== "ADMIN" && existFAQ.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized access", status: 403, success: false, error: true });
    }

    await faqModel.findByIdAndDelete(id);

    res.json({ message: "FAQ deleted successfully", status: 200, success: true, error: false });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { deleteFAQ };
