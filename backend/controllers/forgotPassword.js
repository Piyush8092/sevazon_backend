const user = require("../model/userModel");
const otpModel = require("../model/otpModel");
const fast2smsService = require("../services/fast2smsService");

const isPhoneNumber = (value) => /^\d{10}$/.test(value);

const maskPhoneNumber = (phone) => {
  if (phone.length < 4) {
    return phone;
  }

  return `******${phone.slice(-4)}`;
};

const forgotPassword = async (req, res) => {
  try {
    const emailOrPhone = req.body?.emailOrPhone?.toString().trim() || "";

    if (!emailOrPhone) {
      return res.status(400).json({
        message: "Email or phone number is required",
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
    const otp = fast2smsService.generateOTP();

    await otpModel.deleteOne({ phone });

    const smsResult = await fast2smsService.sendOTP(phone, otp);

    if (!smsResult.success) {
      return res.status(500).json({
        message: smsResult.message || "Failed to send OTP",
        status: 500,
        success: false,
        error: true,
      });
    }

    await otpModel.create({ phone, otp });

    const responseData = {
      emailOrPhone,
      sentTo: maskPhoneNumber(phone),
      expiresIn: "5 minutes",
    };

    if (process.env.NODE_ENV === "development") {
      responseData.otp = otp;
    }

    return res.json({
      message: "OTP sent successfully to your registered mobile number",
      status: 200,
      data: responseData,
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("❌ Forgot password error:", e);
    return res.status(500).json({
      message: "Something went wrong while sending OTP",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { forgotPassword };