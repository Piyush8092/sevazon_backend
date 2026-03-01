let PropertyModel = require("../../model/property");

const queryProperty = async (req, res) => {
  try {
    let query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    let regexQuery = new RegExp(query, "i");
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search across multiple fields based on the property model
    const searchQuery = {
      $or: [
        { yourProfileId: regexQuery },
        { property: regexQuery },
        { propertyType: regexQuery },
        { bhk: regexQuery },
        { facing: regexQuery },
        { description: regexQuery },
        { furnishing: regexQuery },
        { possession: regexQuery },
        { postedBy: regexQuery },
        { rera: regexQuery },
        { fullName: regexQuery },
        { pincode: regexQuery },
        { address: regexQuery },
        { "floorInfo.floorNo": regexQuery },
        { "floorInfo.totalFloor": regexQuery },
      ],
    };

    const result = await PropertyModel.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate("profileId", "profileType")
      .populate("userId", "name email phone postFeatures");
    const total = await PropertyModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Properties retrieved successfully",
      status: 200,
      data: result,
      total,
      totalPages,
      currentPage: page,
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

module.exports = { queryProperty };
