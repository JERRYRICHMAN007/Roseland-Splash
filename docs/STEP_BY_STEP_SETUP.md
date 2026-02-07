# 📋 STEP-BY-STEP Setup Guide

## 🚨 Current Issues:

1. ❌ `user_profiles` table doesn't exist (404 error)
2. ❌ Email Auth not enabled in Supabase
3. ❌ Redirect URL not configured

---

## ✅ STEP 1: Create User Profiles Table

### A. Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Click on your project: **"Rollsland & Splash"**

### B. Run SQL Script

1. Click **"SQL Editor"** (left sidebar)
2. Click **"New query"** button (top right)
3. Open file: **`auth_setup.sql`** from your project folder
4. **Select ALL** the code (Ctrl+A)
5. **Copy** it (Ctrl+C)
6. **Paste** into SQL Editor (Ctrl+V)
7. Click **"Run"** button (green button, or press Ctrl+Enter)

### C. Verify Table Created

1. Click **"Table Editor"** (left sidebar)
2. You should see: **`user_profiles`** table
3. If you don't see it, check the SQL Editor for errors

---

## ✅ STEP 2: Enable Email Authentication

### A. Enable Email Provider

1. Click **"Authentication"** (left sidebar)
2. Click **"Providers"** tab
3. Find **"Email"** provider
4. **Toggle it ON** ✅
5. **Optional settings:**
   - ✅ Enable "Confirm email" (recommended)
   - ✅ Enable "Secure email change"
6. Click **"Save"** button

### B. Configure Redirect URL

1. Still in **"Authentication"** settings
2. Click **"URL Configuration"** tab
3. In **"Redirect URLs"** section:
   - Add: `http://localhost:8080/reset-password`
   - Click **"Add URL"** or just press Enter
   - Click **"Save"**

### C. (Optional) Configure Email Templates

1. Click **"Email Templates"** tab
2. Find **"Reset Password"** template
3. You can customize it, or leave default
4. Click **"Save"**

---

## ✅ STEP 3: Test Authentication

### A. Test Signup

1. Go to your app: `http://localhost:8080/signup`
2. Fill in the form:
   - First Name
   - Last Name
   - Email
   - Phone
   - Password (at least 6 characters)
3. Click **"Create Account"**
4. **Should work!** ✅

### B. Test Login

1. Go to: `http://localhost:8080/login`
2. Enter email and password
3. Click **"Log In"**
4. **Should work!** ✅

### C. Test Forgot Password

1. Go to: `http://localhost:8080/login`
2. Click **"Forgot password?"**
3. Enter your email
4. Click **"Send Reset Link"**
5. **Check your email** (inbox AND spam folder)
6. **Click the link** in the email
7. **Reset your password**
8. **Should work!** ✅

---

## 🔍 Troubleshooting

### If Signup Fails:

- ✅ Check if `user_profiles` table exists
- ✅ Check browser console for errors
- ✅ Verify Email Auth is enabled

### If Login Fails:

- ✅ Check if user exists in Supabase Dashboard → Authentication → Users
- ✅ Try creating a new account
- ✅ Check browser console for specific errors

### If Password Reset Email Not Received:

1. **Check spam folder**
2. **Wait 2-3 minutes** (emails can take time)
3. **Check Supabase Dashboard:**
   - Go to **"Logs"** → **"Auth Logs"**
   - See if password reset was triggered
4. **Verify email address** is correct
5. **Try again** after a few minutes

---

## 📝 Checklist:

- [ ] **Step 1A:** Open Supabase Dashboard
- [ ] **Step 1B:** Run `auth_setup.sql` in SQL Editor
- [ ] **Step 1C:** Verify `user_profiles` table exists
- [ ] **Step 2A:** Enable Email provider
- [ ] **Step 2B:** Add redirect URL
- [ ] **Step 3A:** Test signup
- [ ] **Step 3B:** Test login
- [ ] **Step 3C:** Test forgot password

---

## 🎯 After Setup:

Once you complete all steps:
- ✅ Users can sign up
- ✅ Users can log in
- ✅ Users can reset passwords
- ✅ User profiles stored in database
- ✅ Secure authentication

---

**Follow these steps in order, and everything will work!** 🚀

