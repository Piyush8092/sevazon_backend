const createServiceModel = require("../../model/createAllServiceProfileModel");
const UserModel = require("../../model/userModel");
// get specific service
const GetSpecificServices = async (req, res) => {
  try {
    let id = req.params.id;

    const result = await createServiceModel.findById(id);
    if (!result) {
      res.json({ message: "No data found", status: 400, data: {}, success: false, error: true });
    }

    let GetID;
    if (result.profileType === "Service Profile") {
      GetID = "S" + result._id;
    }
    if (result.profileType === "Business Profile") {
      GetID = "B" + result._id;
    }
    const resultObj = result.toObject();
    resultObj.isBusiness = result.profileType === "Business Profile";
    res.json({
      message: "Job created successfully",
      status: 200,
      data: { GetID, result: resultObj },
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

module.exports = { GetSpecificServices };
