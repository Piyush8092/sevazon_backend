const Payment = require('../../model/paymentModel');
const PricingPlan = require('../../model/pricingPlanModel');
const razorpayService = require('../../services/razorpayService');

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
        let amount;
        if (duration === plan.duration1) {
            amount = plan.price1;
        } else if (duration === plan.duration2) {
            amount = plan.price2;
        } else {
            return res.status(400).json({ 
                message: 'Invalid duration for this plan' 
            });
        }

        // Create Razorpay order
        const receipt = `plan_${planId}_${Date.now()}`;
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
            duration: duration,
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

