# Backend Restart Instructions

## ⚠️ CRITICAL: Restart Required

After updating the `.env` file, you **MUST** restart the backend server for changes to take effect.

## Steps to Restart:

### 1. Stop Current Backend
- Find the terminal window running the backend
- Press `Ctrl+C` to stop it
- Wait until it's fully stopped

### 2. Restart Backend
```bash
cd server
npm run dev
```

### 3. Verify It Started Correctly
You should see:
```
✅ Backend server initialized
🔍 Supabase URL: https://lmxyeucnyevoqbxypgzb.s...
🔍 Supabase Anon Key present: Yes
🔍 Supabase Anon Key length: 208
🚀 Backend server running on http://localhost:3002
```

### 4. Try Logging In
- Go to your frontend
- Try logging in
- **Check the backend terminal** for error messages

## What to Look For in Backend Terminal:

When you try to log in, you should see:

**If connection works:**
```
🔐 Login attempt for: jerryrichman70@gmail.com
❌ Login error: Invalid login credentials
```
(This means Supabase is reachable, but credentials are wrong)

**If connection fails:**
```
🔐 Login attempt for: jerryrichman70@gmail.com
❌ Login error: fetch failed
❌ This appears to be a network/connection error with Supabase
❌ Check:
   1. Supabase URL is correct: https://lmxyeucnyevoqbxypgzb.supabase.co
   2. Anon key is set: true
   3. Backend can reach Supabase API
```

## Common Issues:

### Issue: "Cannot connect to Supabase"
**Possible causes:**
1. Backend not restarted after .env change
2. Supabase project is paused
3. Network/firewall blocking connection
4. Wrong Supabase URL or keys

**Solution:**
1. Restart backend (see steps above)
2. Check Supabase dashboard - is project active?
3. Verify URL and keys in `server/.env`

### Issue: "Invalid login credentials"
**This is actually GOOD!** It means:
- ✅ Backend is connected to Supabase
- ✅ The issue is with email/password or email confirmation

**Solution:**
- Check if email confirmation is required
- Verify password is correct
- Disable email confirmation in Supabase Dashboard if needed

## Still Having Issues?

1. **Share backend terminal output** - Copy the error messages
2. **Check Supabase Dashboard** - Is project active?
3. **Verify .env file** - All values correct?

---

**Remember: Always restart the backend after changing `.env`!**

