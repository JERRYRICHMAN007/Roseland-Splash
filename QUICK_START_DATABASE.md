# 🚀 Quick Start: Complete Database Connection

## ✅ Step 1: .env File Created!

The `.env` file has been created with your Supabase credentials. 

**File location:** `/.env`

---

## ✅ Step 2: Create Database Tables

### Option A: Using SQL File (Easiest)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your "Rollsland & Splash" project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Run the SQL:**
   - Open the file `database_setup.sql` in this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Tables Created:**
   - Go to "Table Editor" (left sidebar)
   - You should see:
     - ✅ `orders` table
     - ✅ `order_items` table

### Option B: Copy/Paste SQL

If you prefer, copy this SQL and paste it into Supabase SQL Editor:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  location TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_variant TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;

-- Create policies
CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to orders"
  ON orders FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to order_items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);
```

---

## ✅ Step 3: Restart Your Dev Server

**IMPORTANT:** Restart your dev server so it picks up the `.env` file:

```bash
# Stop your current server (Ctrl+C if running)
# Then restart:
npm run dev
```

---

## ✅ Step 4: Test the Connection

1. **Open your app** in the browser
2. **Open browser console** (F12)
3. **Place a test order:**
   - Add items to cart
   - Go to checkout
   - Complete the order

4. **Check if it worked:**
   - ✅ No errors in console
   - ✅ Order appears in Supabase Dashboard → Table Editor → `orders` table
   - ✅ Order items appear in `order_items` table

---

## 🎉 You're Connected!

Once you complete Step 2 (create tables) and Step 3 (restart server), your app will be fully connected to Supabase!

### What Happens Now:

- ✅ Orders save to Supabase database
- ✅ Orders are permanent (won't be lost)
- ✅ You can view orders in Supabase Dashboard
- ✅ Orders accessible from anywhere
- ✅ Automatic backups

### Fallback System:

If the database is unavailable, your app will automatically fall back to localStorage so it keeps working.

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- **Solution:** Restart your dev server after creating `.env` file

### Error: "relation 'orders' does not exist"
- **Solution:** You need to run the SQL script in Supabase SQL Editor

### Orders not appearing in Supabase
- **Check:** Browser console for errors
- **Check:** Supabase Dashboard → Table Editor → `orders` table
- **Try:** Refresh the page in Supabase Dashboard

### Connection issues
- **Check:** `.env` file exists and has correct values
- **Check:** Supabase project is active (not paused)
- **Check:** Internet connection

---

## 📊 Verify Everything Works

✅ `.env` file created  
✅ SQL script ready (`database_setup.sql`)  
✅ Tables created in Supabase  
✅ Dev server restarted  
✅ Test order placed successfully  
✅ Order appears in Supabase Dashboard  

**Once all checkboxes are ✅, you're fully connected!** 🎉

