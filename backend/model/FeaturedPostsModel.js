const mongoose = require("mongoose");

const featuredPostsSchema = new mongoose.Schema(
  {
    // Selected posts from different post types
    // Each post stores its type and reference ID
    selectedPosts: {
      type: [
        {
          postType: {
            type: String,
            required: true,
            enum: ["job", "matrimony", "ad", "property"],
          },
          postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "selectedPosts.postType", // Dynamic reference based on postType
          },
          // Store essential post data for quick display (denormalized for performance)
          postData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
          // Display order within the featured posts section
          displayOrder: {
            type: Number,
            default: 0,
          },
          // When this post was added to featured
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length >= 0; // Can be empty
        },
        message: "Selected posts must be a valid array",
      },
    },

    // Whether this featured posts configuration is currently active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional: Start date for the featured posts
    startDate: {
      type: Date,
      default: null,
    },

    // Optional: End date for the featured posts
    endDate: {
      type: Date,
      default: null,
    },

    // Admin who set this featured posts configuration
    setBy: {
      type: String,
      default: "admin",
    },

    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
featuredPostsSchema.index({ isActive: 1 });

// Method to check if the featured posts configuration has expired
featuredPostsSchema.methods.isExpired = function () {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
};

// Pre-save hook to update lastUpdated
featuredPostsSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const FeaturedPostsModel = mongoose.model("featuredPosts", featuredPostsSchema);

module.exports = FeaturedPostsModel;
