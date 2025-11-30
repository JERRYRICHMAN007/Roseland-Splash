# ⚡ Quick Guide: Enable Email Auth

## 🎯 Goal: Enable Email Authentication for Password Reset

---

## ✅ STEP 1: Enable Email Provider (2 minutes)

1. **Open:** https://supabase.com/dashboard
2. **Select:** "Rollsland & Splash" project
3. **Click:** "Authentication" (left sidebar)
4. **Click:** "Providers" tab
5. **Find:** "Email" provider
6. **Toggle:** Switch ON ✅
7. **Done!** (Auto-saves)

---

## ✅ STEP 2: Add Redirect URL (1 minute)

1. **Click:** "URL Configuration" tab (still in Authentication)
2. **Find:** "Redirect URLs" section
3. **Add this URL:**
   ```
   http://localhost:8080/reset-password
   ```
4. **Press Enter** or click "Add"
5. **Done!** ✅

---

## 🎉 That's It!

Now:
- ✅ Users can sign up
- ✅ Users can log in
- ✅ Users can reset passwords
- ✅ Password reset emails will work

---

## 🧪 Quick Test

1. Go to: `http://localhost:8080/forgot-password`
2. Enter your email
3. Check your inbox for reset link
4. Click link → should go to reset page

**Everything should work now!** 🚀

