const createServiceModel = require("../../model/createAllServiceProfileModel");

const updateImportantLink = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;

    let ExistUser = await createServiceModel.findById(id);
    if (!ExistUser) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (ExistUser.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { link, linkName } = req.body;

    if (!link || !linkName) {
      return res.status(400).json({ message: "Both link and linkName are required" });
    }

    // Push new important link
    ExistUser.importantLink.push({
      link: link.trim(),
      linkName: linkName.trim(),
    });

    // if i do save then it add if i do update then it replace so for arry cae always do save in stees update
    const result = await ExistUser.save();

    res.json({
      message: "Important link updated successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateImportantLink };
