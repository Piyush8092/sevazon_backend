const Payment = require('../../model/paymentModel');
const PricingPlan = require('../../model/pricingPlanModel');
const razorpayService = require('../../services/razorpayService');

/**
 * Extract numeric value from duration string
 * Examples: "3 months" -> 3, "10 days" -> 10, "6" -> 6
 */
const extractNumericDuration = (durationStr) => {
    if (!durationStr) return 3; // Default to 3 months

    // If it's already a number, return it
    if (typeof durationStr === 'number') return durationStr;

    // Extract first number from string
    const match = durationStr.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 3; // Default to 3 if no number found
};

const createPaymentOrder = async (req, res) => {
    try {
        const { planId, duration } = req.body;
        const userId = req.user._id; // From auth middleware

        // Validate required fields
        if (!planId || !duration) {
            return res.status(400).json({ 
                message: 'Plan ID and duration are required' 
            });
        }

        // Fetch the pricing plan
        const plan = await PricingPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ 
                message: 'Pricing plan not found' 
            });
        }

        if (!plan.isActive) {
            return res.status(400).json({ 
                message: 'This plan is no longer active' 
            });
        }

        // Determine the amount based on duration
        // Duration comes as a string (e.g., "3 months", "10 days") from pricing plan
        let amount;
        let durationNumeric; // Extract numeric value for payment record

        if (duration === plan.duration1) {
            amount = plan.price1;
            durationNumeric = extractNumericDuration(plan.duration1);
        } else if (duration === plan.duration2) {
            amount = plan.price2;
            durationNumeric = extractNumericDuration(plan.duration2);
        } else {
            return res.status(400).json({
                message: 'Invalid duration for this plan'
            });
        }

        // Create Razorpay order
        // Receipt must be max 40 chars - use shortened format
        const timestamp = Date.now().toString();
        const shortPlanId = planId.toString().substring(0, 8); // First 8 chars of planId
        const receipt = `p${shortPlanId}${timestamp.substring(timestamp.length - 10)}`; // Max 19 chars

        const notes = {
            planId: planId.toString(),
            planTitle: plan.title,
            userId: userId.toString(),
            duration: duration
        };

        const razorpayOrder = await razorpayService.createOrder(amount, 'INR', receipt, notes);

        // Create payment record in database
        const payment = new Payment({
            userId: userId,
            planId: planId,
            planTitle: plan.title,
            planCategory: plan.category,
            amount: amount,
            currency: 'INR',
            duration: durationNumeric, // Store numeric value in payment record
            razorpayOrderId: razorpayOrder.id,
            status: 'created'
        });

        await payment.save();

        res.status(201).json({
            message: 'Payment order created successfully',
            data: {
                orderId: razorpayOrder.id,
                amount: amount,
                currency: 'INR',
                keyId: razorpayService.getRazorpayKeyId(),
                paymentId: payment._id,
                planTitle: plan.title,
                duration: duration
            }
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({ 
            message: 'Error creating payment order', 
            error: error.message 
        });
    }
};

module.exports = { createPaymentOrder };

