const mongoose = require('mongoose');

const seasonalCategorySchema = new mongoose.Schema({
    // Reference to the service category that should be displayed as seasonal
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'serviceListModel',
        required: [true, 'Category ID is required'],
    },
    
    // Category name (denormalized for quick access)
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
    },
    
    // Category image (denormalized for quick access)
    categoryImage: {
        type: String,
        required: [true, 'Category image is required'],
    },
    
    // Whether this seasonal category is currently active
    isActive: {
        type: Boolean,
        default: true,
    },
    
    // Optional: Start and end dates for the seasonal category
    startDate: {
        type: Date,
    },
    
    endDate: {
        type: Date,
    },
    
    // Admin who set this seasonal category
    setBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Admin user is required'],
    },
    
}, { timestamps: true });

// Ensure only one active seasonal category at a time
seasonalCategorySchema.index({ isActive: 1 });

const SeasonalCategoryModel = mongoose.model('SeasonalCategory', seasonalCategorySchema);

module.exports = SeasonalCategoryModel;

