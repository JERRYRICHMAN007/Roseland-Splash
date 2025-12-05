# Network Debugging Guide - Login Timeout

## Issue: Login Request Timing Out

If login requests are timing out after 20 seconds, this usually indicates a **network connectivity issue** or the request is being **blocked**.

## Step-by-Step Debugging

### 1. Open Browser DevTools

1. Press **F12** (or right-click → Inspect)
2. Go to the **Network** tab
3. **Clear** the network log (trash icon)
4. Try to log in again

### 2. Find the Supabase Request

Look for a request to:
```
https://lmxyeucnyevoqbxypgzb.supabase.co/auth/v1/token
```

### 3. Check Request Status

**Status: Pending (forever)**
- **Cause**: Network connectivity issue, firewall blocking, or VPN interference
- **Fix**: 
  - Disable VPN if using one
  - Check firewall settings
  - Try different network (mobile hotspot)
  - Check if Supabase is accessible: Open `https://lmxyeucnyevoqbxypgzb.supabase.co` in browser

**Status: Failed / Blocked**
- **Cause**: CORS error, browser extension blocking, or network issue
- **Fix**:
  - Disable browser extensions (especially ad blockers)
  - Try incognito mode
  - Check browser console for CORS errors
  - Check if request shows "CORS policy" error

**Status: 400 / 401**
- **Cause**: Wrong credentials or configuration
- **Fix**: Check email/password, verify Supabase configuration

**Status: 200 (Success)**
- **Cause**: Request succeeded but app isn't handling response
- **Fix**: Check browser console for JavaScript errors

### 4. Check Request Details

Click on the request and check:

**Headers Tab:**
- **Request URL**: Should be `https://lmxyeucnyevoqbxypgzb.supabase.co/auth/v1/token`
- **Request Method**: Should be `POST`
- **Status Code**: Should be `200` for success

**Payload Tab:**
- Should show email and password (password is hashed)

**Response Tab:**
- If successful, should show user data
- If error, should show error message

### 5. Common Issues & Fixes

#### Issue: Request is Pending Forever
**Possible Causes:**
1. VPN blocking Supabase
2. Firewall blocking outbound requests
3. Network connectivity issue
4. Supabase service down

**Fixes:**
- Disable VPN
- Check firewall settings
- Try mobile hotspot
- Check Supabase status: https://status.supabase.com

#### Issue: CORS Error
**Error Message:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:**
- This shouldn't happen with Supabase (they handle CORS)
- If it does, check Supabase project settings
- Make sure redirect URLs are configured correctly

#### Issue: Browser Extension Blocking
**Fix:**
- Disable all browser extensions
- Try incognito mode
- Check if extensions are blocking requests

#### Issue: Network Timeout
**Fix:**
- Check internet connection
- Try different network
- Check if other websites load
- Restart router/modem

### 6. Test Supabase Connectivity

Open these URLs in your browser to test connectivity:

1. **Supabase Project URL:**
   ```
   https://lmxyeucnyevoqbxypgzb.supabase.co
   ```
   Should load (may show login page or API docs)

2. **Supabase Health Check:**
   ```
   https://lmxyeucnyevoqbxypgzb.supabase.co/rest/v1/
   ```
   Should return JSON (may require auth, but should not timeout)

### 7. Check Browser Console

Look for these errors in the **Console** tab:

- **Network errors**: `Failed to fetch`, `Network request failed`
- **CORS errors**: `CORS policy`, `Access-Control-Allow-Origin`
- **Timeout errors**: `Request timed out`
- **Supabase errors**: `Invalid API key`, `Invalid credentials`

### 8. Quick Tests

**Test 1: Can you access Supabase?**
- Open: `https://lmxyeucnyevoqbxypgzb.supabase.co`
- If it loads, Supabase is accessible
- If it times out, network issue

**Test 2: Try incognito mode**
- Open app in incognito/private window
- Try logging in
- If it works, browser extension is blocking

**Test 3: Try different network**
- Connect to mobile hotspot
- Try logging in
- If it works, your network is blocking

**Test 4: Check Supabase status**
- Visit: https://status.supabase.com
- Check if there are any outages

## Still Having Issues?

If none of the above work:

1. **Share Network Tab Screenshot**: 
   - Show the request to `/auth/v1/token`
   - Show the status, headers, and response

2. **Share Browser Console Errors**:
   - Copy all errors from Console tab

3. **Check Environment Variables**:
   - Verify `VITE_SUPABASE_URL` is correct
   - Verify `VITE_SUPABASE_ANON_KEY` is correct

4. **Check Supabase Dashboard**:
   - Verify project is active (not paused)
   - Verify API keys are correct
   - Verify redirect URLs are configured

