# 🔍 Database Connection Verification Guide

## Step-by-Step Verification

### Step 1: Verify Environment Variables

1. Check your `.env` file exists in the project root
2. Verify it contains:
   ```
   VITE_SUPABASE_URL=https://lmxyeucnyevoqbxypgzb.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. **Restart your dev server** after checking/changing `.env`

### Step 2: Check Browser Console

Open browser DevTools (F12) and look for:
- ✅ `✅ Supabase client initialized successfully`
- ✅ `[DEBUG] Environment check: {url: 'SET', key: 'SET'}`

If you see warnings, the environment variables aren't loading.

### Step 3: Test Database Connection

1. Open browser console (F12)
2. Type this command:
   ```javascript
   // Test database connection
   import { testDatabaseConnection } from './src/utils/databaseTest';
   testDatabaseConnection().then(console.log);
   ```

Or check the console logs when:
- **Signing up** - Should see: `👤 Creating user profile in database...`
- **Placing an order** - Should see: `📝 Creating order in database...`

### Step 4: Verify Tables Exist in Supabase

Go to Supabase Dashboard → Table Editor and verify these tables exist:
- ✅ `orders`
- ✅ `order_items`
- ✅ `user_profiles`

### Step 5: Check RLS Policies

1. Go to Supabase Dashboard → Authentication → Policies
2. Verify RLS is enabled for all tables
3. Check that policies allow:
   - **orders**: Public can INSERT, SELECT
   - **order_items**: Public can INSERT, SELECT
   - **user_profiles**: Users can INSERT their own, SELECT their own

### Step 6: Test Data Insertion

**Test Signup:**
1. Go to `/signup`
2. Create a new account
3. Check browser console for:
   - `✅ User profile created successfully`
4. Check Supabase Dashboard → Table Editor → `user_profiles` - should see new row

**Test Order:**
1. Add items to cart
2. Go to checkout
3. Place an order
4. Check browser console for:
   - `✅ Order created successfully`
   - `✅ Created X order items`
5. Check Supabase Dashboard → Table Editor → `orders` - should see new row

---

## Common Issues

### Issue 1: "Database not configured"
**Solution:** 
- Check `.env` file exists
- Restart dev server (`npm run dev`)

### Issue 2: "Table not found" (404 error)
**Solution:**
- Run `database_setup.sql` in Supabase SQL Editor
- Run `auth_setup.sql` in Supabase SQL Editor

### Issue 3: "Permission denied" (403 error)
**Solution:**
- Check RLS policies in Supabase Dashboard
- Ensure policies allow INSERT and SELECT operations

### Issue 4: Data not appearing in Supabase
**Check:**
1. Browser console for errors
2. Network tab (F12) for failed requests
3. Supabase Dashboard → Logs for server errors

---

## What Was Changed

✅ **Removed all localStorage usage:**
- Cart: Now in memory only (temporary data)
- Orders: Database only (no localStorage fallback)
- Users: Database only (no localStorage check)

✅ **Added comprehensive logging:**
- All database operations now log success/failure
- Error details include code, message, details, hint

✅ **Better error handling:**
- No silent failures
- Clear error messages

---

## Next Steps

1. **Test signup** - Create a new account and check `user_profiles` table
2. **Test order** - Place an order and check `orders` and `order_items` tables
3. **Check console logs** - Look for ✅ or ❌ messages
4. **Verify in Supabase** - Check tables in Supabase Dashboard

If data still doesn't appear, check the browser console for specific error messages!

