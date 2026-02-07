# Authentication Troubleshooting Guide

## Current Issue: Login/Signup/Password Reset Timing Out

If you're experiencing timeouts when trying to log in, sign up, or reset your password, follow these steps:

## Step 1: Check Environment Variables

1. **Verify `.env` file exists** in the root directory
2. **Check the file contains:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Restart your dev server** after making changes:
   ```bash
   npm run dev
   ```

## Step 2: Verify Supabase Configuration

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Verify:**
   - Project URL matches `VITE_SUPABASE_URL` in your `.env`
   - `anon` `public` key matches `VITE_SUPABASE_ANON_KEY` in your `.env`

## Step 3: Check Email Provider Settings

1. **In Supabase Dashboard**, go to **Authentication → Providers**
2. **Ensure Email provider is enabled**
3. **Check Email Templates** are configured
4. **Verify Redirect URLs**:
   - Add `http://localhost:8080` to allowed redirect URLs
   - Add `http://localhost:8080/reset-password` for password reset
   - Add your production URL if applicable

## Step 4: Check Network Connectivity

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Try to log in**
4. **Look for requests to:**
   - `https://your-project.supabase.co/auth/v1/token?grant_type=password`
5. **Check the status:**
   - **Pending/Failed**: Network connectivity issue
   - **CORS Error**: CORS configuration issue
   - **404**: Wrong Supabase URL
   - **401**: Wrong API key or credentials

## Step 5: Test Supabase Connection

1. **Open Browser Console** (F12)
2. **Run this command:**
   ```javascript
   // Test if Supabase is reachable
   fetch('https://your-project.supabase.co/auth/v1/health')
     .then(r => console.log('✅ Supabase reachable:', r.status))
     .catch(e => console.error('❌ Cannot reach Supabase:', e));
   ```
3. **Replace `your-project` with your actual Supabase project reference**

## Step 6: Check Browser Console for Errors

Look for these specific errors:

- **"Failed to fetch"**: Network issue or CORS problem
- **"CORS policy"**: CORS configuration needed in Supabase
- **"Invalid API key"**: Wrong `VITE_SUPABASE_ANON_KEY`
- **"Invalid login credentials"**: Wrong email/password
- **Timeout errors**: Network connectivity issue

## Step 7: Verify User Exists

1. **In Supabase Dashboard**, go to **Authentication → Users**
2. **Check if your user account exists**
3. **If it exists, check:**
   - Email is confirmed (if email confirmation is enabled)
   - User is not disabled
   - Password is set correctly

## Step 8: Check Supabase Project Status

1. **In Supabase Dashboard**, check if your project is:
   - **Active** (not paused)
   - **Not over quota**
   - **Not experiencing downtime**

## Step 9: Test with a Simple Request

Open browser console and run:

```javascript
// Get Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// Test basic connection
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    'apikey': supabaseKey,
  }
})
.then(r => console.log('✅ Connection OK:', r.status))
.catch(e => console.error('❌ Connection failed:', e));
```

## Step 10: Common Fixes

### Fix 1: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 2: Clear Browser Cache
- Clear browser cache and cookies
- Try in incognito/private mode

### Fix 3: Check Firewall/Proxy
- Disable VPN if using one
- Check if corporate firewall is blocking requests
- Try from a different network

### Fix 4: Verify Email Confirmation Settings
1. **In Supabase Dashboard** → **Authentication → Settings**
2. **Check "Enable email confirmations"**
3. **If enabled**: Users must confirm email before login
4. **If disabled**: Users can login immediately after signup

### Fix 5: Check RLS Policies
1. **In Supabase Dashboard** → **Authentication → Policies**
2. **Ensure `user_profiles` table has proper RLS policies**
3. **Run the `fix_rls_user_profiles.sql` script if needed**

## Step 11: Enable Debug Logging

The code now includes detailed logging. Check the browser console for:
- `🔐 Starting login process...`
- `🔐 Calling Supabase signInWithPassword...`
- `🔐 signInWithPassword response:`
- Any error messages with `❌`

## Still Not Working?

If none of the above works:

1. **Check Supabase Status Page**: https://status.supabase.com
2. **Check your Supabase project logs**: Dashboard → Logs
3. **Try creating a new test user** in Supabase Dashboard
4. **Contact Supabase Support** if project-specific issues

## Quick Diagnostic Checklist

- [ ] `.env` file exists with correct values
- [ ] Dev server restarted after `.env` changes
- [ ] Supabase URL and key are correct
- [ ] Email provider is enabled in Supabase
- [ ] Redirect URLs are configured
- [ ] Network requests appear in Network tab
- [ ] No CORS errors in console
- [ ] User exists in Supabase Dashboard
- [ ] Email is confirmed (if required)
- [ ] Project is active and not paused

