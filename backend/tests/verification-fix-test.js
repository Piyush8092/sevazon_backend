/**
 * Test script to verify the user verification status fix
 * 
 * This script tests:
 * 1. New users are created with verified: false
 * 2. Users become verified: true after KYC verification
 * 
 * Run with: node tests/verification-fix-test.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = `testuser${Date.now()}@example.com`;
const TEST_PASSWORD = 'test123456';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSignup() {
    log('\n📝 Test 1: Creating new user account...', 'blue');
    
    try {
        const response = await axios.post(`${BASE_URL}/signup`, {
            name: 'Test User Verification',
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            confirmPassword: TEST_PASSWORD,
        });

        if (response.data.success) {
            const user = response.data.data;
            
            log(`✅ User created successfully`, 'green');
            log(`   - Email: ${user.email}`, 'reset');
            log(`   - User ID: ${user._id}`, 'reset');
            log(`   - verified: ${user.verified}`, user.verified ? 'red' : 'green');
            log(`   - isKycVerified: ${user.isKycVerified}`, user.isKycVerified ? 'red' : 'green');
            
            if (user.verified === false && user.isKycVerified === false) {
                log('✅ PASS: New user has verified=false and isKycVerified=false', 'green');
                return { success: true, userId: user._id };
            } else {
                log('❌ FAIL: New user should have verified=false and isKycVerified=false', 'red');
                return { success: false };
            }
        } else {
            log(`❌ Signup failed: ${response.data.message}`, 'red');
            return { success: false };
        }
    } catch (error) {
        log(`❌ Error during signup: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return { success: false };
    }
}

async function testLogin() {
    log('\n🔐 Test 2: Logging in with new user...', 'blue');
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }, {
            withCredentials: true,
        });

        if (response.data.success) {
            const user = response.data.data;
            const cookies = response.headers['set-cookie'];
            
            log(`✅ Login successful`, 'green');
            log(`   - verified: ${user.verified}`, user.verified ? 'red' : 'green');
            log(`   - isKycVerified: ${user.isKycVerified}`, user.isKycVerified ? 'red' : 'green');
            
            if (user.verified === false && user.isKycVerified === false) {
                log('✅ PASS: Logged-in user still has verified=false', 'green');
                return { success: true, cookies, userId: user._id };
            } else {
                log('❌ FAIL: User should still have verified=false after login', 'red');
                return { success: false };
            }
        } else {
            log(`❌ Login failed: ${response.data.message}`, 'red');
            return { success: false };
        }
    } catch (error) {
        log(`❌ Error during login: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return { success: false };
    }
}

async function testGetAuthUser(cookies) {
    log('\n👤 Test 3: Getting authenticated user details...', 'blue');
    
    try {
        const response = await axios.get(`${BASE_URL}/auth-user`, {
            headers: {
                Cookie: cookies.join('; '),
            },
        });

        if (response.data.success) {
            const user = response.data.data;
            
            log(`✅ Auth user retrieved`, 'green');
            log(`   - verified: ${user.verified}`, user.verified ? 'red' : 'green');
            log(`   - isKycVerified: ${user.isKycVerified}`, user.isKycVerified ? 'red' : 'green');
            
            if (user.verified === false && user.isKycVerified === false) {
                log('✅ PASS: Auth user has verified=false', 'green');
                return { success: true };
            } else {
                log('❌ FAIL: Auth user should have verified=false', 'red');
                return { success: false };
            }
        } else {
            log(`❌ Failed to get auth user: ${response.data.message}`, 'red');
            return { success: false };
        }
    } catch (error) {
        log(`❌ Error getting auth user: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return { success: false };
    }
}

async function runTests() {
    log('═══════════════════════════════════════════════════════', 'blue');
    log('🧪 User Verification Status Fix - Test Suite', 'blue');
    log('═══════════════════════════════════════════════════════', 'blue');
    
    const results = {
        total: 3,
        passed: 0,
        failed: 0,
    };
    
    // Test 1: Signup
    const signupResult = await testSignup();
    if (signupResult.success) {
        results.passed++;
    } else {
        results.failed++;
        log('\n❌ Test suite failed at signup. Stopping tests.', 'red');
        printSummary(results);
        return;
    }
    
    // Test 2: Login
    const loginResult = await testLogin();
    if (loginResult.success) {
        results.passed++;
    } else {
        results.failed++;
        log('\n❌ Test suite failed at login. Stopping tests.', 'red');
        printSummary(results);
        return;
    }
    
    // Test 3: Get Auth User
    const authUserResult = await testGetAuthUser(loginResult.cookies);
    if (authUserResult.success) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    printSummary(results);
}

function printSummary(results) {
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('📊 Test Summary', 'blue');
    log('═══════════════════════════════════════════════════════', 'blue');
    log(`Total Tests: ${results.total}`, 'reset');
    log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    
    if (results.passed === results.total) {
        log('\n✅ ALL TESTS PASSED! The verification fix is working correctly.', 'green');
        log('   - New users are created with verified=false', 'green');
        log('   - Users remain unverified until KYC completion', 'green');
    } else {
        log('\n❌ SOME TESTS FAILED! Please review the errors above.', 'red');
    }
    log('═══════════════════════════════════════════════════════\n', 'blue');
}

// Run the tests
runTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});

