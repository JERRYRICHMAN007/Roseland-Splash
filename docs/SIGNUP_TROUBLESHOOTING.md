# 🔧 Signup Troubleshooting Guide

## Issue: Profile Not Created in Database

### Symptoms:
- Console shows: `👤 Creating user profile in database...`
- But no success message appears
- No data in `user_profiles` table in Supabase
- User is not redirected to login page

### Root Causes:

#### 1. **Email Confirmation Required** (Most Likely)
If email confirmation is enabled in Supabase, no session is available immediately after signup, which blocks profile creation due to RLS policies.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. **Disable it** (for development/testing)
4. Or keep it enabled and profile will be created on first login after email confirmation

#### 2. **RLS Policy Blocking Insert**
The RLS policy requires `auth.uid() = id`, but if there's no session, this check fails.

**Solution:**
1. Check Supabase Dashboard → Authentication → Policies
2. Verify the policy "Users can insert their own profile" exists
3. If missing, run `auth_setup.sql` again in Supabase SQL Editor

#### 3. **Table Doesn't Exist**
The `user_profiles` table might not exist.

**Solution:**
1. Go to Supabase Dashboard → Table Editor
2. Check if `user_profiles` table exists
3. If not, run `auth_setup.sql` in Supabase SQL Editor

---

## How to Debug

### Step 1: Check Browser Console
Look for these messages:
- ✅ `✅ Session available for profile creation` - Good!
- ❌ `⚠️ No session after signup` - Email confirmation is enabled
- ❌ `❌ Error creating user profile:` - Check the error details

### Step 2: Check Network Tab
1. Open DevTools (F12) → Network tab
2. Filter by "supabase"
3. Look for POST request to `/rest/v1/user_profiles`
4. Check the response:
   - **200 OK** = Success
   - **401/403** = Permission/RLS issue
   - **404** = Table doesn't exist
   - **Other** = Check error message

### Step 3: Check Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Look for errors related to `user_profiles` insert
3. Check the error message and code

---

## Quick Fixes

### Fix 1: Disable Email Confirmation (Recommended for Development)
```sql
-- In Supabase Dashboard → Authentication → Settings
-- Disable "Enable email confirmations"
```

### Fix 2: Verify RLS Policies
Run this in Supabase SQL Editor:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- If missing, recreate:
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Fix 3: Verify Table Exists
Run this in Supabase SQL Editor:
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- If missing, run auth_setup.sql
```

---

## Expected Console Output

### ✅ Success:
```
👤 Creating user profile in database... {userId: "...", ...}
✅ Session available for profile creation
✅ User profile created successfully: [uuid]
✅ Signup complete - user ready: [email]
```

### ❌ Failure (RLS Error):
```
👤 Creating user profile in database...
❌ Error creating user profile: {code: '42501', message: 'new row violates row-level security policy'}
🔒 RLS Policy Error - Profile creation blocked by security policy
💡 Solution: Check Supabase RLS policies or disable email confirmation
```

### ❌ Failure (No Session):
```
⚠️ No session after signup - email confirmation may be required
⚠️ Profile will be created automatically on first login
```

---

## Next Steps

1. **Check the console** for the actual error message
2. **Check Network tab** for the HTTP response
3. **Try the fixes above** based on the error
4. **Test again** after applying fixes

The improved error handling will now show you exactly what's wrong! 🎯

