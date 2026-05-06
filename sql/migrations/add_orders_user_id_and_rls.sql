-- =============================================================================
-- Migration: orders.user_id, strict RLS on orders/order_items, user_profiles
-- Safe to re-run: DROP IF EXISTS + CREATE OR REPLACE + IF NOT EXISTS
-- Prerequisites: sql/auth_setup.sql, sql/manager_roles.sql (user_profiles.role)
-- Run in Supabase SQL Editor only (do not execute from the app).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Add user_id to orders (nullable for legacy + guest checkout)
-- -----------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Step 2: Drop ALL policies named in repo SQL + this migration (open/public + prior RLS)
-- “Public” legacy names used USING (true) / WITH CHECK (true) in older drafts:
--   "Allow public read access to orders"
--   "Allow public insert access to orders"
--   "Allow public update access to orders"
--   "Allow public read access to order_items"
--   "Allow public insert access to order_items"
-- Prior named policies from sql/database_setup.sql / older migrations:
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;

DROP POLICY IF EXISTS orders_customer_select ON orders;
DROP POLICY IF EXISTS orders_customer_insert ON orders;
DROP POLICY IF EXISTS orders_customer_update ON orders;
DROP POLICY IF EXISTS orders_staff_select ON orders;
DROP POLICY IF EXISTS orders_staff_update ON orders;
DROP POLICY IF EXISTS orders_staff_insert ON orders;
DROP POLICY IF EXISTS orders_staff_delete ON orders;

DROP POLICY IF EXISTS order_items_customer_select ON order_items;
DROP POLICY IF EXISTS order_items_customer_insert ON order_items;
DROP POLICY IF EXISTS order_items_staff_select ON order_items;
DROP POLICY IF EXISTS order_items_staff_insert ON order_items;
DROP POLICY IF EXISTS order_items_staff_update ON order_items;
DROP POLICY IF EXISTS order_items_staff_delete ON order_items;

-- Names from this migration (idempotent re-run)
DROP POLICY IF EXISTS orders_authenticated_select ON orders;
DROP POLICY IF EXISTS orders_authenticated_insert ON orders;
DROP POLICY IF EXISTS orders_authenticated_update ON orders;
DROP POLICY IF EXISTS orders_guest_insert_anon ON orders;

DROP POLICY IF EXISTS order_items_authenticated_select ON order_items;
DROP POLICY IF EXISTS order_items_authenticated_insert ON order_items;
DROP POLICY IF EXISTS order_items_guest_insert_anon ON order_items;
DROP POLICY IF EXISTS order_items_staff_select ON order_items;
DROP POLICY IF EXISTS order_items_staff_insert ON order_items;
DROP POLICY IF EXISTS order_items_staff_update ON order_items;
DROP POLICY IF EXISTS order_items_staff_delete ON order_items;

-- user_profiles (sql/auth_setup.sql, sql/fix_* )
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON user_profiles;
DROP POLICY IF EXISTS user_profiles_admin_select ON user_profiles;
DROP POLICY IF EXISTS user_profiles_admin_update ON user_profiles;

-- -----------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER reads role without user_profiles RLS recursion)
-- Staff = admin OR owner (matches sql/manager_roles.sql). To restrict to admin
-- only, change the WHERE clause to `up.role = 'admin'`.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_is_store_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'owner')
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_store_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_store_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_is_store_staff() TO anon;

-- Guest order_lines: anon cannot SELECT orders; this bypasses RLS only to test user_id IS NULL
CREATE OR REPLACE FUNCTION public.order_is_guest_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id AND o.user_id IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.order_is_guest_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.order_is_guest_order(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.order_is_guest_order(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- Step 3: orders — authenticated customers (own rows) + staff (all) + guest insert (anon)
-- -----------------------------------------------------------------------------
CREATE POLICY orders_authenticated_select
  ON orders FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY orders_authenticated_insert
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY orders_authenticated_update
  ON orders FOR UPDATE TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Guest: anon may INSERT rows with no owning user; no SELECT/UPDATE on orders for anon
CREATE POLICY orders_guest_insert_anon
  ON orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Staff: full access (dashboard, ops). Uses user_profiles.role via auth_is_store_staff().
CREATE POLICY orders_staff_select
  ON orders FOR SELECT TO authenticated
  USING (public.auth_is_store_staff());

CREATE POLICY orders_staff_insert
  ON orders FOR INSERT TO authenticated
  WITH CHECK (public.auth_is_store_staff());

CREATE POLICY orders_staff_update
  ON orders FOR UPDATE TO authenticated
  USING (public.auth_is_store_staff())
  WITH CHECK (public.auth_is_store_staff());

CREATE POLICY orders_staff_delete
  ON orders FOR DELETE TO authenticated
  USING (public.auth_is_store_staff());

-- -----------------------------------------------------------------------------
-- Step 4: order_items — authenticated users (parent order.user_id = auth.uid()),
--         anon insert only for guest parent order (SECURITY DEFINER helper),
--         staff all commands
-- -----------------------------------------------------------------------------
CREATE POLICY order_items_authenticated_select
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.user_id IS NOT NULL
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY order_items_authenticated_insert
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.user_id IS NOT NULL
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY order_items_guest_insert_anon
  ON order_items FOR INSERT TO anon
  WITH CHECK (public.order_is_guest_order(order_id));

CREATE POLICY order_items_staff_select
  ON order_items FOR SELECT TO authenticated
  USING (public.auth_is_store_staff());

CREATE POLICY order_items_staff_insert
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (public.auth_is_store_staff());

CREATE POLICY order_items_staff_update
  ON order_items FOR UPDATE TO authenticated
  USING (public.auth_is_store_staff())
  WITH CHECK (public.auth_is_store_staff());

CREATE POLICY order_items_staff_delete
  ON order_items FOR DELETE TO authenticated
  USING (public.auth_is_store_staff());

-- -----------------------------------------------------------------------------
-- Step 5: user_profiles — own row + staff read/update all (no public USING (true))
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY user_profiles_admin_select
  ON user_profiles FOR SELECT TO authenticated
  USING (public.auth_is_store_staff());

CREATE POLICY user_profiles_admin_update
  ON user_profiles FOR UPDATE TO authenticated
  USING (public.auth_is_store_staff())
  WITH CHECK (public.auth_is_store_staff());

-- -----------------------------------------------------------------------------
-- Step 6 notes
-- - orders.user_id stays nullable (guest orders).
-- - orders_guest_insert_anon: anon INSERT only when user_id IS NULL.
-- - No anon SELECT/UPDATE on orders.
-- - Guest order_items rely on order_is_guest_order (SECURITY DEFINER).
-- -----------------------------------------------------------------------------
COMMENT ON COLUMN orders.user_id IS 'Owning shopper; NULL = guest order (anon insert only)';
COMMENT ON FUNCTION public.auth_is_store_staff() IS 'RLS helper: staff roles admin or owner (manager_roles.sql)';
COMMENT ON FUNCTION public.order_is_guest_order(uuid) IS 'True if order exists and user_id IS NULL; used for anon order_items INSERT';
