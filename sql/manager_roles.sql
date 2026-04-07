-- Run in Supabase SQL Editor after auth_setup.sql
-- Adds store owner / admin role for manager dashboard access control

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('customer', 'owner', 'admin'));

COMMENT ON COLUMN user_profiles.role IS 'customer = shopper; owner/admin = store dashboard access';

UPDATE user_profiles SET role = 'customer' WHERE role IS NULL OR role = '';
