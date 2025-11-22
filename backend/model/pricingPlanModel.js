const mongoose = require("mongoose");

const pricingPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Plan title is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Plan category is required"],
    enum: ["service-business", "post", "ads"],
    trim: true,
  },
  price1: {
    type: Number,
    required: [true, "Price 1 is required"],
    min: [0, "Price cannot be negative"],
  },
  price2: {
    type: Number,
    required: [true, "Price 2 is required"],
    min: [0, "Price cannot be negative"],
  },
  originalPrice: {
    type: Number,
    required: [true, "Original price is required"],
    min: [0, "Price cannot be negative"],
  },
  GSTPercentage: {
    type: Number,
    required: [true, "GST percentage is required"],
    min: [0, "GST cannot be negative"],
    max: [100, "GST cannot exceed 100%"],
  },
  duration1: {
    type: String,
    required: [true, "Duration 1 is required"],
    min: [1, "Duration must be at least 1 month"],
  },
  duration2: {
    type: String,
    required: [true, "Duration 2 is required"],
    min: [1, "Duration must be at least 1 month"],
  },
  perMonth: {
    type: Number,
    required: [true, "Per month price is required"],
    min: [0, "Price cannot be negative"],
  },
  features: {
    type: [String],
    required: [true, "At least one feature is required"],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "At least one feature is required",
    },
  },
  buttonText: {
    type: String,
    default: "Pay Now",
    trim: true,
  },
  // Styling options
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  titleColor: {
    type: String,
    default: "#E74C3C", // Red color
  },
  borderColor: {
    type: String,
    default: "#BDBDBD", // Grey color
  },
  // Ad-specific options
  showAdExample: {
    type: Boolean,
    default: false,
  },
  isFullPage: {
    type: Boolean,
    default: false,
  },
  isLastPlan: {
    type: Boolean,
    default: false,
  },
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  // Display order
  displayOrder: {
    type: Number,
    default: 0,
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
pricingPlanSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt timestamp before updating
pricingPlanSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const PricingPlan = mongoose.model("PricingPlan", pricingPlanSchema);

module.exports = PricingPlan;
