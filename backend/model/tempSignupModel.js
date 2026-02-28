const mongoose = require("mongoose");

/**
 * Temporary Signup Data Model
 * Stores user signup data temporarily until phone number is verified via OTP
 * Data expires after 10 minutes if OTP is not verified
 */
const tempSignupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      sparse: true, // allow multiple null/missing values
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "GENERAL",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes - gives user time to verify OTP
    },
  },
  { timestamps: true }
);

const TempSignup = mongoose.model("TempSignup", tempSignupSchema);

module.exports = TempSignup;
