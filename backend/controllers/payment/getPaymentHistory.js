const Payment = require("../../model/paymentModel");

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const payments = await Payment.find({ userId })
      .populate("planId", "title category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Payment history retrieved successfully",
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

module.exports = { getPaymentHistory };
