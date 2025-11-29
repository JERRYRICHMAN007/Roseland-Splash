# Quick Start: WhatsApp Order Notifications

## Problem
Messages are not being received because browser-based methods cannot automatically send WhatsApp messages. You need a backend API.

## Quick Solution (5 minutes)

### Step 1: Set up the Backend Server

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

### Step 2: Configure Your Frontend

1. **Create a `.env` file** in the project root (same folder as `package.json`):
   ```env
   VITE_WHATSAPP_API_URL=http://localhost:3001/api/whatsapp/send
   ```

2. **Restart your frontend:**
   ```bash
   npm run dev
   ```

### Step 3: Choose a WhatsApp API Service

The server currently logs messages but doesn't send them. You need to configure one of these:

#### Option A: UltraMsg (Easiest - Free tier available)
1. Sign up at https://ultramsg.com/
2. Get your token and instance ID
3. In `server/whatsapp-server.js`, uncomment the UltraMsg section (Option 4)
4. Create `server/.env`:
   ```env
   ULTRAMSG_TOKEN=your_token_here
   ULTRAMSG_INSTANCE=your_instance_id_here
   ```

#### Option B: WhatsApp Business API (Best for production)
1. Set up at https://developers.facebook.com/
2. Get Phone Number ID and Access Token
3. In `server/whatsapp-server.js`, uncomment Option 1
4. Create `server/.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ```

#### Option C: Twilio (Reliable, paid)
1. Sign up at https://www.twilio.com/
2. Get Account SID, Auth Token, and WhatsApp number
3. In `server/whatsapp-server.js`, uncomment Option 2
4. Create `server/.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

### Step 4: Test

1. Place a test order on your website
2. Check the server console - you should see the message details
3. If configured correctly, the message will be sent to **0542347332**

## Current Configuration

- **WhatsApp Number:** 0542347332 (233542347332 in international format)
- **Message includes:** Customer name, phone, products, location, total amount, payment method

## Troubleshooting

- **No message received?** Check the server console for errors
- **API not configured?** The server will log the message instead of sending it
- **CORS errors?** Make sure the server is running and CORS is enabled

## Need Help?

See `WHATSAPP_SETUP.md` for detailed instructions on each API service.

