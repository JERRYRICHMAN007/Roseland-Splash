# Supabase Production Configuration Guide

## Overview
This guide will help you configure Supabase for both **localhost (development)** and **production (Vercel)** environments.

## Step 1: Get Your Production URL

First, find your Vercel production URL:
1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: "Roseland-Splash"
3. Go to **Settings** → **Domains**
4. Copy your production URL (e.g., `https://rollsland-splash.vercel.app` or your custom domain)

## Step 2: Configure Supabase URL Configuration

### In Supabase Dashboard:

1. **Go to**: Authentication → Configuration → **URL Configuration**

2. **Site URL**: Set this to your **production URL**:
   ```
   https://rollsland-splash.vercel.app
   ```
   (Replace with your actual Vercel URL)

3. **Redirect URLs**: Add **ALL** of these (one per line):
   ```
   http://localhost:8080
   http://localhost:8080/reset-password
   http://localhost:8080/**
   https://rollsland-splash.vercel.app
   https://rollsland-splash.vercel.app/reset-password
   https://rollsland-splash.vercel.app/**
   ```
   (Replace `rollsland-splash.vercel.app` with your actual Vercel URL)

4. **Click "Save"**

## Step 3: Configure Email Settings

### A. Disable Email Confirmation (For Testing)

1. **Go to**: Authentication → **Sign In / Providers**
2. **Find**: "Confirm email" toggle
3. **Turn it OFF** (for testing - you can enable later for production)
4. **Click "Save changes"**

### B. Configure Email Templates

1. **Go to**: Authentication → **Emails** → **Templates**
2. **Check these templates exist**:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 4: Configure Vercel Environment Variables

### In Vercel Dashboard:

1. **Go to**: Your Project → **Settings** → **Environment Variables**

2. **Add these variables** (same as your `.env` file):
   ```
   VITE_SUPABASE_URL=https://lmxyeucnyevoqbxypgzb.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: 
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save** for each

4. **Redeploy** your application after adding environment variables

## Step 5: Verify Configuration

### Test Localhost:
1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:8080/login`
3. Try to log in or sign up
4. Check browser console (F12) for any errors

### Test Production:
1. Go to your Vercel URL: `https://your-app.vercel.app/login`
2. Try to log in or sign up
3. Check browser console (F12) for any errors

## Step 6: Fix Expired Token Issues

If you're getting "expired token" errors:

1. **Request a NEW password reset** (old links expire after 1 hour)
2. **Check email immediately** and click the link within a few minutes
3. **Make sure the redirect URL matches** what's configured in Supabase

## Common Issues & Fixes

### Issue 1: "Invalid redirect URL"
**Fix**: Make sure your production URL is in the Redirect URLs list in Supabase

### Issue 2: "Email link expired"
**Fix**: 
- Request a new password reset
- Check email immediately
- Click the link within 1 hour

### Issue 3: "Cannot connect to Supabase"
**Fix**:
- Check if environment variables are set in Vercel
- Redeploy after adding environment variables
- Check Supabase project status

### Issue 4: Login times out
**Fix**:
- Check internet connection
- Disable VPN if using one
- Check browser console for specific errors
- Verify Supabase URL and key are correct

## Quick Checklist

- [ ] Production URL added to Supabase Redirect URLs
- [ ] Localhost URLs added to Supabase Redirect URLs
- [ ] Site URL set to production URL in Supabase
- [ ] Environment variables added to Vercel
- [ ] Vercel deployment redeployed after adding env vars
- [ ] Email confirmation disabled (for testing)
- [ ] Tested login on localhost
- [ ] Tested login on production

## Production Recommendations

Once everything is working:

1. **Enable Email Confirmation** (for security)
2. **Set up Custom SMTP** (for better email delivery)
3. **Enable Rate Limiting** (to prevent abuse)
4. **Set up Attack Protection** (for security)

## Need Help?

If you're still having issues:
1. Check browser console (F12) for errors
2. Check Vercel deployment logs
3. Check Supabase project logs
4. Verify all URLs match exactly (no trailing slashes, correct protocol)

