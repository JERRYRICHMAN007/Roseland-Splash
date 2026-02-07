# Login Troubleshooting Guide

## Common Issues and Solutions

### 1. "Invalid email or password" Error

**Possible Causes:**

#### A. Email Confirmation Required
Supabase may require email confirmation before login. 

**Solution:**
1. Check your email inbox (and spam folder) for a confirmation email from Supabase
2. Click the confirmation link in the email
3. Try logging in again

**To Disable Email Confirmation (Development Only):**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle it OFF (for development/testing only)
4. **Important:** Re-enable this in production!

#### B. Wrong Password
- Make sure you're using the exact password you used during signup
- Check for typos or extra spaces
- Try resetting your password if needed

#### C. User Not Created Properly
- Check the backend terminal logs when you signed up
- Look for any error messages
- Verify the user exists in Supabase Dashboard → Authentication → Users

### 2. Check Backend Logs

When you try to log in, check your backend terminal. You should see:
```
🔐 Login attempt for: your-email@example.com
```

If you see an error, it will show:
```
❌ Login error: [error message]
```

### 3. Check Browser Console

Open browser DevTools (F12) → Console tab. Look for:
- `📡 API Request: POST http://localhost:3002/api/auth/login`
- Any error messages in red

### 4. Verify Backend is Running

Make sure your backend server is running:
```bash
cd server
npm run dev
```

You should see:
```
✅ Backend server initialized
🚀 Backend server running on http://localhost:3002
```

### 5. Test Backend Health

Visit: http://localhost:3002/health

Should return: `{"status":"ok","message":"Backend server is running"}`

### 6. Quick Fix: Disable Email Confirmation

**For Development/Testing Only:**

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Authentication** → **Settings** → **Auth Providers** → **Email**
4. Find **"Confirm email"** toggle
5. Turn it **OFF**
6. Save changes
7. Try signing up and logging in again

**⚠️ Remember to re-enable this before going to production!**

### 7. Manual User Verification

Check if your user was created:
1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Look for your email address
4. Check if email is "Confirmed" (green checkmark)

If not confirmed:
- Click on the user
- Click "Confirm email" button (if available)
- Or resend confirmation email

---

## Still Having Issues?

1. **Check backend terminal** for detailed error messages
2. **Check browser console** for API errors
3. **Verify** your `.env` files are correct:
   - `server/.env` has correct Supabase keys
   - Root `.env` has `VITE_API_URL=http://localhost:3002`
4. **Restart both servers:**
   - Backend: `cd server && npm run dev`
   - Frontend: `npm run dev`

