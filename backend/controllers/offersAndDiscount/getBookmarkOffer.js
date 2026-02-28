const userModel = require("../../model/userModel");
const offerModel = require("../../model/OfferModel");

const getBookmarkOffer = async (req, res) => {
  try {
    let userId = req.user._id;
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all bookmarked offers
    const bookmarkedOffers = await offerModel.find({
      _id: { $in: user.offerBookmarkID },
    });

    res.json({
      message: "Bookmarked offers retrieved successfully",
      status: 200,
      data: bookmarkedOffers,
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

module.exports = { getBookmarkOffer };
