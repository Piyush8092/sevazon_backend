const mongoose = require('mongoose');

const featuredCategorySchema = new mongoose.Schema({
  // Type of featured category (seasonal, wedding, education, etc.)
  categoryType: {
    type: String,
    required: true,
    enum: ['seasonal', 'wedding', 'education'],
    index: true,
  },

  // Reference to the actual category from serviceListModel
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceListModel',
    required: true,
  },

  // Store category name for quick access
  categoryName: {
    type: String,
    required: true,
  },

  // Store category image for quick access
  categoryImage: {
    type: String,
    default: '',
  },

  // Selected subcategories for this featured category
  // Stores array of subcategory objects with _id, name, and image
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
    }],
    default: [],
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

