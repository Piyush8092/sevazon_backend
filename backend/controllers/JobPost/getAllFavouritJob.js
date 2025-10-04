const jobModel = require('../../model/jobmodel');

const getAllFavouritJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Find all jobs favorited by this user
    const favoriteJobs = await jobModel.find({
      favoriteJob: {
        $elemMatch: {
          userId: userId,
          isFavorite: true,
        },
      },
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(
        'title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode description salaryFrom salaryTo salaryPer requiredExperience workMode workShift workType allowCallInApp allowChat isActive isVerified createdAt'
      );

    // ✅ Count total favorite jobs for pagination
    const total = await jobModel.countDocuments({
      favoriteJob: {
        $elemMatch: {
          userId: userId,
          isFavorite: true,
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: 'User favorite jobs fetched successfully',
      status: 200,
      success: true,
      error: false,
      total,
      totalPages,
      data: favoriteJobs,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      status: 500,
      success: false,
      error: true,
      data: error.message,
    });
  }
};

module.exports = { getAllFavouritJob };
