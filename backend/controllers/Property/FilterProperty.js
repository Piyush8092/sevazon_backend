const PropertyModel = require("../../model/property");

const FilterProperty = async (req, res) => {
  try {
    // Extract query parameters
    const {
      type, // 'sell', 'rent'
      property, // 'Flat', 'House', etc.
      propertyType,
      bhk,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      furnishing,
      facing,
      possession,
      postedBy,
      city,
      state,
      pincode,
      address,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      
      // Near Me
      latitude,
      longitude,
      maxDistance = 50000,
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (property) filter.property = new RegExp(property, "i");
    if (propertyType) filter.propertyType = new RegExp(propertyType, "i");
    if (bhk) filter.bhk = bhk;
    
    if (minPrice || maxPrice) {
      filter.expectedPrice = {};
      if (minPrice) filter.expectedPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.expectedPrice.$lte = parseFloat(maxPrice);
    }

    if (minArea || maxArea) {
      filter.areaSqft = {};
      if (minArea) filter.areaSqft.$gte = parseFloat(minArea);
      if (maxArea) filter.areaSqft.$lte = parseFloat(maxArea);
    }

    if (furnishing) filter.furnishing = furnishing;
    if (facing) filter.facing = facing;
    if (possession) filter.possession = possession;
    if (postedBy) filter.postedBy = postedBy;
    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (pincode) filter.pincode = pincode;
    if (address) filter.address = new RegExp(address, "i");

    if (search) {
      filter.$or = [
        { property: new RegExp(search, "i") },
        { propertyType: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
        { fullName: new RegExp(search, "i") },
      ];
    }

    filter.isActive = true;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    let result;
    let total;

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const dist = parseInt(maxDistance);

      const pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            maxDistance: dist,
            query: filter,
            spherical: true,
          },
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        {
          $project: {
            "userId.password": 0,
            "userId.otp": 0,
          },
        },
      ];

      result = await PropertyModel.aggregate(pipeline);
      
      const countPipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            maxDistance: dist,
            query: filter,
            spherical: true,
          },
        },
        { $count: "total" }
      ];
      const countResult = await PropertyModel.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      result = await PropertyModel.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "name email phone profileImage postFeatures");
      total = await PropertyModel.countDocuments(filter);
    }

    res.json({
      message: "Properties filtered successfully",
      status: 200,
      data: result,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { FilterProperty };
