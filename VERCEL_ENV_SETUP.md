# Vercel Environment Variables Setup

## Quick Setup for Production

### Step 1: Get Your Environment Variables

From your `.env` file, you need these two variables:
```
VITE_SUPABASE_URL=https://lmxyeucnyevoqbxypgzb.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: "Roseland-Splash" (or your project name)
3. **Click**: **Settings** (gear icon)
4. **Click**: **Environment Variables** (in the left sidebar)
5. **Add each variable**:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://lmxyeucnyevoqbxypgzb.supabase.co`
   - **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
   - **Click**: "Save"

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: (paste your anon key from `.env`)
   - **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
   - **Click**: "Save"

### Step 3: Redeploy

After adding environment variables:
1. **Go to**: **Deployments** tab
2. **Click**: The three dots (⋯) on your latest deployment
3. **Click**: "Redeploy"
4. **Wait** for deployment to complete

## Important Notes

- ✅ Environment variables must start with `VITE_` to be accessible in the browser
- ✅ You must redeploy after adding/changing environment variables
- ✅ Check all three environments (Production, Preview, Development)
- ✅ Never commit your `.env` file to git (it's already in `.gitignore`)

## Verify It's Working

After redeploying:
1. Go to your production URL
2. Open browser console (F12)
3. Look for: `✅ Supabase client initialized successfully`
4. Try logging in

If you see errors, check:
- Environment variables are set correctly
- Deployment completed successfully
- Browser console for specific error messages

