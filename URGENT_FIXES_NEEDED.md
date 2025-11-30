# 🚨 URGENT: Fix These 3 Issues

## ✅ Issue 1: Database Query Error (FIXED)

**Error:** `supabase.from(...).in is not a function`

**Status:** ✅ **FIXED!** I've corrected the query syntax

**Action:** Just **refresh your browser** (F5 or Ctrl+R)

---

## ❌ Issue 2: Missing `user_profiles` Table

**Error:** `Could not find the table 'public.user_profiles'`

**Problem:** You haven't run the SQL script yet

**Solution:**

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select "Rollsland & Splash" project

2. **Open SQL Editor:**
   - Click "SQL Editor" (left sidebar)
   - Click "New query"

3. **Copy SQL Script:**
   - Open file: `auth_setup.sql` from your project
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste and Run:**
   - Paste into SQL Editor (Ctrl+V)
   - Click "Run" button (or Ctrl+Enter)

5. **Verify:**
   - Go to "Table Editor"
   - Should see `user_profiles` table

**After this, signup will work!**

---

## ❌ Issue 3: Password Reset Email Not Received

**Problem:** Email Auth is not enabled or not configured

**Solution - Part A: Enable Email Auth**

1. **In Supabase Dashboard:**
   - Click "Authentication" (left sidebar)
   - Click "Providers"

2. **Enable Email:**
   - Find "Email" provider
   - **Toggle it ON** ✅
   - Click "Save"

**Solution - Part B: Configure Redirect URL**

1. **Still in Authentication settings:**
   - Click "URL Configuration"

2. **Add Redirect URL:**
   - In "Redirect URLs" box, add:
     ```
     http://localhost:8080/reset-password
     ```
   - Click "Save"

**Solution - Part C: Check Email**

1. **Check spam folder** - Emails often go to spam
2. **Wait 2-3 minutes** - Emails can take time
3. **Check Auth Logs:**
   - Go to "Logs" → "Auth Logs"
   - See if password reset was triggered

---

## 🎯 Quick Action Checklist:

- [ ] **Refresh browser** (to get query fix)
- [ ] **Run SQL script** (`auth_setup.sql`) in Supabase SQL Editor
- [ ] **Enable Email Auth** in Authentication → Providers
- [ ] **Add redirect URL** `http://localhost:8080/reset-password`
- [ ] **Test signup** - Create a new account
- [ ] **Test forgot password** - Request reset link
- [ ] **Check email** (inbox AND spam folder)

---

## 📝 Summary:

1. ✅ **Query error:** FIXED (just refresh browser)
2. ❌ **Missing table:** Run `auth_setup.sql` in Supabase
3. ❌ **No email:** Enable Email Auth + add redirect URL

**Do these 2 things and everything will work!** 🚀

