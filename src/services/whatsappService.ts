/**
 * WhatsApp Service
 * Sends WhatsApp messages automatically using API
 * 
 * IMPORTANT: For this to work, you need to set up a WhatsApp API service.
 * Options:
 * 1. Use a service like Twilio, MessageBird, or WhatsApp Business API
 * 2. Set up your own backend API endpoint
 * 3. Use a webhook service
 */

interface OrderDetails {
  customerName: string;
  customerPhone: string;
  products: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
  }>;
  location: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryMethod: string;
  specialInstructions?: string;
}

/**
 * Sends order notification to WhatsApp automatically
 * @param orderDetails - Order information
 * @param whatsappNumber - Recipient WhatsApp number (with country code, no +)
 * @returns Promise<boolean> - Success status
 */
export const sendOrderToWhatsApp = async (
  orderDetails: OrderDetails,
  whatsappNumber: string = "233542347332"
): Promise<boolean> => {
  try {
    // Format the message
    const productsList = orderDetails.products
      .map((item) => {
        const variantText = item.variant ? ` (${item.variant})` : "";
        return `- ${item.name}${variantText} x ${item.quantity}`;
      })
      .join("\n");

    const message = `🛒 *New Order Received*\n\n` +
      `*Customer:* ${orderDetails.customerName}\n` +
      `*Phone:* ${orderDetails.customerPhone}\n\n` +
      `*Products Ordered:*\n${productsList}\n\n` +
      `*Location:* ${orderDetails.location}\n\n` +
      `*Total Amount:* GH₵${orderDetails.totalAmount.toFixed(2)}\n` +
      `*Payment Method:* ${orderDetails.paymentMethod}\n` +
      `*Delivery Method:* ${orderDetails.deliveryMethod}` +
      (orderDetails.specialInstructions
        ? `\n\n*Special Instructions:* ${orderDetails.specialInstructions}`
        : "");

    // Method 1: Try using custom WhatsApp API endpoint
    // Set VITE_WHATSAPP_API_URL in your .env file
    // Example: VITE_WHATSAPP_API_URL=https://your-backend.com/api/whatsapp/send
    const apiEndpoint = import.meta.env.VITE_WHATSAPP_API_URL || "";

    if (apiEndpoint) {
      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: whatsappNumber,
            message: message,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("WhatsApp message sent via API:", result);
          return true;
        } else {
          const error = await response.text();
          console.error("WhatsApp API error response:", error);
        }
      } catch (apiError) {
        console.error("WhatsApp API request failed:", apiError);
      }
    }

    // Method 2: Use WhatsApp Webhook service (if configured)
    // This uses a webhook-based service that can send WhatsApp messages
    const webhookUrl = import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || "";
    
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: whatsappNumber,
            text: message,
          }),
        });

        if (response.ok) {
          console.log("WhatsApp message sent via webhook");
          return true;
        }
      } catch (webhookError) {
        console.error("WhatsApp webhook error:", webhookError);
      }
    }

    // Method 3: Fallback - Use WhatsApp link (opens WhatsApp, requires user to click send)
    // This is a fallback if no API is configured
    // Note: This won't send automatically, but will open WhatsApp with the message pre-filled
    console.warn("No WhatsApp API configured. Using fallback method (requires user interaction).");
    console.warn("To enable automatic sending, set up VITE_WHATSAPP_API_URL or VITE_WHATSAPP_WEBHOOK_URL");
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window (user needs to click send)
    // This is not ideal but works as a fallback
    window.open(whatsappUrl, "_blank");
    
    return false; // Return false since it's not fully automatic
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

