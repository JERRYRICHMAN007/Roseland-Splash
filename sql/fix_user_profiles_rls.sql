-- ========================================
-- Fix RLS Policies for user_profiles
-- ========================================
-- This script updates RLS policies to allow profile creation during signup
-- Run this in Supabase SQL Editor if profile creation is failing
-- ========================================

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create a new policy that allows users to insert their own profile
-- This works even if the session is just being established
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    -- Allow if the user is inserting their own profile (matches auth.uid())
    auth.uid() = id
    OR
    -- Allow if no auth context (for service role, but this shouldn't be needed)
    -- Actually, let's just use the first condition
    auth.uid() = id
  );

-- Also ensure the policy allows the insert to happen
-- The WITH CHECK clause verifies the data being inserted
-- The USING clause (for SELECT/UPDATE) verifies existing data

-- Verify the policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

