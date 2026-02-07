-- ========================================
-- Fix RLS Policy for user_profiles INSERT
-- ========================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor
-- ========================================

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create a new policy that allows users to insert their own profile
-- This works even during signup when session might not be fully established
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    -- Allow if the authenticated user's ID matches the profile ID being inserted
    auth.uid() = id
  );

-- Also create a policy that allows service role to insert (for triggers/functions)
-- This is optional but can be useful for automatic profile creation
-- Note: Service role bypasses RLS, so this might not be needed

-- Verify the policy was created
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

-- ========================================
-- Alternative: Use a Database Trigger
-- ========================================
-- If the RLS policy still doesn't work, we can use a trigger
-- to automatically create the profile when a user signs up
-- ========================================

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- Note: If using the trigger approach, you can remove the INSERT policy
-- since the trigger runs with SECURITY DEFINER (bypasses RLS)
-- ========================================

