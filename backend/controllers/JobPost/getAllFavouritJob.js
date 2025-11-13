const userModel = require('../../model/userModel');

const getAllFavouritJob = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await userModel.findById(userId).populate({
      path: 'jobProfileBookmarkID',
      select: 'title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode description salaryFrom salaryTo salaryPer requiredExperience workMode workShift workType allowCallInApp allowChat isActive isVerified createdAt _id',
      match: { isActive: true } // Only show active jobs
    });

    if (!result) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
        data: [],
        success: false,
        error: true
      });
    }

    res.status(200).json({
      message: 'User favorite jobs fetched successfully',
      status: 200,
      success: true,
      error: false,
      data: result.jobProfileBookmarkID,
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
