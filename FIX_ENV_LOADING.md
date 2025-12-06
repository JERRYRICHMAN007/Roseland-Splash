# 🔧 Fix: Environment Variables Not Loading

## Problem
Your `.env` file exists but Vite isn't loading it. This is because:

1. **Dev server must be restarted** after creating/editing `.env` file
2. **Browser cache** might be interfering
3. **The .env file format** needs to be correct

---

## ✅ Solution Steps:

### Step 1: Verify .env File Format

Your `.env` file should look exactly like this (no quotes, no spaces around `=`):

```env
VITE_SUPABASE_URL=https://lmxyeucnyevoqbxypgzb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:**
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ Each variable on its own line
- ✅ No blank lines between variables

### Step 2: Force Restart Dev Server

1. **Completely stop the server:**
   - Press `Ctrl + C` in terminal
   - Wait for it to fully stop
   - Close the terminal if needed

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - OR: Open in incognito/private window

3. **Start server fresh:**
   ```bash
   npm run dev
   ```

4. **Open browser in fresh window:**
   - Close all browser tabs with your app
   - Open a new tab
   - Go to `http://localhost:8080`

### Step 3: Check Console

After restarting, check browser console (F12). You should see:

**✅ Success:**
```
✅ Supabase client initialized successfully
```

**❌ Still Not Working:**
```
⚠️ Supabase environment variables not found
```

---

## Alternative: Test Environment Variables

Add this temporary code to test if Vite is loading the .env file:

In `src/lib/supabase.ts`, temporarily add:

```typescript
console.log('Environment variables check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
```

This will show you if Vite is reading the variables.

---

## If Still Not Working:

1. **Check .env file location:**
   - Must be in project root (same folder as `package.json`)
   - Not in `src/` folder

2. **Check file encoding:**
   - Should be UTF-8
   - No BOM (Byte Order Mark)

3. **Try creating .env.local instead:**
   - Sometimes Vite prefers `.env.local`
   - Copy contents of `.env` to `.env.local`

---

## Verify Tables Are Created:

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Check if you see:
   - ✅ `orders` table
   - ✅ `order_items` table

If tables don't exist, you need to run the SQL script first!

