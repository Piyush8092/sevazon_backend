/**
 * Fast2SMS Service
 * Handles SMS sending for OTP verification through Fast2SMS API
 * Documentation: https://docs.fast2sms.com/
 */

const axios = require('axios');

class Fast2SMSService {
    constructor() {
        // Fast2SMS API Configuration
        this.apiKey = process.env.FAST2SMS_API_KEY || 'OWBD89X6mgzj7tUOSBSmsv6Mk3kEwyB8wGQN24P8cAme9l9jqdQ2lhhjxGlF';
        this.baseUrl = 'https://www.fast2sms.com/dev';
        this.senderId = process.env.FAST2SMS_SENDER_ID || 'LOKDGS'; // Sender ID from your Fast2SMS account

        // Create axios instance with default configuration
        // NOTE: For GET requests, authorization must be sent as query parameter
        // For POST requests, authorization must be sent in header
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000, // 30 seconds timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`📤 Fast2SMS API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Fast2SMS API Request Error:', error.message);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Fast2SMS API Response: ${response.status}`);
                return response;
            },
            (error) => {
                console.error('❌ Fast2SMS API Response Error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );

        console.log('📱 Fast2SMS Service initialized');
        console.log(`🔐 API Key: ${this.apiKey ? 'Configured' : 'Not configured'}`);
    }

    /**
     * Generate a random 4-digit OTP
     * @returns {string} 4-digit OTP
     */
    generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Send OTP via SMS using Fast2SMS
     * @param {string} phoneNumber - 10-digit phone number
     * @param {string} otp - OTP to send
     * @returns {Promise<Object>} Response from Fast2SMS API
     */
    async sendOTP(phoneNumber, otp) {
        try {
            console.log(`📤 Sending OTP to ${phoneNumber}`);

            // Clean phone number (remove +91 or any non-digit characters)
            const cleanedPhone = this.cleanPhoneNumber(phoneNumber);

            // Validate phone number
            if (!this.isValidPhoneNumber(cleanedPhone)) {
                throw new Error('Invalid phone number format. Must be 10 digits.');
            }

            // Prepare request parameters - using 'dlt' route (DLT registered template)
            // Template: "Your OTP for Loklink account verification is {#var#}. {#var#}"
            // Template ID: 208749 (as per your Fast2SMS dashboard)
            // IMPORTANT: For GET requests, authorization must be included as a query parameter
            const params = {
                authorization: this.apiKey, // API key as query parameter for GET requests
                route: 'dlt', // DLT route for production with registered templates
                sender_id: this.senderId, // LOKDGS - your registered sender ID
                message: '208749', // DLT Template ID from your Fast2SMS account
                variables_values: `${otp}|`, // Variables for template: {#var#} = OTP
                flash: 0, // 0 for normal SMS, 1 for flash SMS
                numbers: cleanedPhone,
            };

            console.log(`📱 Sending SMS with params:`, {
                ...params,
                authorization: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set', // Masked for security
                numbers: `${cleanedPhone.substring(0, 3)}****${cleanedPhone.substring(7)}` // Masked for security
            });

            // Make API request
            const response = await this.client.get('/bulkV2', { params });

            console.log(`✅ SMS sent successfully to ${cleanedPhone}`);
            console.log(`📊 Response:`, response.data);

            return {
                success: true,
                message: 'OTP sent successfully',
                data: response.data,
                phone: cleanedPhone,
            };

        } catch (error) {
            console.error('❌ Error sending OTP:', error.message);
            
            // Handle specific error cases
            if (error.response) {
                console.error('📊 Error response:', error.response.data);
                return {
                    success: false,
                    message: error.response.data?.message || 'Failed to send OTP',
                    error: error.response.data,
                };
            }

            return {
                success: false,
                message: 'Failed to send OTP due to network error',
                error: error.message,
            };
        }
    }

    /**
     * Clean phone number - remove country code and non-digit characters
     * @param {string} phone - Phone number to clean
     * @returns {string} Cleaned 10-digit phone number
     */
    cleanPhoneNumber(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // Remove country code if present (assuming +91 for India)
        if (cleaned.startsWith('91') && cleaned.length > 10) {
            cleaned = cleaned.substring(2);
        }

        // Take last 10 digits if longer than 10
        if (cleaned.length > 10) {
            cleaned = cleaned.substring(cleaned.length - 10);
        }

        return cleaned;
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid, false otherwise
     */
    isValidPhoneNumber(phone) {
        // Indian phone numbers: 10 digits starting with 6-9
        return /^[6-9]\d{9}$/.test(phone);
    }
}

// Export singleton instance
module.exports = new Fast2SMSService();

