let mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "User is required"],
  },
  serviceRequire: {
    type: String,
    required: [true, "Service is required"],
  },
  serviceid: {
    type: String,
    default: "",
  },
  businessid: {
    type: String,
    default: "",
  },
  latitude: {
    type: Number,
    default: null,
  },

  longitude: {
    type: Number,
    default: null,
  },
  location: {
    type: String,
    default: "",
  },
});

const leadModel = mongoose.model("leadModel", leadSchema);

module.exports = leadModel;
