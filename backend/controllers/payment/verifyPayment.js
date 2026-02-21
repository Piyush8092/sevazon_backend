
const Payment = require('../../model/paymentModel');
const razorpayService = require('../../services/razorpayService');
const User = require('../../model/userModel');
const PricingPlan = require('../../model/pricingPlanModel');
const ServiceProfile = require('../../model/createAllServiceProfileModel');

/**
 * Helper function to update user's service/business profiles based on their active plan
 * @param {String} userId - User ID
 * @param {Object} plan - Pricing plan object
 */
const updateUserServiceProfiles = async (userId, plan) => {
    try {
        console.log(`🔄 Updating service profiles for user ${userId} with plan ${plan.title}`);
        
        // Determine the serviceType based on plan features
        let serviceType = 'null';
        if (plan.isFeatured) {
            serviceType = 'featured';
        } else if (plan.isPremium) {
            serviceType = 'premium';
        }

        // Only update if the plan is premium or featured
        if (serviceType !== 'null') {
            // Update all service/business profiles owned by this user
            const updateResult = await ServiceProfile.updateMany(
                { 
                    userId: userId,
                    isActive: true // Only update active profiles
                },
                { 
                    $set: { serviceType: serviceType } 
                }
            );

            console.log(`✅ Updated ${updateResult.modifiedCount} service profile(s) to ${serviceType} for user ${userId}`);
            return updateResult;
        } else {
            console.log(`ℹ️ Plan ${plan.title} is not premium/featured, no profile updates needed`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error updating service profiles for user ${userId}:`, error);
        throw error;
    }
};

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

                // Update user's service/business profiles with the appropriate serviceType
                // Only for service-business category plans
                if (plan.category === 'service-business') {
                    await updateUserServiceProfiles(userId, plan);
                }
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

