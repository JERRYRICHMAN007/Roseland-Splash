# Vercel Deployment Guide - Frontend + Backend

This guide will help you deploy both your frontend and backend to Vercel.

## ✅ What's Been Configured

1. ✅ `vercel.json` - Routes API requests to your backend
2. ✅ `server/index.js` - Updated to work as Vercel serverless function
3. ✅ `src/services/backendApi.ts` - Updated to use relative paths in production

## 🚀 Step-by-Step Deployment

### Step 1: Push Changes to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push
```

### Step 2: Set Environment Variables in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables (for **All Environments** - Production, Preview, Development):

#### Backend Variables:
1. **SUPABASE_URL**
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

2. **SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (⚠️ Keep this secret!)

4. **FRONTEND_URL**
   - Value: `https://roseland-splash.vercel.app` (or your custom domain)

#### Frontend Variables:
5. **VITE_SUPABASE_URL**
   - Value: Same as SUPABASE_URL above

6. **VITE_SUPABASE_ANON_KEY**
   - Value: Same as SUPABASE_ANON_KEY above

**⚠️ Important:** Do NOT set `VITE_API_URL` - leave it unset. The app will use relative paths automatically.

### Step 3: Deploy

1. **Automatic Deployment:**
   - If you have GitHub connected, Vercel will auto-deploy on push
   - Go to **Deployments** tab to see the progress

2. **Manual Deployment:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on your latest deployment
   - Or push a new commit to trigger deployment

### Step 4: Verify Deployment

After deployment completes:

1. **Test Backend Health:**
   - Visit: `https://roseland-splash.vercel.app/health`
   - Should return: `{"status":"ok","message":"Backend server is running"}`

2. **Test API Endpoint:**
   - Visit: `https://roseland-splash.vercel.app/api/auth/login` (POST request)
   - Should not return 404

3. **Test Frontend:**
   - Visit: `https://roseland-splash.vercel.app`
   - Try logging in
   - Check browser console for API calls (should use relative paths like `/api/auth/login`)

## 🔍 How It Works

- **Frontend:** Served from Vercel's CDN (your React app)
- **Backend:** Runs as Vercel serverless functions
- **API Routes:** All `/api/*` requests are routed to `server/index.js`
- **Same Domain:** Both frontend and backend are on the same domain, so no CORS issues!

## 🐛 Troubleshooting

### Backend returns 404

- Check that `vercel.json` is in the project root
- Verify the routes in `vercel.json` are correct
- Check deployment logs in Vercel dashboard

### CORS Errors

- Make sure `FRONTEND_URL` environment variable is set correctly
- Should match your Vercel domain exactly

### Environment Variables Not Working

- Make sure variables are set for **All Environments**
- Redeploy after adding/changing environment variables
- Variables starting with `VITE_` are for frontend, others are for backend

### Login Still Not Working

1. Check browser console for errors
2. Check Vercel function logs (Deployments → Click deployment → Functions tab)
3. Verify all environment variables are set
4. Test the health endpoint first: `/health`

## 📝 Notes

- **Development:** Still uses `http://localhost:3002` for backend
- **Production:** Uses relative paths (same domain)
- **No Separate Backend URL Needed:** Everything runs on one Vercel domain

## ✅ Success Checklist

- [ ] All code pushed to GitHub
- [ ] Environment variables set in Vercel
- [ ] Deployment completed successfully
- [ ] `/health` endpoint works
- [ ] Frontend loads correctly
- [ ] Login works in production

---

**Your app is now ready for production! 🎉**

