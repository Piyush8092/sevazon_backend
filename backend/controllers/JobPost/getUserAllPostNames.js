const jobModel = require("../../model/jobmodel");
const MatrimonyModel = require("../../model/Matrimony");
const PropertyModel = require("../../model/property");
const offerModel = require("../../model/OfferModel");

const getUserAllPostNames = async (req, res) => {
  const userId = req.user._id;

  try {
    const [jobs, matrimony, properties, offers] = await Promise.all([
      jobModel.find({ userId: userId }).select("_id title").sort({ createdAt: -1 }).lean(),
      MatrimonyModel.find({ userId: userId }).select("_id fullName").sort({ createdAt: -1 }).lean(),
      PropertyModel.find({ userId: userId }).select("_id fullName").sort({ createdAt: -1 }).lean(),
      offerModel.find({ userId: userId }).select("_id title").sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      message: "User post names fetched successfully",
      status: 200,
      data: {
        jobs,
        matrimony,
        properties,
        offers,
      },
      success: true,
      error: false,
    });
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

module.exports = { getUserAllPostNames };
