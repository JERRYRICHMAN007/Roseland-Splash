-- ========================================
-- General Wishlist Table Setup
-- ========================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" to create the general wishlist table and permissions
-- ========================================

-- Create general_wishlist table for products
CREATE TABLE IF NOT EXISTS general_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT NOT NULL,
  product_variant TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, product_variant)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_general_wishlist_user_id ON general_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_general_wishlist_product_id ON general_wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_general_wishlist_created_at ON general_wishlist(created_at);

-- Enable Row Level Security
ALTER TABLE general_wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON general_wishlist;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON general_wishlist;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON general_wishlist;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON general_wishlist;
DROP POLICY IF EXISTS "Public can view all wishlist items" ON general_wishlist;
DROP POLICY IF EXISTS "Public can insert wishlist items" ON general_wishlist;

-- Create policies
-- Allow authenticated users to manage their own wishlist items
CREATE POLICY "Users can view their own wishlist items"
  ON general_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON general_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON general_wishlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON general_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public (unauthenticated) users to view all wishlist items (for admin purposes)
-- and insert items (they'll be stored with user_id = NULL, but we'll use session storage as fallback)
CREATE POLICY "Public can view all wishlist items"
  ON general_wishlist FOR SELECT
  USING (true);

CREATE POLICY "Public can insert wishlist items"
  ON general_wishlist FOR INSERT
  WITH CHECK (true);

-- Verify table was created
SELECT 
  'general_wishlist' as table_name, 
  COUNT(*) as row_count 
FROM general_wishlist;

