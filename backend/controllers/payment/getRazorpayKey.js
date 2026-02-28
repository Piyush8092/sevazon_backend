const razorpayService = require("../../services/razorpayService");

const getRazorpayKey = async (req, res) => {
  try {
    const keyId = razorpayService.getRazorpayKeyId();

    res.status(200).json({
      message: "Razorpay key retrieved successfully",
      data: {
        keyId: keyId,
      },
    });
  } catch (error) {
    console.error("Error fetching Razorpay key:", error);
    res.status(500).json({
      message: "Error fetching Razorpay key",
      error: error.message,
    });
  }
};

module.exports = { getRazorpayKey };
