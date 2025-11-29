# EmailJS Setup Guide

## Why EmailJS?

EmailJS allows you to send emails directly from your frontend application without a backend server. It's free for up to 200 emails per month.

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Connect your Gmail account (jerryrichman07@gmail.com)
5. Note your **Service ID** (e.g., `service_xxxxx`)

### Step 3: Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template:

**Template Name:** Order Notification

**Subject:**
```
🛒 New Order from {{customer_name}} - {{order_number}}
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #25D366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; padding: 15px; background: white; border-left: 4px solid #25D366; }
    .section h3 { margin-top: 0; color: #25D366; }
    .button { display: inline-block; padding: 12px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .button:hover { background: #20BA5A; }
    .status { font-size: 18px; font-weight: bold; color: #25D366; padding: 10px; background: #f0f9f4; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received</h1>
    </div>
    <div class="content">
      <div class="status">
        Status: Processing
      </div>
      
      <div class="section">
        <h3>Order Information</h3>
        <p><strong>Order Number:</strong> {{order_number}}</p>
        <p><strong>Order Date:</strong> {{order_date}}</p>
        <p><strong>Track Order:</strong> <a href="{{tracking_url}}">{{tracking_url}}</a></p>
      </div>
      
      <div class="section">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> {{customer_name}}</p>
        <p><strong>Phone:</strong> {{customer_phone}}</p>
        <p><strong>Email:</strong> {{customer_email}}</p>
      </div>
      
      <div class="section">
        <h3>Products Ordered</h3>
        <pre style="white-space: pre-wrap;">{{products}}</pre>
      </div>
      
      <div class="section">
        <h3>Delivery Information</h3>
        <p><strong>Location:</strong> {{location}}</p>
        <p><strong>Delivery Method:</strong> {{delivery_method}}</p>
        <p><strong>Special Instructions:</strong> {{special_instructions}}</p>
      </div>
      
      <div class="section">
        <h3>Order Summary</h3>
        <p><strong>Total Amount:</strong> {{total_amount}}</p>
        <p><strong>Payment Method:</strong> {{payment_method}}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="{{tracking_url}}" class="button">View Order Details</a>
      </div>
    </div>
  </div>
</body>
</html>
```

4. Note your **Template ID** (e.g., `template_xxxxx`)

### Step 4: Get Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `xxxxxxxxxxxxx`)

### Step 5: Configure Your App

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add these variables:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_ORDER_EMAIL=jerryrichman07@gmail.com
```

3. Replace the values with your actual IDs from EmailJS
4. Restart your development server

### Step 6: Test

1. Place a test order on your website
2. Check jerryrichman07@gmail.com for the order notification
3. The email should arrive automatically!

## Template Variables

The email template uses these variables (automatically filled by the app):
- `{{customer_name}}` - Customer's name
- `{{customer_phone}}` - Customer's phone number
- `{{customer_email}}` - Customer's email
- `{{order_number}}` - Order number (e.g., RS12345678)
- `{{order_date}}` - Order date and time
- `{{products}}` - List of products ordered
- `{{location}}` - Delivery location
- `{{total_amount}}` - Total order amount
- `{{payment_method}}` - Payment method
- `{{delivery_method}}` - Delivery method
- `{{special_instructions}}` - Special delivery instructions
- `{{tracking_url}}` - Link to track the order

## Troubleshooting

- **Email not received?** Check your spam folder
- **Template not working?** Make sure all variable names match exactly
- **Service not connected?** Reconnect your email service in EmailJS dashboard
- **Rate limit?** Free tier allows 200 emails/month. Upgrade for more.

## Next Steps

Once EmailJS is set up, emails will be sent automatically when orders are placed. The system also includes:
- Order tracking with status updates
- Manager dashboard to view all orders
- Customer order tracking page

Visit `/manager/dashboard` to see all orders and their statuses!

