
const Payment = require('../../model/paymentModel');
const razorpayService = require('../../services/razorpayService');
const User = require('../../model/userModel');
const PricingPlan = require('../../model/pricingPlanModel');

const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const userId = req.user._id; // From auth middleware

        // Validate required fields
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ 
                message: 'Order ID, Payment ID, and Signature are required' 
            });
        }

        // Find the payment record
        const payment = await Payment.findOne({ razorpayOrderId });
        if (!payment) {
            return res.status(404).json({ 
                message: 'Payment record not found' 
            });
        }

        // Verify that the payment belongs to the user
        if (payment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                message: 'Unauthorized access to payment' 
            });
        }

        // Verify the payment signature
        const isValid = razorpayService.verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            // Update payment status to failed
            payment.status = 'failed';
            payment.errorDescription = 'Invalid payment signature';
            await payment.save();

            return res.status(400).json({ 
                message: 'Payment verification failed',
                error: 'Invalid signature'
            });
        }

        // Fetch payment details from Razorpay
        try {
            const paymentDetails = await razorpayService.fetchPaymentDetails(razorpayPaymentId);

            // Update payment record
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = razorpaySignature;
            payment.status = 'success';
            payment.paymentMethod = paymentDetails.method;
            payment.startDate = new Date();

            // Calculate end date based on duration
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + payment.duration);
            payment.endDate = endDate;

            await payment.save();

            // Fetch plan details and assign benefits to user
            const plan = await PricingPlan.findById(payment.planId);
            if (plan) {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        $set: {
                            activePlan: {
                                planId: plan._id,
                                planTitle: plan.title,
                                planCategory: plan.category,
                                features: plan.features,
                                startDate: payment.startDate,
                                endDate: payment.endDate,
                                amount: payment.amount,
                                status: payment.status,
                            }
                        },
                        $addToSet: { subscriptions: payment._id }
                    }
                );
            }

            res.status(200).json({
                message: 'Payment verified successfully',
                data: {
                    paymentId: payment._id,
                    status: payment.status,
                    planTitle: payment.planTitle,
                    startDate: payment.startDate,
                    endDate: payment.endDate,
                    amount: payment.amount
                }
            });
        } catch (error) {
            console.error('Error fetching payment details:', error);

            // Still mark as success if signature is valid
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = razorpaySignature;
            payment.status = 'success';
            payment.startDate = new Date();

            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + payment.duration);
            payment.endDate = endDate;

            await payment.save();

            // Fetch plan details and assign benefits to user
            const plan = await PricingPlan.findById(payment.planId);
            if (plan) {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        $set: {
                            activePlan: {
                                planId: plan._id,
                                planTitle: plan.title,
                                planCategory: plan.category,
                                features: plan.features,
                                startDate: payment.startDate,
                                endDate: payment.endDate,
                                amount: payment.amount,
                                status: payment.status,
                            }
                        },
                        $addToSet: { subscriptions: payment._id }
                    }
                );
            }

            res.status(200).json({
                message: 'Payment verified successfully',
                data: {
                    paymentId: payment._id,
                    status: payment.status,
                    planTitle: payment.planTitle,
                    startDate: payment.startDate,
                    endDate: payment.endDate,
                    amount: payment.amount
                }
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            message: 'Error verifying payment', 
            error: error.message 
        });
    }
};

module.exports = { verifyPayment };

