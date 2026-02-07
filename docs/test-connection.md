# 🧪 Test Your Database Connection

## Quick Connection Test

After creating your database tables, you can test if everything is connected:

### Method 1: Test in Browser Console

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open your app in browser**

3. **Open browser console (F12)**

4. **Paste this code to test connection:**
   ```javascript
   import { supabase } from './lib/supabase'
   
   // Test connection
   const { data, error } = await supabase
     .from('orders')
     .select('*')
     .limit(1)
   
   if (error) {
     console.error('❌ Connection failed:', error)
   } else {
     console.log('✅ Connected! Orders:', data)
   }
   ```

### Method 2: Test by Placing an Order

1. **Place a test order** in your app
2. **Check Supabase Dashboard:**
   - Go to Table Editor
   - Click on `orders` table
   - You should see your test order!

### Method 3: Check Browser Console for Errors

When you place an order, check the browser console:
- ✅ **No errors** = Connection working!
- ❌ **"Missing environment variables"** = Restart dev server
- ❌ **"relation 'orders' does not exist"** = Run SQL script in Supabase

---

## ✅ Connection Status Checklist

- [ ] `.env` file exists ✅
- [ ] Database tables created (run SQL in Supabase)
- [ ] Dev server restarted
- [ ] No errors in browser console
- [ ] Test order appears in Supabase Dashboard

---

**You're fully connected when all checkboxes are checked!** 🎉

