# Quick Test Guide - Verification Status Fix

## 🚀 Quick Start - Test the Fix in 3 Steps

### Step 1: Clear App Cache ⚠️ CRITICAL

**Why?** The app caches user data locally. Old cached data will show the old "verified: true"
status.

**Android:**

```
Settings → Apps → Sevazon → Storage → Clear Data
```

**iOS:**

```
Uninstall and reinstall the app
```

**Development (Hot Restart):**

```bash
# In your IDE, click "Hot Restart" button
# OR run:
flutter run --hot
```

---

### Step 2: Create a Brand New Account

**Option A: Use the Flutter App**

1. Open the app
2. Sign up with a **NEW email address** (never used before)
3. Complete registration

**Option B: Use API (for testing)**

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "newuser'$(date +%s)'@example.com",
    "password": "test123456",
    "confirmPassword": "test123456"
  }' | jq .
```

---

### Step 3: Verify the Fix

**✅ Expected Behavior:**

1. **New Account (Before KYC)**
   - ❌ NO "Verified" badge should appear
   - ✅ "Complete Verification" button should be visible
   - ✅ API response shows `"verified": false`

2. **After KYC Verification**
   - ✅ "Verified" badge appears
   - ✅ API response shows `"verified": true`

---

## 🧪 Automated Test

Run the automated test script:

```bash
cd sevazon_backend/backend
node tests/verification-fix-test.js
```

**Expected Output:**

```
✅ PASS: New user has verified=false and isKycVerified=false
✅ PASS: Logged-in user still has verified=false
✅ ALL TESTS PASSED!
```

---

## 🐛 Troubleshooting

### Issue: Still seeing "Verified" badge on new accounts

**Solution 1: Clear App Cache**

- You MUST clear app data/cache (see Step 1)
- Cached user data is stored in SharedPreferences

**Solution 2: Use a Completely New Email**

- Don't reuse an email from an old account
- Old accounts may have cached data

**Solution 3: Check Backend Server**

- Ensure backend server was restarted after model changes
- Run: `lsof -i :3000` to check if server is running
- If needed, restart: `cd sevazon_backend/backend && npm start`

### Issue: Backend API still returns verified: true

**Solution: Restart Backend Server**

```bash
# Find the process
lsof -i :3000

# Kill it
kill <PID>

# Restart
cd sevazon_backend/backend
npm start
```

---

## 📊 What Was Fixed

### Backend Fix ✅

- **File**: `sevazon_backend/backend/model/userModel.js`
- **Change**: `verified` default changed from `true` to `false`

### Frontend Fix ✅

- **File**: `sevazon/lib/screens/account/screens/account_screen.dart`
- **Change**: `showVerifiedBadge` changed from hardcoded `true` to `controller.isKycVerified.value`

---

## ✅ Success Criteria

Your fix is working correctly if:

1. ✅ New users created via API show `"verified": false`
2. ✅ New users in the app do NOT show "Verified" badge
3. ✅ "Complete Verification" button is visible for unverified users
4. ✅ After KYC verification, "Verified" badge appears
5. ✅ Automated tests pass

---

## 📝 Notes

- **Existing users** in the database will keep their current verification status
- **Only new users** created after the fix will start with `verified: false`
- **Cache clearing is mandatory** for testing in the app
- **Backend server restart** was required for model changes to take effect

---

## 🆘 Need Help?

If you're still experiencing issues:

1. Check that backend server is running: `lsof -i :3000`
2. Verify app cache was cleared
3. Try creating a user via API first to isolate frontend vs backend issues
4. Check the full documentation: `VERIFICATION_FIX_SUMMARY.md`
