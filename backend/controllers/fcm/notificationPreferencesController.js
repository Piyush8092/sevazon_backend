const NotificationPreferences = require("../../model/notificationPreferencesModel");

// Get user's notification preferences
const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const preferences = await NotificationPreferences.findOrCreateForUser(userId);

    res.json({
      message: "Notification preferences retrieved successfully",
      status: 200,
      data: preferences,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving notification preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Update user's notification preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Validate the update structure
    const allowedTopLevelKeys = ["globalSettings", "categories"];
    const providedKeys = Object.keys(updates);

    const invalidKeys = providedKeys.filter((key) => !allowedTopLevelKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        message: `Invalid keys provided: ${invalidKeys.join(", ")}. Allowed keys: ${allowedTopLevelKeys.join(", ")}`,
        status: 400,
        success: false,
        error: true,
      });
    }

    let preferences = await NotificationPreferences.findOne({ userId });

    if (!preferences) {
      preferences = NotificationPreferences.getDefaultPreferences(userId);
    }

    // Update global settings if provided
    if (updates.globalSettings) {
      Object.assign(preferences.globalSettings, updates.globalSettings);
    }

    // Update category settings if provided
    if (updates.categories) {
      Object.keys(updates.categories).forEach((category) => {
        if (preferences.categories[category]) {
          Object.assign(preferences.categories[category], updates.categories[category]);
        }
      });
    }

    await preferences.save();

    res.json({
      message: "Notification preferences updated successfully",
      status: 200,
      data: preferences,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Reset preferences to default
const resetPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete existing preferences
    await NotificationPreferences.deleteOne({ userId });

    // Create new default preferences
    const defaultPreferences = NotificationPreferences.getDefaultPreferences(userId);
    await defaultPreferences.save();

    res.json({
      message: "Notification preferences reset to default successfully",
      status: 200,
      data: defaultPreferences,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error resetting notification preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Update specific category preferences
const updateCategoryPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.params;
    const updates = req.body;

    // Validate category
    const validCategories = [
      "chat",
      "calls",
      "services",
      "bookings",
      "payments",
      "jobs",
      "property",
      "news",
      "system",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Valid categories: ${validCategories.join(", ")}`,
        status: 400,
        success: false,
        error: true,
      });
    }

    let preferences = await NotificationPreferences.findOrCreateForUser(userId);

    // Update the specific category
    if (preferences.categories[category]) {
      Object.assign(preferences.categories[category], updates);
      await preferences.save();
    }

    res.json({
      message: `${category} notification preferences updated successfully`,
      status: 200,
      data: preferences.categories[category],
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating category preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get specific category preferences
const getCategoryPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.params;

    // Validate category
    const validCategories = [
      "chat",
      "calls",
      "services",
      "bookings",
      "payments",
      "jobs",
      "property",
      "news",
      "system",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Valid categories: ${validCategories.join(", ")}`,
        status: 400,
        success: false,
        error: true,
      });
    }

    const preferences = await NotificationPreferences.findOrCreateForUser(userId);

    res.json({
      message: `${category} notification preferences retrieved successfully`,
      status: 200,
      data: preferences.categories[category],
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving category preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Toggle global notifications
const toggleGlobalNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "enabled field must be a boolean value",
        status: 400,
        success: false,
        error: true,
      });
    }

    let preferences = await NotificationPreferences.findOrCreateForUser(userId);

    preferences.globalSettings.enableNotifications = enabled;
    await preferences.save();

    res.json({
      message: `Global notifications ${enabled ? "enabled" : "disabled"} successfully`,
      status: 200,
      data: {
        enableNotifications: preferences.globalSettings.enableNotifications,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error toggling global notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Update quiet hours
const updateQuietHours = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enabled, startTime, endTime } = req.body;

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (startTime && !timeRegex.test(startTime)) {
      return res.status(400).json({
        message: "Invalid startTime format. Use HH:MM format (e.g., 22:00)",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (endTime && !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: "Invalid endTime format. Use HH:MM format (e.g., 08:00)",
        status: 400,
        success: false,
        error: true,
      });
    }

    let preferences = await NotificationPreferences.findOrCreateForUser(userId);

    // Update quiet hours settings
    if (typeof enabled === "boolean") {
      preferences.globalSettings.quietHours.enabled = enabled;
    }
    if (startTime) {
      preferences.globalSettings.quietHours.startTime = startTime;
    }
    if (endTime) {
      preferences.globalSettings.quietHours.endTime = endTime;
    }

    await preferences.save();

    res.json({
      message: "Quiet hours updated successfully",
      status: 200,
      data: preferences.globalSettings.quietHours,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating quiet hours:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  resetPreferences,
  updateCategoryPreferences,
  getCategoryPreferences,
  toggleGlobalNotifications,
  updateQuietHours,
};
