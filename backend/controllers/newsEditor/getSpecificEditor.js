let editorModel = require("../../model/EditorModel");

const getSpecificEditor = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await editorModel.findById({ _id: id });
    if (!result) {
      res.json({ message: "No data found", status: 400, data: {}, success: false, error: true });
    }
    res.json({
      message: "Editor created successfully",
      status: 200,
      data: result,
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

module.exports = { getSpecificEditor };
