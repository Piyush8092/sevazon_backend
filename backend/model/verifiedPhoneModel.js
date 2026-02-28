const mongoose = require("mongoose");

/**
 * Verified Phone Numbers Model
 * Tracks alternative/secondary phone numbers that users have verified via OTP
 * This is separate from the user's registered phone number
 *
 * Use cases:
 * - Job postings with alternative contact numbers
 * - Matrimony profiles with different contact numbers
 * - Service/Business profiles with business phone numbers
 * - Offers with alternative contact numbers
 */
const verifiedPhoneSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate 10-digit Indian phone number
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Phone number must be a valid 10-digit Indian mobile number",
      },
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track where this phone number is being used
    usedIn: [
      {
        type: String,
        enum: ["job", "matrimony", "service", "business", "offer", "other"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one user can verify a phone number only once
verifiedPhoneSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

// Index for quick lookups
verifiedPhoneSchema.index({ phoneNumber: 1 });

/**
 * Static method to check if a phone number is verified for a user
 * @param {ObjectId} userId - User's ID
 * @param {String} phoneNumber - Phone number to check (10 digits)
 * @returns {Promise<Boolean>} - True if verified, false otherwise
 */
verifiedPhoneSchema.statics.isPhoneVerified = async function (userId, phoneNumber) {
  try {
    // Clean phone number (remove +91, spaces, etc.)
    const cleanedPhone = phoneNumber.toString().replace(/\D/g, "");
    const last10Digits = cleanedPhone.slice(-10);

    const verified = await this.findOne({
      userId: userId,
      phoneNumber: last10Digits,
      isActive: true,
    });

    return !!verified;
  } catch (error) {
    console.error("Error checking phone verification:", error);
    return false;
  }
};

/**
 * Static method to mark a phone number as verified for a user
 * @param {ObjectId} userId - User's ID
 * @param {String} phoneNumber - Phone number to verify (10 digits)
 * @param {String} usageType - Where this phone is being used (job, matrimony, etc.)
 * @returns {Promise<Object>} - Verified phone record
 */
verifiedPhoneSchema.statics.markAsVerified = async function (
  userId,
  phoneNumber,
  usageType = "other"
) {
  try {
    // Clean phone number
    const cleanedPhone = phoneNumber.toString().replace(/\D/g, "");
    const last10Digits = cleanedPhone.slice(-10);

    // Check if already verified
    let verifiedPhone = await this.findOne({
      userId: userId,
      phoneNumber: last10Digits,
    });

    if (verifiedPhone) {
      // Update existing record
      if (!verifiedPhone.usedIn.includes(usageType)) {
        verifiedPhone.usedIn.push(usageType);
      }
      verifiedPhone.isActive = true;
      verifiedPhone.verifiedAt = new Date();
      await verifiedPhone.save();
      return verifiedPhone;
    } else {
      // Create new record
      verifiedPhone = new this({
        userId: userId,
        phoneNumber: last10Digits,
        usedIn: [usageType],
      });
      await verifiedPhone.save();
      return verifiedPhone;
    }
  } catch (error) {
    console.error("Error marking phone as verified:", error);
    throw error;
  }
};

const VerifiedPhone = mongoose.model("VerifiedPhone", verifiedPhoneSchema);

module.exports = VerifiedPhone;
