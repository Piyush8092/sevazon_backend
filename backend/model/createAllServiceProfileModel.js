let mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    // Profile Type - determines which fields are required
    profileType: {
      type: String,
      enum: ["Service Profile", "Business Profile"],
      required: [true, "Profile type is required"],
    },

    // Basic Profile Info
    profileImage: {
      type: String,
      required: [true, "Profile image is required"],
    },
    yourName: {
      type: String,
      // required: [true, 'Your name is required'],
    },
    businessName: {
      type: String,
      // required: function() {
      //     return this.profileType === 'Business Profile';
      // },
    },
    serviceType: {
      type: String,
      enum: ["premium", "featured", "null"],
      default: "null",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },
    district: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    area: {
      type: String,
      required: [true, "Area is required"],
    },
    houseNumberBuilding: {
      type: String,
      required: false, // Optional field
    },
    landmark: {
      type: String,
      required: false, // Optional field
    },
    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    // Category Information
    selectCategory: {
      type: String,
      required: [true, "Category is required"],
    },
    selectSubCategory: {
      type: String,
      required: [true, "Sub-category is required"],
    },
    subCategoryOther: {
      type: String,
      required: function () {
        return this.selectSubCategory === "Other";
      },
    },
    customSubCategoryRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customSubCategoryRequest",
      default: null,
    },
    customSubCategoryApprovalStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Rejected"],
      default: "None",
    },

    // Business/Service Details
    description: {
      type: String,
      required: function () {
        return this.profileType === "Service Profile";
      },
    },
    businessSummary: {
      type: String,
      required: function () {
        return this.profileType === "Business Profile";
      },
    },
    locationURL: {
      type: String,
      required: false, // Made optional - not all users may have location URL
    },
    experience: {
      type: String,
      required: false, // Optional field
    },
    establishedInYear: {
      type: String,
    },
    timing: {
      type: String,
    },
    email: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },

    // Contact & Communication
    allowCallInApp: {
      type: Boolean,
      default: false,
      required: [true, "Allow call in app preference is required"],
    },
    allowCallViaPhone: {
      type: Boolean,
      default: false,
      required: [true, "Allow call via phone preference is required"],
    },
    phoneNumberForCalls: {
      type: String,
      required: function () {
        return this.allowCallViaPhone === true;
      },
    },
    allowChat: {
      type: Boolean,
      default: false,
      required: [true, "Allow chat preference is required"],
    },

    // Media
    workServiceImages: {
      type: [String],
    },
    timeSlot: {
      type: [String],
      required: function () {
        return this.profileType === "Service Profile";
      },
    },
    catalogImages: {
      type: [
        {
          image: {
            type: String,
            required: true,
          },
          price: {
            type: String,
            required: true,
          },
        },
      ],
    },

    likes: [
      {
        userId: {
          type: String,
        },
        like: {
          type: Boolean,
          default: true,
        },
      },
    ],
    dislikes: [
      {
        userId: {
          type: String,
        },
        dislike: {
          type: Boolean,
          default: true,
        },
      },
    ],

    comments: [
      {
        userId: {
          type: String,
        },
        userName: {
          type: String,
        },
        review: {
          type: String,
        },
        ratting: {
          type: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    importantLink: [
      {
        link: {
          type: String,
        },
        linkName: {
          type: String,
        },
      },
    ],
    paymentDetails: {
      qrImage: {
        type: String,
        default: null,
      },
      upiId: {
        type: String,
        default: null,
      },
    },
    // User Reference
    // GSTIN for Business profiles
    gstin: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty/null
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: "Please enter a valid 15-character GSTIN",
      },
    },
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },

    featuredProfileBadge: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    premiumProfileBadge: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    topVisibilityInSearch: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    getMoreLeads: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    videoCallAccess: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    securePaymentSystem: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    profileTimeSlots: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    uploadMoreImages: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    serviceCatalogue: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    socialMediaLinks: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    websiteLink: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    reportAndBlock: [
      {
        report: {
          type: String,
          required: [true, "Report is required"],
        },
        block: {
          type: Boolean,
          default: false,
        },
        reportAndBlockID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to handle conditional validation
profileSchema.pre("save", function (next) {
  // Additional validation logic can be added here if needed
  next();
});

const ProfileModel = mongoose.model("ProfileModel", profileSchema);

module.exports = ProfileModel;
