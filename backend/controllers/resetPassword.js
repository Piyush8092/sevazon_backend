const bcrypt = require("bcryptjs");
const user = require("../model/userModel");
const otpModel = require("../model/otpModel");

const isPhoneNumber = (value) => /^\d{10}$/.test(value);

const resetPassword = async (req, res) => {
  try {
    const emailOrPhone = req.body?.emailOrPhone?.toString().trim() || "";
    const otp = req.body?.otp?.toString().trim() || "";
    const newPassword = req.body?.newPassword?.toString() || "";
    const confirmPassword = req.body?.confirmPassword?.toString() || "";

    if (!emailOrPhone || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email or phone, OTP, and both password fields are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (newPassword.length < 6 || newPassword.length > 50) {
      return res.status(400).json({
        message: "Password must be between 6 and 50 characters",
        status: 400,
        success: false,
        error: true,
      });
    }

    const userQuery = isPhoneNumber(emailOrPhone)
      ? { phone: Number(emailOrPhone) }
      : { email: emailOrPhone };

    const existingUser = await user.findOne(userQuery);

    if (!existingUser) {
      return res.status(404).json({
        message: "Account not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    if (!existingUser.phone) {
      return res.status(400).json({
        message: "No mobile number is linked to this account",
        status: 400,
        success: false,
        error: true,
      });
    }

    const phone = existingUser.phone.toString();
    const otpRecord = await otpModel.findOne({ phone, otp });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
        status: 400,
        success: false,
        error: true,
      });
    }

    existingUser.password = await bcrypt.hash(newPassword, 10);
    await existingUser.save();
    await otpModel.deleteOne({ _id: otpRecord._id });

    return res.json({
      message: "Password reset successfully",
      status: 200,
      data: {
        userId: existingUser._id,
        phone: existingUser.phone,
        email: existingUser.email,
      },
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("❌ Reset password error:", e);
    return res.status(500).json({
      message: "Something went wrong while resetting password",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { resetPassword };