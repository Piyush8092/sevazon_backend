const notificationService = require("./notificationService");

class NotificationTriggers {
  // Chat message notifications
  async onNewMessage(messageData) {
    try {
      const { recipientId, senderId, senderName, messageText, chatType = "private" } = messageData;

      // Don't send notification to the sender
      if (recipientId.toString() === senderId.toString()) {
        return;
      }

      const title =
        chatType === "group" ? `New message in group` : `New message from ${senderName}`;

      const body = messageText.length > 100 ? messageText.substring(0, 100) + "..." : messageText;

      const data = {
        type: "new_message",
        senderId: senderId.toString(),
        senderName,
        chatType,
        messageId: messageData.messageId?.toString(),
      };

      const options = {
        category: "chat",
        type: "newMessage",
        priority: "high",
        senderId,
        relatedEntity: {
          entityType: "chat",
          entityId: messageData.chatId,
        },
      };

      return await notificationService.sendToUser(recipientId, title, body, data, options);
    } catch (error) {
      console.error("Error sending new message notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Incoming call notifications
  async onIncomingCall(callData) {
    try {
      const { recipientId, callerId, callerName, callType = "voice" } = callData;

      const title = `Incoming ${callType} call`;
      const body = `${callerName} is calling you`;

      const data = {
        type: "incoming_call",
        callerId: callerId.toString(),
        callerName,
        callType,
        callId: callData.callId?.toString(),
      };

      const options = {
        category: "calls",
        type: "incomingCall",
        priority: "critical",
        senderId: callerId,
        android: {
          priority: "high",
          notification: {
            channelId: "calls",
            sound: "ringtone",
          },
        },
        ios: {
          sound: "ringtone.caf",
        },
      };

      return await notificationService.sendToUser(recipientId, title, body, data, options);
    } catch (error) {
      console.error("Error sending incoming call notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Missed call notifications
  async onMissedCall(callData) {
    try {
      const { recipientId, callerId, callerName, callType = "voice" } = callData;

      const title = `Missed ${callType} call`;
      const body = `You missed a call from ${callerName}`;

      const data = {
        type: "missed_call",
        callerId: callerId.toString(),
        callerName,
        callType,
      };

      const options = {
        category: "calls",
        type: "missedCall",
        priority: "normal",
        senderId: callerId,
      };

      return await notificationService.sendToUser(recipientId, title, body, data, options);
    } catch (error) {
      console.error("Error sending missed call notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Call answered notifications
  async onCallAnswered(callData) {
    try {
      const { callerId, calleeId, calleeName, callType = "voice" } = callData;

      const title = "Call Answered";
      const body = `${calleeName} answered your ${callType} call`;

      const data = {
        type: "call_answered",
        calleeId: calleeId.toString(),
        calleeName,
        callType,
        callId: callData.callId?.toString(),
      };

      const options = {
        category: "calls",
        type: "callAnswered",
        priority: "high",
        senderId: calleeId,
      };

      return await notificationService.sendToUser(callerId, title, body, data, options);
    } catch (error) {
      console.error("Error sending call answered notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Call declined notifications
  async onCallDeclined(callData) {
    try {
      const { callerId, calleeId, calleeName, callType = "voice" } = callData;

      const title = "Call Declined";
      const body = `${calleeName} declined your ${callType} call`;

      const data = {
        type: "call_declined",
        calleeId: calleeId.toString(),
        calleeName,
        callType,
        callId: callData.callId?.toString(),
      };

      const options = {
        category: "calls",
        type: "callDeclined",
        priority: "normal",
        senderId: calleeId,
      };

      return await notificationService.sendToUser(callerId, title, body, data, options);
    } catch (error) {
      console.error("Error sending call declined notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Call ended notifications
  async onCallEnded(callData) {
    try {
      const {
        recipientId,
        endedByUserId,
        endedByName,
        callType = "voice",
        duration = 0,
      } = callData;

      const title = "Call Ended";
      const body =
        duration > 0
          ? `Call ended after ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`
          : "Call ended";

      const data = {
        type: "call_ended",
        endedByUserId: endedByUserId.toString(),
        endedByName,
        callType,
        duration: duration.toString(),
        callId: callData.callId?.toString(),
      };

      const options = {
        category: "calls",
        type: "callEnded",
        priority: "normal",
        senderId: endedByUserId,
      };

      return await notificationService.sendToUser(recipientId, title, body, data, options);
    } catch (error) {
      console.error("Error sending call ended notification:", error);
      return { success: false, error: error.message };
    }
  }

  // New service offer notifications
  async onNewServiceOffer(offerData) {
    try {
      const { recipientId, offerId, offerTitle, offerCategory, providerId, providerName } =
        offerData;

      const title = "New Service Offer";
      const body = `${providerName} posted a new ${offerCategory} service: ${offerTitle}`;

      const data = {
        type: "new_service_offer",
        offerId: offerId.toString(),
        offerTitle,
        offerCategory,
        providerId: providerId.toString(),
        providerName,
      };

      const options = {
        category: "services",
        type: "newOffer",
        priority: "normal",
        senderId: providerId,
        relatedEntity: {
          entityType: "service",
          entityId: offerId,
        },
      };

      return await notificationService.sendToUser(recipientId, title, body, data, options);
    } catch (error) {
      console.error("Error sending new service offer notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Service request notifications
  async onServiceRequest(requestData) {
    try {
      const { providerId, requesterId, requesterName, serviceTitle, requestMessage } = requestData;

      const title = "New Service Request";
      const body = `${requesterName} is interested in your service: ${serviceTitle}`;

      const data = {
        type: "service_request",
        requesterId: requesterId.toString(),
        requesterName,
        serviceTitle,
        requestMessage,
      };

      const options = {
        category: "services",
        type: "serviceRequest",
        priority: "high",
        senderId: requesterId,
        relatedEntity: {
          entityType: "service",
          entityId: requestData.serviceId,
        },
      };

      return await notificationService.sendToUser(providerId, title, body, data, options);
    } catch (error) {
      console.error("Error sending service request notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Booking confirmation notifications
  async onBookingConfirmation(bookingData) {
    try {
      const { userId, bookingId, serviceTitle, providerName, bookingDate, bookingTime } =
        bookingData;

      const title = "Booking Confirmed";
      const body = `Your booking for ${serviceTitle} with ${providerName} is confirmed for ${bookingDate} at ${bookingTime}`;

      const data = {
        type: "booking_confirmation",
        bookingId: bookingId.toString(),
        serviceTitle,
        providerName,
        bookingDate,
        bookingTime,
      };

      const options = {
        category: "bookings",
        type: "confirmation",
        priority: "high",
        relatedEntity: {
          entityType: "booking",
          entityId: bookingId,
        },
      };

      return await notificationService.sendToUser(userId, title, body, data, options);
    } catch (error) {
      console.error("Error sending booking confirmation notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Booking reminder notifications
  async onBookingReminder(bookingData) {
    try {
      const { userId, bookingId, serviceTitle, providerName, bookingDate, bookingTime } =
        bookingData;

      const title = "Booking Reminder";
      const body = `Reminder: You have a booking for ${serviceTitle} with ${providerName} tomorrow at ${bookingTime}`;

      const data = {
        type: "booking_reminder",
        bookingId: bookingId.toString(),
        serviceTitle,
        providerName,
        bookingDate,
        bookingTime,
      };

      const options = {
        category: "bookings",
        type: "reminder",
        priority: "normal",
        relatedEntity: {
          entityType: "booking",
          entityId: bookingId,
        },
      };

      return await notificationService.sendToUser(userId, title, body, data, options);
    } catch (error) {
      console.error("Error sending booking reminder notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Payment confirmation notifications
  async onPaymentReceived(paymentData) {
    try {
      const { userId, amount, currency = "INR", paymentId, serviceTitle } = paymentData;

      const title = "Payment Received";
      const body = `You received a payment of ${currency} ${amount} for ${serviceTitle}`;

      const data = {
        type: "payment_received",
        paymentId: paymentId.toString(),
        amount: amount.toString(),
        currency,
        serviceTitle,
      };

      const options = {
        category: "payments",
        type: "paymentReceived",
        priority: "high",
        relatedEntity: {
          entityType: "payment",
          entityId: paymentId,
        },
      };

      return await notificationService.sendToUser(userId, title, body, data, options);
    } catch (error) {
      console.error("Error sending payment received notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Payment failed notifications
  async onPaymentFailed(paymentData) {
    try {
      const { userId, amount, currency = "INR", paymentId, serviceTitle, reason } = paymentData;

      const title = "Payment Failed";
      const body = `Your payment of ${currency} ${amount} for ${serviceTitle} failed. ${reason || "Please try again."}`;

      const data = {
        type: "payment_failed",
        paymentId: paymentId.toString(),
        amount: amount.toString(),
        currency,
        serviceTitle,
        reason,
      };

      const options = {
        category: "payments",
        type: "paymentFailed",
        priority: "high",
        relatedEntity: {
          entityType: "payment",
          entityId: paymentId,
        },
      };

      return await notificationService.sendToUser(userId, title, body, data, options);
    } catch (error) {
      console.error("Error sending payment failed notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Job application notifications
  async onJobApplication(applicationData) {
    try {
      const { employerId, applicantId, applicantName, jobTitle, jobId } = applicationData;

      const title = "New Job Application";
      const body = `${applicantName} applied for your job posting: ${jobTitle}`;

      const data = {
        type: "job_application",
        applicantId: applicantId.toString(),
        applicantName,
        jobTitle,
        jobId: jobId.toString(),
      };

      const options = {
        category: "jobs",
        type: "applicationReceived",
        priority: "normal",
        senderId: applicantId,
        relatedEntity: {
          entityType: "job",
          entityId: jobId,
        },
      };

      return await notificationService.sendToUser(employerId, title, body, data, options);
    } catch (error) {
      console.error("Error sending job application notification:", error);
      return { success: false, error: error.message };
    }
  }

  // System announcement notifications
  async onSystemAnnouncement(announcementData) {
    try {
      const { title, message, targetUsers = "all", priority = "normal" } = announcementData;

      const data = {
        type: "system_announcement",
        announcementId: announcementData.announcementId?.toString(),
      };

      const options = {
        category: "system",
        type: "announcement",
        priority,
      };

      if (targetUsers === "all") {
        return await notificationService.sendBroadcast(title, message, data, options);
      } else if (Array.isArray(targetUsers)) {
        return await notificationService.sendToMultipleUsers(
          targetUsers,
          title,
          message,
          data,
          options
        );
      } else {
        return await notificationService.sendToUser(targetUsers, title, message, data, options);
      }
    } catch (error) {
      console.error("Error sending system announcement notification:", error);
      return { success: false, error: error.message };
    }
  }

  // New property inquiry notifications
  async onPropertyInquiry(inquiryData) {
    try {
      const { propertyOwnerId, inquirerId, inquirerName, propertyTitle, inquiryMessage } =
        inquiryData;

      const title = "Property Inquiry";
      const body = `${inquirerName} is interested in your property: ${propertyTitle}`;

      const data = {
        type: "property_inquiry",
        inquirerId: inquirerId.toString(),
        inquirerName,
        propertyTitle,
        inquiryMessage,
      };

      const options = {
        category: "property",
        type: "inquiry",
        priority: "normal",
        senderId: inquirerId,
        relatedEntity: {
          entityType: "property",
          entityId: inquiryData.propertyId,
        },
      };

      return await notificationService.sendToUser(propertyOwnerId, title, body, data, options);
    } catch (error) {
      console.error("Error sending property inquiry notification:", error);
      return { success: false, error: error.message };
    }
  }

  // News post notifications
  async onNewsPost(newsData) {
    try {
      const { newsId, title, authorName, category, followers = [] } = newsData;

      const notificationTitle = "New News Post";
      const body = `${authorName} posted a new article: ${title}`;

      const data = {
        type: "news_post",
        newsId: newsId.toString(),
        title,
        authorName,
        category,
      };

      const options = {
        category: "news",
        type: "newsUpdate",
        priority: "low",
        relatedEntity: {
          entityType: "news",
          entityId: newsId,
        },
      };

      if (followers.length > 0) {
        return await notificationService.sendToMultipleUsers(
          followers,
          notificationTitle,
          body,
          data,
          options
        );
      }

      return { success: true, message: "No followers to notify" };
    } catch (error) {
      console.error("Error sending news post notification:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationTriggers();
