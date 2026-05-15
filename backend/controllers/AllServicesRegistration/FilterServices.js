const createServiceModel = require("../../model/createAllServiceProfileModel");

const FilterServices = async (req, res) => {
  try {
    const {
      name,
      profileType,
      serviceType,
      gender,

      city,
      state,
      pincode,
      area,

      category,
      subCategory,
      subCategoryOther,

      experience,
      establishedYear,

      minPrice,
      maxPrice,

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

    // ===============================
    // 1️⃣ BUILD FILTER OBJECT (SAME)
    // ===============================
    const filter = {};

    if (profileType) filter.profileType = profileType;
    if (serviceType) filter.serviceType = serviceType;
    if (gender) filter.gender = gender;
    if (pincode) filter.pincode = pincode;
    if (establishedYear) filter.establishedInYear = establishedYear;

    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (area) filter.area = new RegExp(area, "i");

    if (category) filter.selectCategory = new RegExp(category, "i");
    if (subCategory) filter.selectSubCategory = new RegExp(subCategory, "i");

    if (experience) filter.experience = new RegExp(experience, "i");

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (name) {
      filter.$or = [{ yourName: new RegExp(name, "i") }, { businessName: new RegExp(name, "i") }];
    }

    if (search) {
      filter.$or = [
        { yourName: new RegExp(search, "i") },
        { businessName: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { businessSummary: new RegExp(search, "i") },
        { selectCategory: new RegExp(search, "i") },
        { selectSubCategory: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { state: new RegExp(search, "i") },
        { area: new RegExp(search, "i") },
      ];
    }

    filter.isActive = true;

    // ===============================
    // 2️⃣ PAGINATION SETUP (SAME)
    // ===============================
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // ===============================
    // 3️⃣ AGGREGATION WITH PRIORITY SORT ✅ (NEW)
    // ===============================
    const pipeline = [];

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const dist = parseInt(maxDistance);

      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          maxDistance: dist,
          query: filter,
          spherical: true,
        },
      });
      pipeline.push({
        $addFields: {
          servicePriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$serviceType", "premium"] }, then: 1 },
                { case: { $eq: ["$serviceType", "featured"] }, then: 2 },
                { case: { $eq: ["$serviceType", null] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      });
      pipeline.push({
        $sort: {
          distance: 1,
          servicePriority: 1,
          [sortBy]: sortDirection,
        },
      });
    } else {
      pipeline.push({ $match: filter });
      pipeline.push({
        $addFields: {
          servicePriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$serviceType", "premium"] }, then: 1 },
                { case: { $eq: ["$serviceType", "featured"] }, then: 2 },
                { case: { $eq: ["$serviceType", null] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      });
      pipeline.push({
        $sort: {
          servicePriority: 1,
          [sortBy]: sortDirection,
        },
      });
    }

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    });
    pipeline.push({ $unwind: "$userId" });
    pipeline.push({
      $project: {
        "userId.password": 0,
        "userId.otp": 0,
      },
    });

    const result = await createServiceModel.aggregate(pipeline);

    // ===============================
    // 4️⃣ COUNT FOR PAGINATION (SAME)
    // ===============================
    let total;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const dist = parseInt(maxDistance);
      const countResult = await createServiceModel.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            maxDistance: dist,
            query: filter,
            spherical: true,
          },
        },
        { $count: "total" },
      ]);
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      total = await createServiceModel.countDocuments(filter);
    }
    const totalPages = Math.ceil(total / limitNum);

    // ===============================
    // 5️⃣ RESPONSE (SAME)
    // ===============================
    res.json({
      message: "Services filtered successfully",
      status: 200,
      data: result,
      pagination: {
        total,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
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

module.exports = { FilterServices };
