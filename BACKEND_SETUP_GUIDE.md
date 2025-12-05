# Backend Setup Guide for Roseland Splash

This guide will help you set up the backend server and connect it to Supabase properly.

## 🎯 Why a Backend?

The backend server solves login timeout issues by:
- Handling authentication requests server-side (more reliable)
- Using Supabase service role key (bypasses RLS issues)
- Providing better error handling and logging
- Avoiding browser-specific timeout issues

## 📋 Prerequisites

1. Node.js installed (v18 or higher)
2. Supabase project with:
   - Project URL
   - Anon Key
   - Service Role Key (⚠️ Keep this secret!)

## 🚀 Step 1: Install Backend Dependencies

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

## 🔐 Step 2: Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (⚠️ **SECRET** - never expose this in frontend code!)

## ⚙️ Step 3: Configure Environment Variables

1. In the `server` directory, create a `.env` file:

```bash
cd server
# Create .env file (copy from .env.example)
```

2. Add your Supabase credentials to `server/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:8080

# For Production (update when deploying)
# FRONTEND_URL=https://roseland-splash.vercel.app
```

**⚠️ Important:**
- Never commit `.env` to git (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` is secret - keep it safe!

## 🏃 Step 4: Start the Backend Server

### Development Mode (with auto-reload):

```bash
cd server
npm run dev
```

### Production Mode:

```bash
cd server
npm start
```

You should see:
```
✅ Backend server initialized
🔍 Supabase URL: https://xxxxx.supabase.co...
🚀 Backend server running on http://localhost:3001
📡 Health check: http://localhost:3001/health
```

## 🧪 Step 5: Test the Backend

Open your browser and visit:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

## 🔗 Step 6: Configure Frontend to Use Backend

1. In your project root, create or update `.env`:

```env
# Existing Supabase variables (keep these)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Add backend API URL
VITE_API_URL=http://localhost:3001
```

2. Restart your frontend dev server:

```bash
npm run dev
```

## 🌐 Step 7: Deploy Backend to Production

### Option A: Deploy to Railway (Recommended)

1. Go to https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Add a new service → "Empty Service"
5. Set the root directory to `server`
6. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT=3001`
   - `FRONTEND_URL=https://roseland-splash.vercel.app`
7. Deploy!

### Option B: Deploy to Render

1. Go to https://render.com
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Deploy!

### Option C: Deploy to Vercel (Serverless Functions)

If you want to keep everything on Vercel, you can convert the backend to Vercel serverless functions. This requires more setup but keeps everything in one place.

## 🔄 Step 8: Update Frontend Production Environment

After deploying the backend, update your Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (or your Render/other hosting URL)

3. Redeploy your frontend

## ✅ Step 9: Verify Everything Works

1. **Backend Health Check:**
   - Visit: `https://your-backend-url/health`
   - Should return: `{"status":"ok","message":"Backend server is running"}`

2. **Frontend Login:**
   - Try logging in with your credentials
   - Check browser console for API calls to backend
   - Should see: `📡 API Request: POST http://localhost:3001/api/auth/login`

3. **Check Backend Logs:**
   - Look for: `✅ Login successful for: your-email@example.com`

## 🐛 Troubleshooting

### Backend won't start

**Error: Missing Supabase environment variables**
- Make sure `server/.env` exists and has all required variables
- Check that `.env` is in `server/.gitignore` (it should be)

**Error: Cannot connect to Supabase**
- Verify your `SUPABASE_URL` is correct
- Check your internet connection
- Verify Supabase project is active

### Frontend can't connect to backend

**Error: Network error. Please check if the backend server is running.**
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is configured (should allow `http://localhost:8080`)

**Error: CORS error**
- Backend CORS is configured to allow `FRONTEND_URL`
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- For production, update `FRONTEND_URL` to your Vercel URL

### Login still not working

1. Check backend logs for errors
2. Verify Supabase service role key is correct
3. Check that user exists in Supabase Auth
4. Verify database trigger created user profile

## 📝 API Endpoints

The backend provides these endpoints:

- `GET /health` - Health check
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password
- `GET /api/auth/user` - Get current user

## 🔒 Security Notes

1. **Service Role Key**: Never expose this in frontend code or commit it to git
2. **CORS**: Backend only allows requests from `FRONTEND_URL`
3. **Environment Variables**: Keep all secrets in `.env` files
4. **Production**: Use HTTPS for all API calls in production

## 📚 Next Steps

- Monitor backend logs for errors
- Set up error tracking (e.g., Sentry)
- Add rate limiting for production
- Set up database connection pooling if needed

## 🆘 Need Help?

If you encounter issues:
1. Check backend logs
2. Check browser console
3. Verify all environment variables are set
4. Test backend health endpoint
5. Verify Supabase project is active

---

**Backend is now set up! 🎉**

Your authentication should now work reliably without timeout issues.


