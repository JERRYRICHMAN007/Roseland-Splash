# 🔐 Complete Authentication Setup Guide

## ✅ What's Been Implemented:

1. ✅ **Database setup** - `user_profiles` table for storing user information
2. ✅ **Supabase Auth integration** - Full authentication using Supabase Auth
3. ✅ **Forgot Password flow** - Email-based password reset
4. ✅ **Reset Password page** - Secure password reset with validation
5. ✅ **Updated AuthContext** - Now uses Supabase Auth instead of localStorage

---

## 📋 Setup Steps:

### Step 1: Run SQL Script in Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your "Rollsland & Splash" project

2. **Open SQL Editor:**
   - Click "SQL Editor" (left sidebar)
   - Click "New query"

3. **Run the auth setup script:**
   - Open `auth_setup.sql` file from your project
   - Copy ALL the SQL code
   - Paste into SQL Editor
   - Click "Run" button

4. **Verify tables created:**
   - Go to "Table Editor"
   - You should see: `user_profiles` table

---

### Step 2: Enable Email Auth in Supabase

1. **Go to Authentication Settings:**
   - Click "Authentication" (left sidebar)
   - Click "Providers"
   - Find "Email" provider

2. **Enable Email Auth:**
   - ✅ Enable "Email" provider
   - ✅ Enable "Confirm email" (optional, recommended for production)
   - ✅ Enable "Secure email change" (optional)

3. **Configure Email Templates (Optional):**
   - Click "Email Templates" (left sidebar)
   - Customize "Reset Password" template if desired
   - Default template works fine

4. **Set Redirect URLs:**
   - Click "URL Configuration" (in Authentication settings)
   - Add to "Redirect URLs":
     - `http://localhost:8080/reset-password`
     - `https://yourdomain.com/reset-password` (for production)

---

### Step 3: Test the System

1. **Sign Up:**
   - Go to `/signup`
   - Create a new account
   - User should be created in Supabase Auth and `user_profiles` table

2. **Login:**
   - Go to `/login`
   - Login with your credentials
   - Should work seamlessly

3. **Forgot Password:**
   - Go to `/login`
   - Click "Forgot password?"
   - Enter your email
   - Check your email for reset link

4. **Reset Password:**
   - Click the link in the email
   - Enter new password
   - Should redirect to login page

---

## 🔧 Features:

### ✅ User Authentication:
- Sign up with email/password
- Login with email/password
- Secure password hashing (handled by Supabase)
- Session management (automatic)

### ✅ User Profiles:
- First name, last name, phone stored in database
- Linked to Supabase Auth user
- Profile updates supported

### ✅ Password Reset:
- Forgot password page
- Email-based reset links
- Secure password reset page
- Session validation

### ✅ Security:
- Row Level Security (RLS) policies
- Users can only view/edit their own profiles
- Secure password reset tokens
- Automatic session handling

---

## 📁 Files Created/Updated:

### New Files:
- ✅ `auth_setup.sql` - Database schema for user profiles
- ✅ `src/services/authService.ts` - Authentication service functions
- ✅ `src/pages/ForgotPasswordPage.tsx` - Forgot password page
- ✅ `src/pages/ResetPasswordPage.tsx` - Reset password page

### Updated Files:
- ✅ `src/contexts/AuthContext.tsx` - Now uses Supabase Auth
- ✅ `src/lib/supabase.ts` - Added auth configuration
- ✅ `src/pages/LoginPage.tsx` - Added forgot password link
- ✅ `src/App.tsx` - Added routes for password reset pages

---

## 🚨 Important Notes:

1. **Email Configuration:**
   - Supabase sends emails automatically
   - Free tier has email limits
   - For production, configure custom SMTP

2. **Email Verification:**
   - Currently disabled by default
   - Can enable in Supabase Dashboard
   - Recommended for production

3. **Session Persistence:**
   - Sessions are automatically persisted
   - Users stay logged in across page refreshes
   - Logout clears session

4. **Database Migration:**
   - Existing localStorage users will need to sign up again
   - All new users will be in Supabase
   - Old localStorage data can be cleared

---

## 🎯 Next Steps:

1. **Run the SQL script** (`auth_setup.sql`)
2. **Enable Email Auth** in Supabase Dashboard
3. **Test signup/login** works
4. **Test forgot password** flow
5. **Customize email templates** (optional)

---

## ❓ Troubleshooting:

### "Database not configured" error:
- Check `.env` file has Supabase credentials
- Restart dev server

### Password reset email not received:
- Check spam folder
- Verify email in Supabase Dashboard
- Check Supabase email logs

### "Invalid reset link" error:
- Link may have expired (default: 1 hour)
- Request a new reset link
- Check URL has correct tokens

---

**Everything is ready! Follow the setup steps above to get started.** 🚀

