-- Run in Supabase SQL Editor (optional but recommended for audit + defaults)
-- 1) Default new orders to pending (matches app: cancel allowed only while pending)
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- 2) When the store marks an order as processing, we record who/when (used by app on update)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_started_by UUID;

COMMENT ON COLUMN orders.processing_started_at IS 'Set when status becomes processing (store lock)';
COMMENT ON COLUMN orders.processing_started_by IS 'auth.users id of staff who marked processing';
