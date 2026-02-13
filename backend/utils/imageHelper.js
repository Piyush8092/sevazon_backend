/**
 * Helper functions for image handling
 * Supports both base64 encoded images and Firebase Storage URLs
 */

/**
 * Check if a string is a base64 encoded image
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a base64 image
 */
const isBase64Image = (str) => {
    if (!str || typeof str !== 'string') {
        return false;
    }
    
    // Check for data URL format: data:image/...;base64,...
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|bmp);base64,/i;
    return base64Regex.test(str);
};

/**
 * Check if a string is a Firebase Storage URL
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a Firebase Storage URL
 */
const isFirebaseStorageUrl = (str) => {
    if (!str || typeof str !== 'string') {
        return false;
    }
    
    // Check for Firebase Storage URL patterns
    const firebaseUrlPatterns = [
        /^https:\/\/storage\.googleapis\.com\//i,
        /^https:\/\/firebasestorage\.googleapis\.com\//i,
        /^gs:\/\//i
    ];
    
    return firebaseUrlPatterns.some(pattern => pattern.test(str));
};

/**
 * Check if a string is a valid HTTP/HTTPS URL
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a valid URL
 */
const isValidUrl = (str) => {
    if (!str || typeof str !== 'string') {
        return false;
    }
    
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
};

/**
 * Validate image string - accepts both base64 and URLs
 * @param {string} imageStr - The image string to validate
 * @returns {object} - { valid: boolean, type: 'base64' | 'url' | 'invalid', message: string }
 */
const validateImageString = (imageStr) => {
    if (!imageStr || typeof imageStr !== 'string') {
        return {
            valid: false,
            type: 'invalid',
            message: 'Image string is required and must be a string'
        };
    }
    
    if (isBase64Image(imageStr)) {
        return {
            valid: true,
            type: 'base64',
            message: 'Valid base64 image'
        };
    }
    
    if (isFirebaseStorageUrl(imageStr) || isValidUrl(imageStr)) {
        return {
            valid: true,
            type: 'url',
            message: 'Valid image URL'
        };
    }
    
    return {
        valid: false,
        type: 'invalid',
        message: 'Image must be either a base64 encoded string or a valid URL'
    };
};

/**
 * Validate array of image strings
 * @param {Array<string>} images - Array of image strings to validate
 * @returns {object} - { valid: boolean, invalidImages: Array, message: string }
 */
const validateImageArray = (images) => {
    if (!Array.isArray(images)) {
        return {
            valid: false,
            invalidImages: [],
            message: 'Images must be an array'
        };
    }
    
    const invalidImages = [];
    
    images.forEach((img, index) => {
        const validation = validateImageString(img);
        if (!validation.valid) {
            invalidImages.push({
                index,
                image: img,
                reason: validation.message
            });
        }
    });
    
    if (invalidImages.length > 0) {
        return {
            valid: false,
            invalidImages,
            message: `${invalidImages.length} invalid image(s) found`
        };
    }
    
    return {
        valid: true,
        invalidImages: [],
        message: 'All images are valid'
    };
};

module.exports = {
    isBase64Image,
    isFirebaseStorageUrl,
    isValidUrl,
    validateImageString,
    validateImageArray
};

