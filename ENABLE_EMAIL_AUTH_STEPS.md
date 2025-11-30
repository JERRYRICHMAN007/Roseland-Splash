# 🔐 Enable Email Auth - Step-by-Step Guide

## ✅ After Creating the `user_profiles` Table

Follow these exact steps to enable Email Authentication in Supabase:

---

## 📋 STEP 1: Enable Email Provider

### A. Navigate to Authentication Settings

1. **Go to:** https://supabase.com/dashboard
2. **Select your project:** "Rollsland & Splash"
3. **Click:** "Authentication" (left sidebar - looks like a key 🔑 icon)

### B. Enable Email Provider

1. **Click:** "Providers" tab (at the top of the Authentication page)
2. **Find:** "Email" in the list of providers
3. **Toggle the switch ON** ✅ (should turn green/active)
4. **Optional settings** (you can leave defaults):
   - "Confirm email" - You can enable this later (recommended for production)
   - "Secure email change" - Can enable later
5. **Click:** "Save" button (if there is one, or it auto-saves)

**✅ Email provider is now enabled!**

---

## 📋 STEP 2: Configure Redirect URL

### A. Open URL Configuration

1. **Still in Authentication section:**
   - Look for tabs at the top: "Users", "Providers", "Policies", **"URL Configuration"**
   - **Click:** "URL Configuration" tab

### B. Add Redirect URL

1. **Find:** "Redirect URLs" section
2. **You'll see a list or input box** for redirect URLs
3. **Click:** "Add URL" or just type in the input box:
   ```
   http://localhost:8080/reset-password
   ```
4. **Press Enter** or click "Add"
5. **Click:** "Save" button (if available)

**✅ Redirect URL is now configured!**

---

## 📋 STEP 3: (Optional) Configure Email Templates

1. **Click:** "Email Templates" tab (in Authentication section)
2. **Find:** "Reset Password" template
3. **You can customize it** or leave it as default
4. **Click:** "Save" if you made changes

**This is optional - default template works fine!**

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] Email provider is **ON** (green/active)
- [ ] Redirect URL `http://localhost:8080/reset-password` is in the list
- [ ] No error messages in Supabase Dashboard

---

## 🧪 Test It

1. **Go to your app:** `http://localhost:8080/forgot-password`
2. **Enter your email address**
3. **Click:** "Send Reset Link"
4. **Check your email** (inbox AND spam folder)
5. **Click the link** in the email
6. **Should redirect to:** `/reset-password` page

---

## ❓ Troubleshooting

### If Email Provider Won't Enable:
- Make sure you're on the correct project
- Try refreshing the page
- Check if there are any error messages

### If Redirect URL Won't Save:
- Make sure the URL is exactly: `http://localhost:8080/reset-password`
- No trailing slashes
- Try saving again

### If Emails Not Received:
- Check spam folder
- Wait 2-3 minutes
- Check Supabase Dashboard → Logs → Auth Logs
- Verify email address is correct

---

## 📸 What You Should See

### After Step 1:
- Email provider toggle should be **ON** (green)
- Other providers remain OFF (unless you enabled them)

### After Step 2:
- Your redirect URL should appear in the list:
  ```
  http://localhost:8080/reset-password
  ```

---

**Follow these steps exactly, and Email Auth will be enabled!** 🚀

