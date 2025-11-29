/**
 * Simple WhatsApp Backend Server
 * 
 * This server handles sending WhatsApp messages via API
 * 
 * To use:
 * 1. Install dependencies: npm install express cors dotenv
 * 2. Set up your WhatsApp API credentials (see below)
 * 3. Run: node server/whatsapp-server.js
 * 4. Update your .env file: VITE_WHATSAPP_API_URL=http://localhost:3001/api/whatsapp/send
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * WhatsApp API Endpoint
 * POST /api/whatsapp/send
 * Body: { to: "233542347332", message: "Your message here" }
 */
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, message' 
      });
    }

    // Option 1: Using WhatsApp Business API (Recommended)
    // Uncomment and configure if you have WhatsApp Business API credentials
    /*
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return res.status(500).json({ 
        success: false, 
        error: 'WhatsApp API credentials not configured' 
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      return res.json({ success: true, result });
    } else {
      return res.status(response.status).json({ success: false, error: result });
    }
    */

    // Option 2: Using Twilio WhatsApp API
    // Uncomment and configure if you have Twilio credentials
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+1234567890

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio credentials not configured' 
      });
    }

    const twilio = require('twilio')(accountSid, authToken);

    const result = await twilio.messages.create({
      from: fromNumber,
      to: `whatsapp:+${to}`,
      body: message
    });

    return res.json({ success: true, result });
    */

    // Option 3: Using a webhook service (like Zapier, Make.com, or custom)
    // Uncomment and configure if you have a webhook URL
    /*
    const WEBHOOK_URL = process.env.WHATSAPP_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
      return res.status(500).json({ 
        success: false, 
        error: 'Webhook URL not configured' 
      });
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: to,
        message: message
      })
    });

    const result = await response.json();
    return res.json({ success: true, result });
    */

    // Option 4: Using UltraMsg API (Free tier available)
    // Sign up at https://ultramsg.com/ and get your API token
    /*
    const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;
    const ULTRAMSG_INSTANCE = process.env.ULTRAMSG_INSTANCE;

    if (!ULTRAMSG_TOKEN || !ULTRAMSG_INSTANCE) {
      return res.status(500).json({ 
        success: false, 
        error: 'UltraMsg credentials not configured' 
      });
    }

    const response = await fetch('https://api.ultramsg.com/instance' + ULTRAMSG_INSTANCE + '/messages/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: ULTRAMSG_TOKEN,
        to: `+${to}`,
        body: message
      })
    });

    const result = await response.json();
    return res.json({ success: true, result });
    */

    // TEMPORARY: For testing - logs the message instead of sending
    // Remove this and uncomment one of the options above
    console.log('='.repeat(50));
    console.log('WHATSAPP MESSAGE (Not sent - API not configured)');
    console.log('To:', to);
    console.log('Message:', message);
    console.log('='.repeat(50));
    
    return res.json({ 
      success: false, 
      message: 'WhatsApp API not configured. Check server logs for message details.',
      note: 'Configure one of the API options in server/whatsapp-server.js'
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WhatsApp server is running' });
});

app.listen(PORT, () => {
  console.log(`WhatsApp server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/whatsapp/send`);
  console.log('\n⚠️  IMPORTANT: Configure a WhatsApp API service in server/whatsapp-server.js');
  console.log('   See WHATSAPP_SETUP.md for instructions\n');
});

