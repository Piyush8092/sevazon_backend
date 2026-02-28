const admin = require("firebase-admin");
const { initializeFirebase } = require("../../config/firebase");
const multer = require("multer");
const path = require("path");

// Initialize Firebase
initializeFirebase();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
    }
  },
});

/**
 * Upload single image to Firebase Storage
 * POST /api/upload/image
 * Accepts: multipart/form-data with 'image' field
 * Returns: { url: string, fileName: string }
 */
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided",
        status: 400,
        success: false,
        error: true,
      });
    }

    const file = req.file;
    const bucket = admin.storage().bucket("gs://loklink.firebasestorage.app");

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const fileName = `images/${timestamp}_${randomString}${fileExtension}`;

    // Create a file reference in Firebase Storage
    const fileUpload = bucket.file(fileName);

    // Create a write stream
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: randomString,
        },
      },
      resumable: false,
    });

    // Handle stream errors
    stream.on("error", (error) => {
      console.error("❌ Error uploading to Firebase Storage:", error);
      return res.status(500).json({
        message: "Failed to upload image",
        status: 500,
        data: error.message,
        success: false,
        error: true,
      });
    });

    // Handle successful upload
    stream.on("finish", async () => {
      try {
        // Make the file publicly accessible
        await fileUpload.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        console.log("✅ Image uploaded successfully:", publicUrl);

        res.json({
          message: "Image uploaded successfully",
          status: 200,
          data: {
            url: publicUrl,
            fileName: fileName,
          },
          success: true,
          error: false,
        });
      } catch (error) {
        console.error("❌ Error making file public:", error);
        return res.status(500).json({
          message: "Failed to make image public",
          status: 500,
          data: error.message,
          success: false,
          error: true,
        });
      }
    });

    // Write the file buffer to the stream
    stream.end(file.buffer);
  } catch (error) {
    console.error("❌ Error in uploadSingleImage:", error);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

/**
 * Upload multiple images to Firebase Storage
 * POST /api/upload/images
 * Accepts: multipart/form-data with 'images' field (multiple files)
 * Returns: { urls: Array<{ url: string, fileName: string }> }
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No image files provided",
        status: 400,
        success: false,
        error: true,
      });
    }

    const bucket = admin.storage().bucket("gs://loklink.firebasestorage.app");
    const uploadPromises = [];

    // Upload each file
    for (const file of req.files) {
      const uploadPromise = new Promise(async (resolve, reject) => {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExtension = path.extname(file.originalname);
          const fileName = `images/${timestamp}_${randomString}${fileExtension}`;

          // Create a file reference
          const fileUpload = bucket.file(fileName);

          // Upload the file
          await fileUpload.save(file.buffer, {
            metadata: {
              contentType: file.mimetype,
            },
            resumable: false,
          });

          // Make the file public
          await fileUpload.makePublic();

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          resolve({
            url: publicUrl,
            fileName: fileName,
          });
        } catch (error) {
          reject(error);
        }
      });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    console.log(`✅ ${uploadedFiles.length} images uploaded successfully`);

    res.json({
      message: `${uploadedFiles.length} images uploaded successfully`,
      status: 200,
      data: {
        urls: uploadedFiles,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("❌ Error in uploadMultipleImages:", error);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
};
