const crypto = require('crypto');

// Razorpay credentials from environment or hardcoded test credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RbcIqeqPdFohCS';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'aOj1BahCzslUp1f55C3ayuAO';

/**
 * Create a Razorpay order
 * Note: Since we don't have the Razorpay SDK installed, we'll use the REST API directly
 */
const createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
    try {
        const orderData = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: currency,
            receipt: receipt,
            notes: notes
        };

        // Create basic auth header
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        // Make API call to Razorpay
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Razorpay API error: ${errorData.error?.description || 'Unknown error'}`);
        }

        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 */
const fetchPaymentDetails = async (paymentId) => {
    try {
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Razorpay API error: ${errorData.error?.description || 'Unknown error'}`);
        }

        const payment = await response.json();
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error;
    }
};

/**
 * Get Razorpay key ID for frontend
 */
const getRazorpayKeyId = () => {
    return RAZORPAY_KEY_ID;
};

module.exports = {
    createOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
    getRazorpayKeyId
};

