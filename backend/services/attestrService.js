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
     * Verify PAN card (Attestr v2)
     * @param {string} panNumber - PAN number to verify (format: AAAAA9999A)
     * @param {string} name - Name on PAN card (required)
     * @param {string} dob - Date of birth (required, format: DD-MM-YYYY)
     * @returns {Promise<Object>} Verification result
     */
    async verifyPAN(panNumber, name, dob) {
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
            // Validate name and dob
            if (!name || typeof name !== 'string' || !name.trim()) {
                return {
                    success: false,
                    verified: false,
                    message: 'Name is required for PAN verification',
                    error: 'MISSING_NAME',
                };
            }
            if (!dob || typeof dob !== 'string' || !dob.trim()) {
                return {
                    success: false,
                    verified: false,
                    message: 'Date of birth is required for PAN verification',
                    error: 'MISSING_DOB',
                };
            }

            // Prepare request payload according to Attestr API documentation
            // API v2: POST https://api.attestr.com/api/v2/public/checkx/pan/basic
            const payload = {
                pan: normalizedPAN,
                name: name.trim(),
                birthOrIncorporatedDate: dob.trim(),
            };

            // Use correct endpoint for v2 PAN verification
            const endpoint = this.config.getEndpoint('/public/checkx/pan/basic');

            const response = await this.client.post(endpoint, payload);

            // Process response according to Attestr API documentation
            // Response format: { valid: true/false, ...fields }
            if (response.data && response.data.valid === true) {
                return {
                    success: true,
                    verified: true,
                    message: 'PAN verified successfully',
                    data: {
                        pan: normalizedPAN,
                        name: response.data.name,
                        category: response.data.category,
                        panStatus: response.data.panStatus,
                        panStatusCode: response.data.panStatusCode,
                        aadhaarLinked: response.data.aadhaarLinked,
                        nameMatches: response.data.nameMatches,
                        birthOrIncorporatedDateMatches: response.data.birthOrIncorporatedDateMatches,
                        status: response.data.panStatus,
                        verificationId: `ATTESTR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: new Date(),
                        provider: 'Attestr',
                    },
                };
            } else if (response.data && response.data.valid === false) {
                // PAN is invalid or does not exist
                return {
                    success: false,
                    verified: false,
                    message: response.data.message || 'Provided PAN number does not exist',
                    error: 'INVALID_PAN',
                    data: response.data,
                };
            } else {
                return {
                    success: false,
                    verified: false,
                    message: 'PAN verification failed',
                    error: 'VERIFICATION_FAILED',
                    data: response.data,
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
                        data: errorData,
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
     * Verify Voter ID (EPIC)
     * @param {string} epicNumber - Voter ID (EPIC) number to verify
     * @returns {Promise<Object>} Verification result
     */
    async verifyVoterID(epicNumber) {
        try {
            // Check if Attestr is enabled
            if (!this.config.isEnabled()) {
                console.warn('⚠️ Attestr integration is disabled. Using fallback verification.');
                return this._fallbackVoterIDVerification(epicNumber);
            }

            // Validate configuration
            if (!this.config.isValid()) {
                console.error('❌ Attestr configuration is invalid');
                throw new Error('Attestr configuration is invalid');
            }

            // Normalize Voter ID number
            const normalizedEPIC = epicNumber.toString().replace(/[\s-]/g, '').toUpperCase();

            // Validate Voter ID format (3 letters + 7 digits)
            const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/;
            if (!VOTER_ID_PATTERN.test(normalizedEPIC)) {
                return {
                    success: false,
                    verified: false,
                    message: 'Invalid Voter ID format. Expected format: AAA1234567 (3 letters + 7 digits)',
                    error: 'INVALID_FORMAT',
                };
            }

            console.log(`🔍 Verifying Voter ID: ${normalizedEPIC}`);

            // Prepare request payload according to Attestr API documentation
            // API v1: POST https://api.attestr.com/api/v1/public/checkx/epic
            const payload = {
                epic: normalizedEPIC,
            };

            // Make API request to Attestr
            // Endpoint: /public/checkx/epic
            const endpoint = this.config.getEndpoint('/public/checkx/epic');

            const response = await this.client.post(endpoint, payload);

            // Process response according to Attestr API documentation
            // Response format: { valid: true/false, name: "...", gender: "...", state: "...", ... }
            if (response.data && response.data.valid === true) {
                return {
                    success: true,
                    verified: true,
                    message: 'Voter ID verified successfully',
                    data: {
                        epic: normalizedEPIC,
                        name: response.data.name,
                        gender: response.data.gender,
                        state: response.data.state,
                        district: response.data.district,
                        age: response.data.age,
                        dob: response.data.dob,
                        relationName: response.data.relationName,
                        relationType: response.data.relationType,
                        assemblyConstituency: response.data.assemblyConstituency,
                        assemblyConstituencyNumber: response.data.assemblyConstituencyNumber,
                        pollingStation: response.data.pollingStation,
                        parliamentaryConstituency: response.data.parliamentaryConstituency,
                        status: 'VALID',
                        verificationId: `ATTESTR_EPIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: new Date(),
                        provider: 'Attestr',
                    },
                };
            } else if (response.data && response.data.valid === false) {
                // Voter ID is invalid or does not exist
                return {
                    success: false,
                    verified: false,
                    message: response.data.message || 'Provided Voter ID number does not exist',
                    error: 'INVALID_VOTER_ID',
                };
            } else {
                return {
                    success: false,
                    verified: false,
                    message: 'Voter ID verification failed',
                    error: 'VERIFICATION_FAILED',
                };
            }

        } catch (error) {
            console.error('❌ Error verifying Voter ID with Attestr:', error.message);

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
                        message: 'Voter ID not found or invalid',
                        error: 'VOTER_ID_NOT_FOUND',
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
                        message: errorData?.message || 'Voter ID verification failed',
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
     * Fallback Voter ID verification (format validation only)
     * Used when Attestr is disabled or unavailable
     */
    _fallbackVoterIDVerification(epicNumber) {
        const normalizedEPIC = epicNumber.toString().replace(/[\s-]/g, '').toUpperCase();
        const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/;

        if (VOTER_ID_PATTERN.test(normalizedEPIC)) {
            return {
                success: true,
                verified: true,
                message: 'Voter ID format is valid (fallback verification)',
                data: {
                    epic: normalizedEPIC,
                    status: 'FORMAT_VALID',
                    verificationId: `FALLBACK_EPIC_${Date.now()}`,
                    timestamp: new Date(),
                    provider: 'Fallback',
                    note: 'This is a format-only verification. Real verification requires Attestr API.',
                },
            };
        } else {
            return {
                success: false,
                verified: false,
                message: 'Invalid Voter ID format',
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

