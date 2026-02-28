const otpModel = require("../../model/otpModel");
const VerifiedPhone = require("../../model/verifiedPhoneModel");

/**
 * Verify OTP for Alternative Phone Number
 * This endpoint verifies the OTP sent to alternative/secondary phone numbers
 * and marks the phone number as verified for the user
 *
 * Use cases:
 * - Job postings with alternative contact numbers
 * - Matrimony profiles with different contact numbers
 * - Service/Business profiles with business phone numbers
 * - Offers with alternative contact numbers
 *
 * @route POST /api/verify-otp-alternative
 * @access Protected (requires authentication)
 */
const verifyOTPAlternative = async (req, res) => {
  try {
    const { phone, otp, usageType } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Clean phone number
    const cleanedPhone = phone.toString().replace(/\D/g, "");
    const last10Digits = cleanedPhone.slice(-10);

    console.log(`🔐 Verifying alternative phone OTP for user ${userId}, phone: ${last10Digits}`);

    // Check if phone number exists in OTP table
    const existPhone = await otpModel.findOne({ phone: last10Digits });
    if (!existPhone) {
      console.log(`❌ No OTP found for phone: ${last10Digits}`);
      return res.status(400).json({
        message: "Invalid phone number or OTP expired",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Verify OTP
    const result = await otpModel.findOne({
      $and: [{ phone: last10Digits }, { otp: otp }],
    });

    if (!result) {
      console.log(`❌ Invalid OTP for phone: ${last10Digits}`);
      return res.status(400).json({
        message: "Invalid OTP",
        status: 400,
        success: false,
        error: true,
      });
    }

    console.log(`✅ OTP verified successfully for alternative phone: ${last10Digits}`);

    // Mark phone number as verified for this user
    const usage = usageType || "other";
    const verifiedPhone = await VerifiedPhone.markAsVerified(userId, last10Digits, usage);

    console.log(`💾 Phone ${last10Digits} marked as verified for user ${userId} (usage: ${usage})`);

    // Delete the OTP after successful verification
    await otpModel.deleteOne({ phone: last10Digits });
    console.log(`🗑️ Deleted OTP for ${last10Digits} after successful verification`);

    // Return success response
    res.json({
      message: "Alternative phone number verified successfully",
      status: 200,
      data: {
        phone: last10Digits,
        verified: true,
        verifiedAt: verifiedPhone.verifiedAt,
        usageType: usage,
      },
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("❌ Error in verifyOTPAlternative:", e);
    res.status(500).json({
      message: "Something went wrong while verifying OTP",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { verifyOTPAlternative };
