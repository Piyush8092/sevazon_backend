const userModel = require("../../model/userModel");
const MatrimonyModel = require("../../model/Matrimony");

const fixMatrimonyProfileFlag = async (req, res) => {
  try {
    // Find all users with hasMatrimonyProfile = false
    const usersToCheck = await userModel.find({ hasMatrimonyProfile: false });

    let fixedCount = 0;
    let errors = [];

    for (const user of usersToCheck) {
      // Check if this user has a matrimony profile
      const matrimonyProfile = await MatrimonyModel.findOne({ userId: user._id });

      if (matrimonyProfile) {
        // User has a matrimony profile but flag is false - fix it!
        user.hasMatrimonyProfile = true;
        await user.save();
        fixedCount++;
        console.log(`✅ Fixed user ${user._id} (${user.email || user.phone})`);
      }
    }

    res.json({
      message: "Matrimony profile flags fixed successfully",
      status: 200,
      data: {
        usersChecked: usersToCheck.length,
        usersFixed: fixedCount,
        errors: errors,
      },
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error fixing matrimony profile flags:", e);
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { fixMatrimonyProfileFlag };
