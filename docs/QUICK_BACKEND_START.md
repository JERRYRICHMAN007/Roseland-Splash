# Quick Backend Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Create Backend `.env` File

Create `server/.env` with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Where to find these:**
- Go to Supabase Dashboard → Your Project → Settings → API
- Copy Project URL → `SUPABASE_URL`
- Copy `anon public` key → `SUPABASE_ANON_KEY`
- Copy `service_role` key (⚠️ SECRET) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Backend server initialized
🚀 Backend server running on http://localhost:3001
```

### 4. Update Frontend `.env`

Add to your root `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Restart Frontend

```bash
# In project root
npm run dev
```

### 6. Test Login

Try logging in - it should work now! 🎉

---

## ✅ Verify It's Working

1. **Backend Health Check:**
   - Visit: http://localhost:3001/health
   - Should show: `{"status":"ok","message":"Backend server is running"}`

2. **Check Browser Console:**
   - When logging in, you should see: `📡 API Request: POST http://localhost:3001/api/auth/login`

3. **Check Backend Terminal:**
   - You should see: `✅ Login successful for: your-email@example.com`

---

## 🐛 Common Issues

**"Cannot find module" errors:**
- Make sure you ran `npm install` in the `server` directory

**"Missing Supabase environment variables":**
- Check that `server/.env` exists and has all variables
- Make sure there are no typos in variable names

**"Network error" in frontend:**
- Make sure backend is running (check terminal)
- Verify `VITE_API_URL=http://localhost:3001` in root `.env`
- Restart frontend dev server

**"CORS error":**
- Make sure `FRONTEND_URL=http://localhost:8080` in `server/.env`
- Restart backend server

---

## 📚 Full Guide

For detailed setup and production deployment, see: `BACKEND_SETUP_GUIDE.md`


