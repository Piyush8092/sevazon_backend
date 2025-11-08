/**
 * Attestr Service
 * Handles PAN verification and other KYC services through Attestr API
 */

const axios = require('axios');
const attestrConfig = require('../config/attestr');

class AttestrService {
    constructor() {
        this.config = attestrConfig;
        
        // Create axios instance with default configuration
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: this.config.getAuthHeaders(),
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🔍 Attestr API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Attestr API Request Error:', error.message);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Attestr API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('❌ Attestr API Response Error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Verify PAN card
     * @param {string} panNumber - PAN number to verify (format: AAAAA9999A)
     * @param {string} name - Name on PAN card (optional, for enhanced verification)
     * @param {string} dob - Date of birth (optional, format: DD/MM/YYYY)
     * @returns {Promise<Object>} Verification result
     */
    async verifyPAN(panNumber, name = null, dob = null) {
        try {
            // Check if Attestr is enabled
            if (!this.config.isEnabled()) {
                console.warn('⚠️ Attestr integration is disabled. Using fallback verification.');
                return this._fallbackPANVerification(panNumber);
            }

            // Validate configuration
            if (!this.config.isValid()) {
                console.error('❌ Attestr configuration is invalid');
                throw new Error('Attestr configuration is invalid');
            }

            // Normalize PAN number
            const normalizedPAN = panNumber.toString().replace(/[\s-]/g, '').toUpperCase();

            // Validate PAN format
            const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!PAN_PATTERN.test(normalizedPAN)) {
                return {
                    success: false,
                    verified: false,
                    message: 'Invalid PAN format. Expected format: AAAAA9999A',
                    error: 'INVALID_FORMAT',
                };
            }

            console.log(`🔍 Verifying PAN: ${normalizedPAN}`);

            // Prepare request payload
            const payload = {
                pan: normalizedPAN,
            };

            // Add optional fields if provided
            if (name) {
                payload.name = name;
            }
            if (dob) {
                payload.dob = dob;
            }

            // Make API request to Attestr
            // Note: The exact endpoint may vary. Common endpoints are:
            // - /api/v2/public/pan/verify
            // - /api/v2/pan/verification
            const endpoint = this.config.getEndpoint('/public/pan/verify');
            
            const response = await this.client.post(endpoint, payload);

            // Process response
            if (response.data && response.data.success) {
                return {
                    success: true,
                    verified: true,
                    message: 'PAN verified successfully',
                    data: {
                        pan: normalizedPAN,
                        name: response.data.data?.name || name,
                        status: response.data.data?.status || 'VALID',
                        verificationId: response.data.data?.verification_id || `ATTESTR_${Date.now()}`,
                        timestamp: new Date(),
                        provider: 'Attestr',
                        // Include additional data from Attestr response
                        ...response.data.data,
                    },
                };
            } else {
                return {
                    success: false,
                    verified: false,
                    message: response.data?.message || 'PAN verification failed',
                    error: response.data?.error || 'VERIFICATION_FAILED',
                };
            }

        } catch (error) {
            console.error('❌ Error verifying PAN with Attestr:', error.message);
            
            // Handle specific error cases
            if (error.response) {
                // API returned an error response
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 401 || status === 403) {
                    return {
                        success: false,
                        verified: false,
                        message: 'Authentication failed with Attestr API',
                        error: 'AUTH_ERROR',
                    };
                } else if (status === 404) {
                    return {
                        success: false,
                        verified: false,
                        message: 'PAN not found or invalid',
                        error: 'PAN_NOT_FOUND',
                    };
                } else if (status === 429) {
                    return {
                        success: false,
                        verified: false,
                        message: 'Rate limit exceeded. Please try again later.',
                        error: 'RATE_LIMIT',
                    };
                } else {
                    return {
                        success: false,
                        verified: false,
                        message: errorData?.message || 'PAN verification failed',
                        error: errorData?.error || 'API_ERROR',
                    };
                }
            } else if (error.request) {
                // Request was made but no response received
                return {
                    success: false,
                    verified: false,
                    message: 'No response from Attestr API. Please try again.',
                    error: 'NETWORK_ERROR',
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    verified: false,
                    message: 'An unexpected error occurred',
                    error: 'UNKNOWN_ERROR',
                };
            }
        }
    }

    /**
     * Fallback PAN verification (format validation only)
     * Used when Attestr is disabled or unavailable
     */
    _fallbackPANVerification(panNumber) {
        const normalizedPAN = panNumber.toString().replace(/[\s-]/g, '').toUpperCase();
        const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        if (PAN_PATTERN.test(normalizedPAN)) {
            return {
                success: true,
                verified: true,
                message: 'PAN format is valid (fallback verification)',
                data: {
                    pan: normalizedPAN,
                    status: 'FORMAT_VALID',
                    verificationId: `FALLBACK_${Date.now()}`,
                    timestamp: new Date(),
                    provider: 'Fallback',
                    note: 'This is a format-only verification. Real verification requires Attestr API.',
                },
            };
        } else {
            return {
                success: false,
                verified: false,
                message: 'Invalid PAN format',
                error: 'INVALID_FORMAT',
            };
        }
    }

    /**
     * Verify Aadhaar (if needed in the future)
     * @param {string} aadhaarNumber - Aadhaar number to verify
     * @returns {Promise<Object>} Verification result
     */
    async verifyAadhaar(aadhaarNumber) {
        // Placeholder for Aadhaar verification
        // Implementation would be similar to PAN verification
        console.log('ℹ️ Aadhaar verification not yet implemented');
        return {
            success: false,
            verified: false,
            message: 'Aadhaar verification not yet implemented',
            error: 'NOT_IMPLEMENTED',
        };
    }

    /**
     * Get verification status by verification ID
     * @param {string} verificationId - Verification ID from previous verification
     * @returns {Promise<Object>} Verification status
     */
    async getVerificationStatus(verificationId) {
        try {
            if (!this.config.isEnabled() || !this.config.isValid()) {
                throw new Error('Attestr integration is not available');
            }

            const endpoint = this.config.getEndpoint(`/public/verification/${verificationId}`);
            const response = await this.client.get(endpoint);

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('❌ Error getting verification status:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Export singleton instance
module.exports = new AttestrService();

