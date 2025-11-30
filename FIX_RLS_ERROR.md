# 🔧 Fix RLS Policy Error for user_profiles

## ❌ Error You're Seeing:
```
new row violates row-level security policy for table "user_profiles"
Code: 42501
```

## 🔍 Root Cause:
The RLS (Row Level Security) policy requires `auth.uid() = id` to insert, but during signup, the session might not be fully established yet, causing the policy check to fail.

## ✅ Solution Options:

### Option 1: Fix RLS Policy (Recommended)
Run this SQL in Supabase SQL Editor:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create new policy
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Then also disable email confirmation:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. **Disable it** (for development/testing)

### Option 2: Use Database Trigger (Automatic)
Run `fix_rls_user_profiles.sql` in Supabase SQL Editor. This creates a trigger that automatically creates the profile when a user signs up, bypassing RLS.

**Advantages:**
- Works even with email confirmation enabled
- Automatic - no code changes needed
- More secure (runs on server)

### Option 3: Disable RLS Temporarily (Not Recommended)
Only for testing - **DO NOT use in production:**

```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

---

## 🚀 Quick Fix Steps:

### Step 1: Run the SQL Fix
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix_rls_user_profiles.sql`
3. Click "Run"

### Step 2: Disable Email Confirmation (If Needed)
1. Go to Supabase Dashboard → Authentication → Settings
2. Toggle OFF "Enable email confirmations"
3. Save

### Step 3: Test Signup Again
1. Try creating an account
2. Check console - should see: `✅ User profile created successfully`
3. Check Supabase Dashboard → `user_profiles` table - should see new user

---

## 🔍 Verify the Fix:

### Check RLS Policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

You should see a policy named "Users can insert their own profile" with `cmd = 'INSERT'`.

### Check Trigger (if using Option 2):
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

---

## 📝 Why This Happens:

1. **Email Confirmation Enabled:** When email confirmation is required, Supabase doesn't create a session immediately after signup
2. **RLS Policy Check:** The policy checks `auth.uid()` which requires an active session
3. **No Session = Policy Fails:** Without a session, `auth.uid()` returns null, so the policy check fails

**Solutions:**
- **Disable email confirmation** (easiest for development)
- **Use a database trigger** (works with email confirmation)
- **Wait for email confirmation** then create profile on first login (current fallback)

---

## ✅ After Fixing:

You should see in console:
```
👤 Creating user profile in database...
✅ User profile created successfully: [uuid]
✅ Signup complete - user ready: [email]
```

And in Supabase Dashboard → `user_profiles` table, you'll see the new user! 🎉

