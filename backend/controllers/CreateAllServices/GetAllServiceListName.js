let serviceListModel = require("../../model/ServiceListModel");

const GetAllServiceListName = async (req, res) => {
  try {
    // First get all services sorted by createdAt descending
    const services = await serviceListModel.find().sort({ createdAt: 1 });

    const categoriesObject = {};

    services.forEach((service) => {
      const categoryName = service.name;

      if (!categoriesObject[categoryName]) {
        categoriesObject[categoryName] = [];
      }

      if (service.subService && service.subService.length > 0) {
        service.subService.forEach((sub) => {
          if (!categoriesObject[categoryName].includes(sub.name)) {
            categoriesObject[categoryName].push(sub.name);
          }
        });
      }
    });

    res.json({
      message: "Service categories retrieved successfully",
      status: 200,
      data: categoriesObject,
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

module.exports = { GetAllServiceListName };
