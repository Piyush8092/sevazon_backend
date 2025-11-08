/**
 * Attestr API Configuration
 * Handles PAN verification and other KYC services through Attestr API
 */

class AttestrConfig {
    constructor() {
        // Attestr credentials from environment variables (recommended) or fallback to provided values
        this.appName = process.env.ATTESTR_APP_NAME || 'OX0wC1E9VfeCmg-WEV';
        this.appId = process.env.ATTESTR_APP_ID || '5e24a57a567dc852589c0d1e7676332e';
        this.appSecret = process.env.ATTESTR_APP_SECRET || 'c151b05c0c0ce49992afc08174d5525c5be9a4d89265bff1';
        this.apiToken = process.env.ATTESTR_API_TOKEN || 'T1gwd0MxRTlWZmVDbWctV0VWLjVlMjRhNTdhNTY3ZGM4NTI1ODljMGQxZTc2NzYzMzJlOmMxNTFiMDVjMGMwY2U0OTk5MmFmYzA4MTc0ZDU1MjVjNWJlOWE0ZDg5MjY1YmZmMQ==';
        
        // Attestr API base URL
        this.baseUrl = process.env.ATTESTR_BASE_URL || 'https://api.attestr.com';
        
        // API version
        this.apiVersion = process.env.ATTESTR_API_VERSION || 'v2';
        
        // Timeout settings
        this.timeout = parseInt(process.env.ATTESTR_TIMEOUT || '30000', 10); // 30 seconds
        
        // Enable/disable Attestr integration
        this.enabled = process.env.ATTESTR_ENABLED !== 'false'; // Enabled by default
        
        // Log configuration on initialization (without exposing secrets)
        this._logConfig();
    }

    /**
     * Get the full API endpoint URL
     */
    getEndpoint(path) {
        return `${this.baseUrl}/api/${this.apiVersion}${path}`;
    }

    /**
     * Get authorization headers for Attestr API
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * Check if Attestr integration is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Validate configuration
     */
    isValid() {
        return !!(this.appName && this.appId && this.appSecret && this.apiToken);
    }

    /**
     * Log configuration (without exposing secrets)
     */
    _logConfig() {
        console.log('📋 Attestr Configuration:');
        console.log(`   - App Name: ${this.appName}`);
        console.log(`   - App ID: ${this.appId ? '***' + this.appId.slice(-4) : 'Not set'}`);
        console.log(`   - Base URL: ${this.baseUrl}`);
        console.log(`   - API Version: ${this.apiVersion}`);
        console.log(`   - Enabled: ${this.enabled}`);
        console.log(`   - Valid: ${this.isValid()}`);
    }
}

// Export singleton instance
module.exports = new AttestrConfig();

