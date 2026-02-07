# Email Template Setup Guide

## For EmailJS Template (Recommended)

When setting up your EmailJS template, use these variables and include the action button:

### Template Variables:
- `{{to_email}}` - Owner email (jerryrichman07@gmail.com)
- `{{customer_name}}` - Customer's name
- `{{customer_phone}}` - Customer's phone number
- `{{customer_email}}` - Customer's email
- `{{order_number}}` - Order number (e.g., RS12345678)
- `{{products}}` - List of products ordered
- `{{location}}` - Delivery location
- `{{total_amount}}` - Total order amount
- `{{payment_method}}` - Payment method
- `{{delivery_method}}` - Delivery method
- `{{special_instructions}}` - Special instructions
- `{{tracking_url}}` - Link to track order
- `{{start_processing_url}}` - **IMPORTANT: Link to start processing** (use this for the button!)
- `{{order_date}}` - Order date and time

### HTML Email Template with Action Button:

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
    .button { display: inline-block; padding: 15px 30px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 16px; }
    .button:hover { background: #20BA5A; }
    .status { font-size: 18px; font-weight: bold; color: #25D366; padding: 10px; background: #f0f9f4; border-radius: 5px; text-align: center; }
    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received</h1>
    </div>
    <div class="content">
      <div class="status">
        Status: Processing - Action Required
      </div>
      
      <div class="alert">
        <strong>⚠️ ACTION REQUIRED:</strong> Click the button below to start processing this order. The customer will be notified via email.
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
        <pre style="white-space: pre-wrap; font-family: Arial;">{{products}}</pre>
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
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{start_processing_url}}" class="button">
          ✅ START PROCESSING ORDER
        </a>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        Click the button above to notify the customer that their order is being processed.
      </p>
    </div>
  </div>
</body>
</html>
```

### Customer Confirmation Email Template:

Create a second template for customer confirmation emails:

**Template Variables:**
- `{{to_email}}` - Customer's email
- `{{customer_name}}` - Customer's name
- `{{order_number}}` - Order number
- `{{products}}` - List of products
- `{{total_amount}}` - Total amount
- `{{tracking_url}}` - Link to track order
- `{{order_date}}` - Order date

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #25D366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .status { font-size: 18px; font-weight: bold; color: #25D366; padding: 15px; background: #f0f9f4; border-radius: 5px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Your Order is Now Processing!</h1>
    </div>
    <div class="content">
      <div class="status">
        Status: Processing
      </div>
      
      <p>Dear {{customer_name}},</p>
      
      <p>Great news! We've started processing your order #{{order_number}}.</p>
      
      <p><strong>Expected Delivery:</strong> 1-3 days</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{tracking_url}}" class="button">Track Your Order</a>
      </div>
      
      <p>Thank you for your order!</p>
    </div>
  </div>
</body>
</html>
```

## Important Notes:

1. **Action Button URL**: Use `{{start_processing_url}}` in your EmailJS template - this is automatically generated
2. **Two Templates Needed**: 
   - One for owner (with start processing button)
   - One for customer (confirmation email)
3. **Template IDs**: Set these in your `.env`:
   - `VITE_EMAILJS_TEMPLATE_ID` - Owner email template
   - `VITE_EMAILJS_TEMPLATE_ID_CUSTOMER` - Customer confirmation template

## Testing:

1. Place a test order
2. Check jerryrichman07@gmail.com for the order notification
3. Click "START PROCESSING ORDER" button
4. Customer should receive confirmation email
5. Check order status updates

