const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Check if service account key is provided via environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        } else {
            // Fallback to service account file path
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';
            
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath))
            });
        }

        console.log('Firebase Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw new Error('Firebase initialization failed');
    }
};

// Get Firebase messaging instance
const getMessaging = () => {
    const app = initializeFirebase();
    return admin.messaging(app);
};

// Validate FCM token format
const isValidFCMToken = (token) => {
    if (!token || typeof token !== 'string') {
        return false;
    }
    
    // Basic FCM token validation (tokens are typically 152+ characters)
    const fcmTokenRegex = /^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/;
    return token.length >= 140 && (fcmTokenRegex.test(token) || token.includes(':'));
};

module.exports = {
    initializeFirebase,
    getMessaging,
    isValidFCMToken,
    admin
};
