// Example: How to integrate FCM notifications into existing controllers

const notificationTriggers = require('../services/notificationTriggers');

// ============================================================================
// Example 1: Integrating with Job Application Controller
// ============================================================================

// In your existing job application controller
const applyForJob = async (req, res) => {
    try {
        // ... existing job application logic ...
        
        const jobApplication = await ApplyModel.create({
            // ... job application data ...
        });

        // Trigger notification to job poster
        await notificationTriggers.onJobApplication({
            employerId: job.userId, // Job poster's ID
            applicantId: req.user._id, // Applicant's ID
            applicantName: req.user.name,
            jobTitle: job.title,
            jobId: job._id
        });

        res.json({
            message: 'Job application submitted successfully',
            status: 200,
            data: jobApplication,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 2: Integrating with News Post Controller
// ============================================================================

const createNewsPost = async (req, res) => {
    try {
        // ... existing news creation logic ...
        
        const newsPost = await NewsPost.create({
            // ... news post data ...
        });

        // Get followers of the news author (you'll need to implement this)
        const followers = await getNewsAuthorFollowers(req.user._id);

        // Trigger notification to followers
        if (followers.length > 0) {
            await notificationTriggers.onNewsPost({
                newsId: newsPost._id,
                title: newsPost.title,
                authorName: req.user.name,
                category: newsPost.category,
                followers: followers.map(f => f._id)
            });
        }

        res.json({
            message: 'News post created successfully',
            status: 200,
            data: newsPost,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 3: Integrating with Property Inquiry
// ============================================================================

const createPropertyInquiry = async (req, res) => {
    try {
        // ... existing inquiry logic ...
        
        const inquiry = await PropertyInquiry.create({
            // ... inquiry data ...
        });

        // Get property details
        const property = await PropertyModel.findById(inquiry.propertyId);

        // Trigger notification to property owner
        await notificationTriggers.onPropertyInquiry({
            propertyOwnerId: property.userId,
            inquirerId: req.user._id,
            inquirerName: req.user.name,
            propertyTitle: property.title,
            inquiryMessage: inquiry.message,
            propertyId: property._id
        });

        res.json({
            message: 'Property inquiry sent successfully',
            status: 200,
            data: inquiry,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 4: Integrating with Service Request
// ============================================================================

const requestService = async (req, res) => {
    try {
        // ... existing service request logic ...
        
        const serviceRequest = await ServiceRequest.create({
            // ... service request data ...
        });

        // Get service details
        const service = await ServiceModel.findById(serviceRequest.serviceId);

        // Trigger notification to service provider
        await notificationTriggers.onServiceRequest({
            providerId: service.userId,
            requesterId: req.user._id,
            requesterName: req.user.name,
            serviceTitle: service.title,
            requestMessage: serviceRequest.message,
            serviceId: service._id
        });

        res.json({
            message: 'Service request sent successfully',
            status: 200,
            data: serviceRequest,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 5: Integrating with Chat/Messaging System
// ============================================================================

const sendMessage = async (req, res) => {
    try {
        // ... existing message sending logic ...
        
        const message = await Message.create({
            // ... message data ...
        });

        // Trigger notification to message recipient(s)
        if (message.chatType === 'private') {
            // Private message
            await notificationTriggers.onNewMessage({
                recipientId: message.recipientId,
                senderId: req.user._id,
                senderName: req.user.name,
                messageText: message.text,
                chatType: 'private',
                messageId: message._id,
                chatId: message.chatId
            });
        } else {
            // Group message - send to all group members except sender
            const groupMembers = await getGroupMembers(message.chatId);
            const recipients = groupMembers.filter(member => 
                member._id.toString() !== req.user._id.toString()
            );

            for (const recipient of recipients) {
                await notificationTriggers.onNewMessage({
                    recipientId: recipient._id,
                    senderId: req.user._id,
                    senderName: req.user.name,
                    messageText: message.text,
                    chatType: 'group',
                    messageId: message._id,
                    chatId: message.chatId
                });
            }
        }

        res.json({
            message: 'Message sent successfully',
            status: 200,
            data: message,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 6: Integrating with Payment System
// ============================================================================

const processPayment = async (req, res) => {
    try {
        // ... existing payment processing logic ...
        
        const payment = await Payment.create({
            // ... payment data ...
        });

        if (payment.status === 'completed') {
            // Payment successful - notify recipient
            await notificationTriggers.onPaymentReceived({
                userId: payment.recipientId,
                amount: payment.amount,
                currency: payment.currency,
                paymentId: payment._id,
                serviceTitle: payment.serviceTitle
            });
        } else if (payment.status === 'failed') {
            // Payment failed - notify payer
            await notificationTriggers.onPaymentFailed({
                userId: payment.payerId,
                amount: payment.amount,
                currency: payment.currency,
                paymentId: payment._id,
                serviceTitle: payment.serviceTitle,
                reason: payment.failureReason
            });
        }

        res.json({
            message: 'Payment processed successfully',
            status: 200,
            data: payment,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Example 7: Integrating with Booking System
// ============================================================================

const createBooking = async (req, res) => {
    try {
        // ... existing booking creation logic ...
        
        const booking = await Booking.create({
            // ... booking data ...
        });

        // Trigger booking confirmation notification
        await notificationTriggers.onBookingConfirmation({
            userId: booking.userId,
            bookingId: booking._id,
            serviceTitle: booking.serviceTitle,
            providerName: booking.providerName,
            bookingDate: booking.date,
            bookingTime: booking.time
        });

        // Schedule reminder notification for 1 day before
        const reminderDate = new Date(booking.date);
        reminderDate.setDate(reminderDate.getDate() - 1);

        if (reminderDate > new Date()) {
            await notificationService.scheduleNotification(
                booking.userId,
                'Booking Reminder',
                `Reminder: You have a booking tomorrow for ${booking.serviceTitle}`,
                {
                    type: 'booking_reminder',
                    bookingId: booking._id.toString()
                },
                reminderDate,
                {
                    category: 'bookings',
                    type: 'reminder',
                    priority: 'normal'
                }
            );
        }

        res.json({
            message: 'Booking created successfully',
            status: 200,
            data: booking,
            success: true,
            error: false
        });

    } catch (error) {
        // ... error handling ...
    }
};

// ============================================================================
// Helper Functions (you'll need to implement these based on your data models)
// ============================================================================

async function getNewsAuthorFollowers(authorId) {
    // Implement logic to get followers of a news author
    // This depends on your follower/subscription system
    return [];
}

async function getGroupMembers(chatId) {
    // Implement logic to get all members of a group chat
    return [];
}

// ============================================================================
// Error Handling Best Practices
// ============================================================================

// Always wrap notification triggers in try-catch to prevent them from
// breaking your main business logic

const safeNotificationTrigger = async (triggerFunction, data) => {
    try {
        await triggerFunction(data);
    } catch (error) {
        console.error('Notification trigger failed:', error);
        // Log the error but don't throw it to avoid breaking main flow
    }
};

// Usage example:
const createJobWithNotification = async (req, res) => {
    try {
        // Main business logic
        const job = await Job.create(req.body);

        // Safe notification trigger
        await safeNotificationTrigger(
            notificationTriggers.onJobApplication,
            {
                employerId: job.userId,
                applicantId: req.user._id,
                applicantName: req.user.name,
                jobTitle: job.title,
                jobId: job._id
            }
        );

        res.json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    applyForJob,
    createNewsPost,
    createPropertyInquiry,
    requestService,
    sendMessage,
    processPayment,
    createBooking,
    safeNotificationTrigger
};
