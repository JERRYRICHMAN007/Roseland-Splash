# Supabase URL Configuration - Step by Step

## What You Need to Do Right Now

### Step 1: Go to URL Configuration in Supabase

1. **In Supabase Dashboard**, look at the left sidebar
2. **Under "CONFIGURATION"**, click **"URL Configuration"**
3. You should see two fields:
   - **Site URL**
   - **Redirect URLs**

### Step 2: Configure Site URL

**Set Site URL to your PRODUCTION URL:**
```
https://rollsland-splash.vercel.app
```
*(Replace with your actual Vercel URL if different)*

**Why?** This is the default URL Supabase uses for redirects.

### Step 3: Configure Redirect URLs

**In the "Redirect URLs" field, add ALL of these (one per line):**

```
http://localhost:8080
http://localhost:8080/reset-password
http://localhost:8080/**
https://rollsland-splash.vercel.app
https://rollsland-splash.vercel.app/reset-password
https://rollsland-splash.vercel.app/**
```

**Important:**
- Replace `rollsland-splash.vercel.app` with your **actual Vercel URL**
- Each URL should be on a **separate line**
- The `/**` pattern allows all routes under that domain

### Step 4: Save Changes

1. **Click "Save"** or "Update" button
2. **Wait for confirmation** that changes are saved

### Step 5: Disable Email Confirmation (For Testing)

1. **Go to**: Authentication → **Sign In / Providers**
2. **Find**: "Confirm email" toggle (should be visible in the "User Signups" section)
3. **Turn it OFF** (toggle should be gray/unchecked)
4. **Click "Save changes"** at the bottom

**Why disable?** This allows users to log in immediately without confirming email. You can enable it later for production.

### Step 6: Test

1. **Try logging in** on localhost: `http://localhost:8080/login`
2. **Try logging in** on production: `https://your-vercel-url.vercel.app/login`
3. **Check browser console** (F12) for any errors

## What Each URL Does

- `http://localhost:8080` - Main localhost URL
- `http://localhost:8080/reset-password` - Password reset page (localhost)
- `http://localhost:8080/**` - All routes on localhost
- `https://your-app.vercel.app` - Main production URL
- `https://your-app.vercel.app/reset-password` - Password reset page (production)
- `https://your-app.vercel.app/**` - All routes on production

## If You Don't Know Your Vercel URL

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Copy the URL shown (usually `your-project.vercel.app`)

## Troubleshooting

### "Invalid redirect URL" Error
- Make sure your production URL is in the Redirect URLs list
- Check for typos (https vs http, trailing slashes)
- Make sure you clicked "Save"

### "Email link expired" Error
- Request a NEW password reset (old links expire)
- Click the link within 1 hour
- Make sure the redirect URL in the email matches your configuration

### Still Can't Login
1. Check browser console (F12) for errors
2. Verify environment variables are set in Vercel
3. Make sure you redeployed after adding env vars
4. Check Supabase project is active (not paused)

## Next Steps After Configuration

1. ✅ Test login on localhost
2. ✅ Test login on production
3. ✅ Test password reset on both
4. ✅ Once working, you can enable "Confirm email" for production security

