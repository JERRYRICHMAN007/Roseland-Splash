/**
 * Simple Email Service using FormSubmit or Webhook
 * This actually sends emails without needing EmailJS setup
 */

interface OrderDetails {
  customerName: string;
  customerPhone: string;
  email?: string;
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
  orderId?: string;
  orderNumber?: string;
  trackingUrl?: string;
}

/**
 * Sends email using FormSubmit (free, no setup needed)
 * Or webhook if configured
 */
export const sendEmailSimple = async (
  orderDetails: OrderDetails,
  recipientEmail: string = "jerryrichman07@gmail.com"
): Promise<boolean> => {
  try {
    // Format products list
    const productsList = orderDetails.products
      .map((item) => {
        const variantText = item.variant ? ` (${item.variant})` : "";
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `${item.name}${variantText} x ${item.quantity} = GH₵${itemTotal}`;
      })
      .join("\n");

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const startProcessingUrl = orderDetails.orderId 
      ? `${baseUrl}/order/${orderDetails.orderId}/start-processing`
      : "";

    // Email subject
    const subject = `🛒 New Order: ${orderDetails.orderNumber} - ${orderDetails.customerName}`;

    // Email body
    const emailBody = `
🛒 NEW ORDER RECEIVED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderDetails.orderNumber || "N/A"}
Order Date: ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" })}
Status: Processing (Pending Confirmation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${orderDetails.customerName}
Phone: ${orderDetails.customerPhone}
Email: ${orderDetails.email || "Not provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTS ORDERED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${productsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DELIVERY INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Location: ${orderDetails.location}
Delivery Method: ${orderDetails.deliveryMethod}
${orderDetails.specialInstructions ? `Special Instructions: ${orderDetails.specialInstructions}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Amount: GH₵${orderDetails.totalAmount.toFixed(2)}
Payment Method: ${orderDetails.paymentMethod}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click the link below to start processing this order:
${startProcessingUrl || "Link will be in EmailJS template"}

Track Order: ${orderDetails.trackingUrl || ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Method 1: Try webhook if configured
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || "";
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject: subject,
            body: emailBody,
            orderNumber: orderDetails.orderNumber,
            startProcessingUrl: startProcessingUrl,
          }),
        });
        
        if (response.ok) {
          console.log("Email sent via webhook");
          return true;
        }
      } catch (error) {
        console.error("Webhook error:", error);
      }
    }

    // Method 2: Use FormSubmit (free, works automatically)
    try {
      const formSubmitUrl = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;
      
      const response = await fetch(formSubmitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: "Roseland & Splash Orders",
          subject: subject,
          message: emailBody,
          _captcha: false,
        }),
      });

      if (response.ok) {
        console.log("Email sent via FormSubmit");
        return true;
      }
    } catch (error) {
      console.error("FormSubmit error:", error);
    }

    // Method 3: Use EmailJS if configured
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    if (serviceId && templateId && publicKey) {
      try {
        const { default: emailjs } = await import("@emailjs/browser");
        emailjs.init(publicKey);

        const templateParams = {
          to_email: recipientEmail,
          customer_name: orderDetails.customerName,
          customer_phone: orderDetails.customerPhone,
          customer_email: orderDetails.email || "Not provided",
          products: productsList,
          location: orderDetails.location,
          total_amount: `GH₵${orderDetails.totalAmount.toFixed(2)}`,
          payment_method: orderDetails.paymentMethod,
          delivery_method: orderDetails.deliveryMethod,
          special_instructions: orderDetails.specialInstructions || "None",
          order_number: orderDetails.orderNumber || "N/A",
          tracking_url: orderDetails.trackingUrl || "",
          start_processing_url: startProcessingUrl,
          order_date: new Date().toLocaleString("en-GB", {
            dateStyle: "full",
            timeStyle: "long",
          }),
        };

        await emailjs.send(serviceId, templateId, templateParams);
        console.log("Email sent via EmailJS");
        return true;
      } catch (error) {
        console.error("EmailJS error:", error);
      }
    }

    // Method 4: Fallback - mailto link
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    const link = document.createElement("a");
    link.href = mailtoLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Email notification prepared (fallback)");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

