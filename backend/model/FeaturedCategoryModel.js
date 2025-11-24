const mongoose = require('mongoose');

const featuredCategorySchema = new mongoose.Schema({
  // Type of featured category (seasonal, wedding, education, etc.)
  categoryType: {
    type: String,
    required: true,
    enum: ['seasonal', 'wedding', 'education'],
    index: true,
  },

  // Custom name for this featured category collection (e.g., "Winter Special", "Monsoon Offers")
  customName: {
    type: String,
    required: true,
    trim: true,
  },

  // Custom description for this featured category collection
  customDescription: {
    type: String,
    default: '',
    trim: true,
  },

  // Selected subcategories from ANY category (cross-category selection)
  // Each subcategory stores its parent category info for reference
  selectedSubcategories: {
    type: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        default: '',
      },
      // Parent category information for reference
      parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'serviceListModel',
        required: true,
      },
      parentCategoryName: {
        type: String,
        required: true,
      },
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length > 0; // Must have at least one subcategory
      },
      message: 'At least one subcategory must be selected',
    },
  },

  // Whether this featured category is currently active
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },

  // Optional: Start date for the featured category
  startDate: {
    type: Date,
    default: null,
  },

  // Optional: End date for the featured category
  endDate: {
    type: Date,
    default: null,
  },

  // Admin who set this featured category
  setBy: {
    type: String,
    default: 'admin',
  },

  // Display order/priority
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index to ensure only one active category per type
featuredCategorySchema.index({ categoryType: 1, isActive: 1 });

// Method to check if the featured category has expired
featuredCategorySchema.methods.isExpired = function() {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
};

const FeaturedCategoryModel = mongoose.model('featuredCategory', featuredCategorySchema);

module.exports = FeaturedCategoryModel;

