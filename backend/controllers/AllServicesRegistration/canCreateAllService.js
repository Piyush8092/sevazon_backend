const createServiceModel = require("../../model/createAllServiceProfileModel");

const canCreateAllService = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await createServiceModel.countDocuments({ userId });

    const MAX_PROFILES = 4;

    const canCreate = count < MAX_PROFILES;

    return res.status(200).json({
      status: 200,
      success: true,
      error: false,
      data: {
        canCreate,
        currentCount: count,
        remaining: Math.max(0, MAX_PROFILES - count),
        maxLimit: MAX_PROFILES,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      status: 500,
      message: error.message,
    });
  }
};

module.exports = { canCreateAllService };
