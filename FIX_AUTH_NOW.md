# Fix Authentication Issues - Action Plan

## Current Issues
1. ❌ Login times out
2. ❌ Password reset links expire
3. ❌ Not configured for production (Vercel)

## What I've Fixed in the Code

✅ Added dynamic URL detection (works for both localhost and production)
✅ Improved error handling for expired tokens
✅ Added better timeout handling
✅ Updated password reset to use correct redirect URLs

## What YOU Need to Do Now

### ACTION 1: Configure Supabase URLs (CRITICAL)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: "Rollsland & Splash"
3. **Click**: Authentication → **Configuration** → **URL Configuration**

4. **Set Site URL** to your production URL:
   ```
   https://rollsland-splash.vercel.app
   ```
   *(Replace with your actual Vercel URL)*

5. **Add ALL these Redirect URLs** (one per line):
   ```
   http://localhost:8080
   http://localhost:8080/reset-password
   http://localhost:8080/**
   https://rollsland-splash.vercel.app
   https://rollsland-splash.vercel.app/reset-password
   https://rollsland-splash.vercel.app/**
   ```
   *(Replace `rollsland-splash.vercel.app` with your actual Vercel URL)*

6. **Click "Save"**

### ACTION 2: Disable Email Confirmation (For Testing)

1. **Go to**: Authentication → **Sign In / Providers**
2. **Find**: "Confirm email" toggle (in "User Signups" section)
3. **Turn it OFF** (should be gray/unchecked)
4. **Click "Save changes"**

### ACTION 3: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to**: Settings → **Environment Variables**
4. **Add these two variables**:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://lmxyeucnyevoqbxypgzb.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (get from your `.env` file)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

5. **Redeploy**: Go to Deployments → Click ⋯ on latest → "Redeploy"

### ACTION 4: Test

1. **Test localhost**:
   - Go to: `http://localhost:8080/login`
   - Try logging in
   - Check console (F12) for errors

2. **Test production**:
   - Go to: `https://your-vercel-url.vercel.app/login`
   - Try logging in
   - Check console (F12) for errors

## If Login Still Times Out

### Check Network Tab:
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Try to log in
4. Look for request to: `https://lmxyeucnyevoqbxypgzb.supabase.co/auth/v1/token`
5. Check the status:
   - **Pending** = Network issue
   - **Failed** = Connection problem
   - **200** = Success (but might be other issue)
   - **400/401** = Wrong credentials or config

### Common Fixes:
- **Disable VPN** if using one
- **Check firewall** settings
- **Try different network** (mobile hotspot)
- **Clear browser cache** and cookies
- **Try incognito mode**

## If Password Reset Still Expires

1. **Request a NEW password reset** (old links expire after 1 hour)
2. **Check email immediately**
3. **Click the link within 5 minutes**
4. **Make sure** the redirect URL in Supabase matches your actual URL

## Quick Checklist

- [ ] Supabase Site URL set to production URL
- [ ] All redirect URLs added (localhost + production)
- [ ] Email confirmation disabled (for testing)
- [ ] Environment variables added to Vercel
- [ ] Vercel deployment redeployed
- [ ] Tested login on localhost
- [ ] Tested login on production

## Still Having Issues?

Share:
1. **Browser console errors** (F12 → Console tab)
2. **Network tab** - status of the auth request
3. **Exact error message** you see
4. **Which environment** (localhost or production)

