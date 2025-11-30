-- ========================================
-- Supabase Database Setup for Rollsland & Splash
-- ========================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" to create all tables and permissions
-- ========================================

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;

-- Create policies (allow public access for orders)
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

-- Verify tables were created
SELECT 
  'orders' as table_name, 
  COUNT(*) as row_count 
FROM orders
UNION ALL
SELECT 
  'order_items' as table_name, 
  COUNT(*) as row_count 
FROM order_items;

