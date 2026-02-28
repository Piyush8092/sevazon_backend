let offerModel = require("../../model/OfferModel");
const userModel = require("../../model/userModel");

const UpdateOfferBookmark = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;

    let ExistOffer = await offerModel.findById(id);
    if (!ExistOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (ExistOffer.userId.toString() === userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cannot bookmark your own offer" });
    }

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle bookmark
    const bookmarkIndex = user.offerBookmarkID.indexOf(id);
    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.offerBookmarkID.splice(bookmarkIndex, 1);
      await user.save();

      return res.json({
        message: "Offer removed from bookmarks",
        status: 200,
        data: user,
        success: true,
        error: false,
      });
    } else {
      // Add bookmark
      user.offerBookmarkID.push(id);
      await user.save();

      return res.json({
        message: "Offer bookmarked successfully",
        status: 200,
        data: user,
        success: true,
        error: false,
      });
    }
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

module.exports = { UpdateOfferBookmark };
