const userModel = require("../../model/userModel");
const PropertyModel = require("../../model/property");
const jobModel = require("../../model/jobmodel");
const MatrimonyModel = require("../../model/Matrimony");
const NewsPostModel = require("../../model/NewsPost");
const ApplyModel = require("../../model/ApplyModel");
const OfferModel = require("../../model/OfferModel");
const getRecommendedServices = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ============================
    // 🔎 COLLECT SIGNALS
    // ============================

    const jobCategories = new Set();
    const jobStates = new Set();
    const jobTypes = new Set();
    const salaryRanges = [];

    const propertyBhk = new Set();
    const propertyTypes = new Set();
    const propertyPincode = new Set();

    const matrimonyGender = new Set();
    const matrimonyMarital = new Set();
    const matrimonyReligion = new Set();
    const matrimonyProfession = new Set();
    const matrimonyEmployment = new Set();
    const matrimonyState = new Set();

    const newsLocation = new Set();
    const newsCategory = new Set();
    const offerPincode = new Set();
    const offerCategory = new Set();
    const offerTypeSet = new Set();

    // ============================
    // 💼 JOB ANALYSIS
    // ============================

    if (user.jobProfileBookmarkID?.length) {
      const jobs = await jobModel
        .find({
          _id: { $in: user.jobProfileBookmarkID },
        })
        .lean();

      jobs.forEach((j) => {
        if (j.selectCategory) jobCategories.add(j.selectCategory);
        if (j.state) jobStates.add(j.state);
        if (j.workType?.length) j.workType.forEach((w) => jobTypes.add(w));
        if (j.salaryFrom && j.salaryTo) {
          salaryRanges.push({ min: j.salaryFrom, max: j.salaryTo });
        }
      });
    }

    const appliedJobs = await ApplyModel.find({
      ApplyuserId: userId,
    }).lean();

    if (appliedJobs.length) {
      const jobIds = appliedJobs.map((a) => a.jobId);
      const jobs = await jobModel.find({ _id: { $in: jobIds } }).lean();

      jobs.forEach((j) => {
        if (j.selectCategory) jobCategories.add(j.selectCategory);
        if (j.state) jobStates.add(j.state);
      });
    }

    // ============================
    // 🏠 PROPERTY ANALYSIS
    // ============================

    if (user.propertyBookmarkID?.length) {
      const properties = await PropertyModel.find({
        _id: { $in: user.propertyBookmarkID },
      }).lean();

      properties.forEach((p) => {
        if (p.bhk) propertyBhk.add(p.bhk);
        if (p.propertyType) propertyTypes.add(p.propertyType);
        if (p.pincode) propertyPincode.add(p.pincode);
      });
    }

    if (user.pincode) propertyPincode.add(user.pincode);

    // ============================
    // 💍 MATRIMONY ANALYSIS
    // ============================

    if (user.matrimonyProfileBookmarkID?.length) {
      const matrimony = await MatrimonyModel.find({
        _id: { $in: user.matrimonyProfileBookmarkID },
      }).lean();

      matrimony.forEach((m) => {
        if (m.gender) matrimonyGender.add(m.gender === "Male" ? "Female" : "Male");
        if (m.maritalStatus) matrimonyMarital.add(m.maritalStatus);
        if (m.religion?.length) m.religion.forEach((r) => matrimonyReligion.add(r));
        if (m.profession?.length) m.profession.forEach((p) => matrimonyProfession.add(p));
        if (m.employmentType?.length) m.employmentType.forEach((e) => matrimonyEmployment.add(e));
        if (m.state?.length) m.state.forEach((s) => matrimonyState.add(s));
      });
    }

    // ============================
    // 📰 NEWS ANALYSIS
    // ============================

    const newsActivity = await NewsPostModel.find({
      $or: [{ "likes.userId": userId.toString() }, { "comments.userId": userId.toString() }],
    }).lean();

    newsActivity.forEach((n) => {
      if (n.location) newsLocation.add(n.location);
      if (n.category) newsCategory.add(n.category);
    });

    // ============================
    // 🎁 OFFER ANALYSIS
    // ============================

    if (user.offerBookmarkID?.length) {
      const offers = await OfferModel.find({
        _id: { $in: user.offerBookmarkID },
      }).lean();

      offers.forEach((o) => {
        if (o.pincode) offerPincode.add(o.pincode);
        if (o.selectCategory) offerCategory.add(o.selectCategory);
        if (o.offerType) offerTypeSet.add(o.offerType);
      });
    }

    // ============================
    // 🔥 FILTER QUERIES
    // ============================

    const [jobs, properties, matrimony, news, offers] = await Promise.all([
      // JOB FILTER
      jobModel
        .find({
          userId: { $ne: userId },
          isActive: true,
          ...(jobCategories.size && {
            selectCategory: { $in: [...jobCategories] },
          }),
          ...(jobStates.size && { state: { $in: [...jobStates] } }),
          ...(jobTypes.size && { workType: { $in: [...jobTypes] } }),
        })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(5)
        .lean(),

      // PROPERTY FILTER
      PropertyModel.find({
        userId: { $ne: userId },
        isActive: true,
        ...(propertyBhk.size && { bhk: { $in: [...propertyBhk] } }),
        ...(propertyTypes.size && {
          propertyType: { $in: [...propertyTypes] },
        }),
        ...(propertyPincode.size && { pincode: { $in: [...propertyPincode] } }),
      })
        .limit(5)
        .lean(),

      // MATRIMONY FILTER
      MatrimonyModel.find({
        userId: { $ne: userId },
        isActive: true,
        ...(matrimonyGender.size && { gender: { $in: [...matrimonyGender] } }),
        ...(matrimonyMarital.size && {
          maritalStatus: { $in: [...matrimonyMarital] },
        }),
        ...(matrimonyReligion.size && {
          religion: { $in: [...matrimonyReligion] },
        }),
        // ...(matrimonyProfession.size && {
        //   profession: { $in: [...matrimonyProfession] },
        // }),
        ...(matrimonyEmployment.size && {
          employmentType: { $in: [...matrimonyEmployment] },
        }),
        ...(matrimonyState.size && { state: { $in: [...matrimonyState] } }),
      })
        .limit(5)
        .lean(),

      // NEWS FILTER
      NewsPostModel.find({
        userId: { $ne: userId },
        isActive: true,
        ...(newsLocation.size && { location: { $in: [...newsLocation] } }),
        ...(newsCategory.size && { category: { $in: [...newsCategory] } }),
      })
        .limit(5)
        .lean(),

      // OFFER FILTER
      OfferModel.find({
        userId: { $ne: userId },
        isActive: true,
        ...(offerPincode.size && { pincode: { $in: [...offerPincode] } }),
        ...(offerCategory.size && {
          selectCategory: { $in: [...offerCategory] },
        }),
        ...(offerTypeSet.size && { offerType: { $in: [...offerTypeSet] } }),
      })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Majority field intelligent recommendation",
      data: { jobs, properties, matrimony, news, offers },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendedServices };
