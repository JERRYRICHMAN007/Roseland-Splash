-- ========================================
-- Wishlist Table Setup for Category Wishlist Feature
-- ========================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" to create the wishlist table and permissions
-- ========================================

-- Create category_wishlist table
CREATE TABLE IF NOT EXISTS category_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, item_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON category_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_category_id ON category_wishlist(category_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON category_wishlist(created_at);

-- Enable Row Level Security
ALTER TABLE category_wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON category_wishlist;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON category_wishlist;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON category_wishlist;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON category_wishlist;
DROP POLICY IF EXISTS "Public can view all wishlist items" ON category_wishlist;
DROP POLICY IF EXISTS "Public can insert wishlist items" ON category_wishlist;

-- Create policies
-- Allow authenticated users to manage their own wishlist items
CREATE POLICY "Users can view their own wishlist items"
  ON category_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON category_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON category_wishlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON category_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public (unauthenticated) users to view all wishlist items (for admin purposes)
-- and insert items (they'll be stored with user_id = NULL)
CREATE POLICY "Public can view all wishlist items"
  ON category_wishlist FOR SELECT
  USING (true);

CREATE POLICY "Public can insert wishlist items"
  ON category_wishlist FOR INSERT
  WITH CHECK (true);

-- Verify table was created
SELECT 
  'category_wishlist' as table_name, 
  COUNT(*) as row_count 
FROM category_wishlist;

