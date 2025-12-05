# Enable Email Authentication in Supabase

## Problem
You're seeing these errors:
- "Email logins are disabled"
- "Email signups are disabled"

This means email authentication is disabled in your Supabase project settings.

## Solution: Enable Email Authentication

### Step 1: Go to Supabase Dashboard
1. Visit: https://app.supabase.com
2. Select your project: **Rollsland & Splash**

### Step 2: Navigate to Authentication Settings
1. In the left sidebar, click **"Authentication"**
2. Click **"Providers"** (or go to **Settings** → **Auth** → **Providers**)

### Step 3: Enable Email Provider
1. Find **"Email"** in the list of providers
2. Click on **"Email"** to open its settings
3. **Toggle ON** the following:
   - ✅ **"Enable Email Provider"** (main toggle)
   - ✅ **"Enable Email Signup"** (allows new users to sign up)
   - ✅ **"Enable Email Login"** (allows users to log in)

### Step 4: Configure Email Settings (Optional)
You can also configure:
- **"Confirm email"** - Toggle OFF for development (no email confirmation needed)
- **"Secure email change"** - Keep enabled for security
- **"Double confirm email changes"** - Optional

### Step 5: Save Changes
1. Click **"Save"** at the bottom
2. Wait a few seconds for changes to propagate

### Step 6: Test
1. Try signing up again - should work now!
2. Try logging in - should work now!

## Quick Settings for Development

For development/testing, recommended settings:
- ✅ Enable Email Provider: **ON**
- ✅ Enable Email Signup: **ON**
- ✅ Enable Email Login: **ON**
- ❌ Confirm email: **OFF** (for faster testing)
- ✅ Secure email change: **ON**

## If You Still See Errors

1. **Wait 10-30 seconds** after saving - changes take time to propagate
2. **Refresh your browser** - clear cache if needed
3. **Restart your backend server** - to ensure it picks up any changes
4. **Check Supabase Dashboard** - verify settings are saved correctly

## Production Settings

For production, you should:
- ✅ Enable email confirmation
- ✅ Use proper email templates
- ✅ Set up SMTP (if not using Supabase's default)

---

**After enabling email auth, try signing up/logging in again!**

