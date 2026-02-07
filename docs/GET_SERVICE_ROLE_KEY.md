# How to Get Your Supabase Service Role Key

## ⚠️ Important: You Need the Service Role Key

The backend server needs the **service_role** key (not the anon key) to work properly.

## Steps to Get Service Role Key:

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Login to your account

2. **Select Your Project:**
   - Click on your project (the one with ref: `lmxyeucnyevoxqbyxpzb`)

3. **Navigate to Settings:**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** under "Project Settings"

4. **Find the Service Role Key:**
   - Scroll down to find **"service_role"** key
   - It will be labeled as **"secret"** and have a warning icon
   - Click the **eye icon** or **"Reveal"** button to show it
   - Copy the entire key (it's a long JWT token)

5. **Update `server/.env`:**
   - Open `server/.env` file
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the actual service_role key
   - Save the file

## ⚠️ Security Warning:

- **NEVER** commit the service_role key to git
- **NEVER** expose it in frontend code
- **NEVER** share it publicly
- It has full access to your database (bypasses RLS)

## Example:

Your `server/.env` should look like:

```env
SUPABASE_URL=https://lmxyeucnyevoxqbyxpzb.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
FRONTEND_URL=http://localhost:8080
```

Once you have the service_role key, update the `.env` file and then start the backend server!

