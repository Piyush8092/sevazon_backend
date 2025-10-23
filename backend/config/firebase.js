const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Priority 1: Check if service account key is provided as JSON string via environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });

            console.log('✅ Firebase initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
        }
        // Priority 2: Check if individual environment variables are provided
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID || '',
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CERT_URL || '',
                universe_domain: "googleapis.com"
            };

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID,
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });

            console.log('✅ Firebase initialized with individual environment variables');
        }
        // Priority 3: Fallback to service account file path (for local development)
        else {
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath))
            });

            console.log('✅ Firebase initialized with service account file');
        }

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin SDK:', error.message);
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
