# Fix Login "fetch failed" Error

## Problem
The backend is returning `{"success":false,"error":"fetch failed"}` when trying to log in.

## Root Cause
The Supabase client in the backend cannot connect to Supabase API. This is usually caused by:
1. **Wrong Supabase URL or keys**
2. **Network connectivity issue**
3. **Backend not restarted** (still using old code)

## Solution Steps

### Step 1: Restart Backend Server
**IMPORTANT:** The backend must be restarted for the new error handling to work!

```bash
# Stop the current backend (Ctrl+C in the terminal running it)
# Then restart:
cd server
npm run dev
```

You should see:
```
✅ Backend server initialized
🔍 Supabase URL: https://lmxyeucnyevoqbxypgzb.s...
🔍 Supabase Anon Key present: Yes
🔍 Supabase Anon Key length: [number]
```

### Step 2: Check Backend Terminal When Logging In
When you try to log in, check your **backend terminal**. You should now see detailed error messages:

```
🔐 Login attempt for: jerryrichman70@gmail.com
❌ Login error: [actual error message]
❌ Error code: [code]
❌ Full error object: [detailed error]
```

### Step 3: Verify Supabase Configuration

Check your `server/.env` file:

```env
SUPABASE_URL=https://lmxyeucnyevoxqbyxpzb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XtYnIM99875PCVYPiGHGOA_rAdoCPji
```

**Important:** Make sure:
- No extra spaces or quotes around the values
- The URL is correct (should end with `.supabase.co`)
- The anon key is the full JWT token

### Step 4: Test Supabase Connection

The backend will now log more details. If you see "Cannot connect to Supabase", try:

1. **Verify Supabase URL:**
   - Go to: https://app.supabase.com
   - Your project → Settings → API
   - Copy the **Project URL** exactly
   - Make sure it matches your `.env` file

2. **Verify Anon Key:**
   - In Supabase Dashboard → Settings → API
   - Copy the **anon public** key
   - Make sure it matches your `.env` file

3. **Check Network:**
   - The backend needs internet access to reach Supabase
   - Try accessing: https://lmxyeucnyevoxqbyxpzb.supabase.co in your browser
   - Should show Supabase API info

### Step 5: Common Issues

#### Issue: "Invalid login credentials"
**Solution:** 
- Wrong password - try resetting it
- Email not confirmed - check your email for confirmation link
- Or disable email confirmation in Supabase Dashboard

#### Issue: "Email not confirmed"
**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Turn it **OFF** (for development)
4. Save and try again

#### Issue: "Cannot connect to Supabase"
**Solution:**
- Check your internet connection
- Verify Supabase URL and keys are correct
- Make sure Supabase project is active (not paused)

### Step 6: Check Backend Logs

After restarting and trying to log in, the backend terminal should show:

**If connection works:**
```
🔐 Login attempt for: jerryrichman70@gmail.com
❌ Login error: Invalid login credentials
```

**If connection fails:**
```
🔐 Login attempt for: jerryrichman70@gmail.com
❌ Login error: fetch failed
❌ This appears to be a network/connection error with Supabase
```

## Quick Test

1. **Restart backend:** `cd server && npm run dev`
2. **Try logging in** from frontend
3. **Check backend terminal** for detailed error messages
4. **Share the backend terminal output** so we can see the actual error

## Next Steps

Once you restart the backend and try logging in, check the backend terminal and share:
- What error message appears
- The full error object (if shown)

This will help identify the exact problem!

