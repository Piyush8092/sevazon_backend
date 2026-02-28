const Payment = require("../../model/paymentModel");
const PricingPlan = require("../../model/pricingPlanModel");

const createZeroAmountSubscription = async (req, res) => {
  try {
    const { planId, duration } = req.body;
    const userId = req.user._id;

    if (!planId || !duration) {
      return res.status(400).json({
        message: "Plan ID and duration are required",
      });
    }

    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: "Plan is not active" });
    }

    // Determine duration
    let durationNumeric;
    let amount = 0; // ZERO AMOUNT

    if (duration === plan.duration1) {
      durationNumeric = parseInt(plan.duration1.match(/\d+/)[0]);
    } else if (duration === plan.duration2) {
      durationNumeric = parseInt(plan.duration2.match(/\d+/)[0]);
    } else {
      return res.status(400).json({
        message: "Invalid duration for this plan",
      });
    }

    // Create Payment record directly as success
    const payment = new Payment({
      userId,
      planId,
      planTitle: plan.title,
      planCategory: plan.category,
      amount: amount,
      currency: "INR",
      duration: durationNumeric,
      status: "success", // DIRECT SUCCESS
      startDate: new Date(),
    });

    await payment.save();

    return res.status(201).json({
      message: "Zero amount subscription created successfully",
      data: {
        paymentId: payment._id,
        planTitle: plan.title,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating zero amount subscription",
      error: error.message,
    });
  }
};
module.exports = { createZeroAmountSubscription };
