/**
 * Email Service using EmailJS
 * Sends order notifications automatically via email
 */

import emailjs from "@emailjs/browser";

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

/** Owner inbox from env; skip sends when unset (no hardcoded fallback addresses). */
function getOrderNotificationRecipients(): string[] {
  const primary = (import.meta.env.VITE_ORDER_EMAIL ?? "").trim();
  return primary ? [primary] : [];
}

/**
 * Sends order notification via EmailJS
 * @param orderDetails - Order information
 * @param recipientEmail - Email address to send notification to (optional, defaults to both addresses)
 * @returns Promise<boolean> - Success status
 */
export const sendOrderViaEmail = async (
  orderDetails: OrderDetails,
  recipientEmail?: string
): Promise<boolean> => {
  const emailsToSend = recipientEmail
    ? [recipientEmail]
    : getOrderNotificationRecipients();
  if (emailsToSend.length === 0) {
    console.warn(
      "[emailService] Skipping owner notification: VITE_ORDER_EMAIL is empty."
    );
    return false;
  }
  try {
    // Format products list for email
    const productsList = orderDetails.products
      .map((item) => {
        const variantText = item.variant ? ` (${item.variant})` : "";
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `${item.name}${variantText} x ${item.quantity} = GH₵${itemTotal}`;
      })
      .join("\n");

    // Get EmailJS configuration from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    // If EmailJS is configured, use it
    if (serviceId && templateId && publicKey) {
      try {
        // Initialize EmailJS
        emailjs.init(publicKey);

        // Send to all recipient emails
        const emailPromises = emailsToSend.map(async (email) => {
          const templateParams = {
            to_email: email,
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
            start_processing_url: orderDetails.orderId && orderDetails.trackingUrl
              ? `${orderDetails.trackingUrl.split('/track-order/')[0]}/order/${orderDetails.orderId}/start-processing`
              : orderDetails.orderId
              ? `/order/${orderDetails.orderId}/start-processing`
              : "",
            order_date: new Date().toLocaleString("en-GB", {
              dateStyle: "full",
              timeStyle: "long",
            }),
          };

          return emailjs.send(serviceId, templateId, templateParams);
        });

        await Promise.all(emailPromises);
        console.log(`Email sent successfully via EmailJS to ${emailsToSend.length} recipient(s):`, emailsToSend);
        return true;
      } catch (emailjsError) {
        console.error("EmailJS error:", emailjsError);
        // Fall through to mailto method
      }
    }

    // Fallback: Use mailto: link (works without setup)
    const emailSubject = `🛒 New Order from ${orderDetails.customerName} - ${orderDetails.orderNumber || "Order"}`;
    
    const emailBody = `
🛒 NEW ORDER RECEIVED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderDetails.orderNumber || "N/A"}
Order Date: ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" })}
${orderDetails.trackingUrl ? `Track Order: ${orderDetails.trackingUrl}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${orderDetails.customerName}
Phone: ${orderDetails.customerPhone}
${orderDetails.email ? `Email: ${orderDetails.email}` : ""}

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

STATUS: Processing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click the link below to start processing this order:
${orderDetails.orderId 
  ? `${typeof window !== 'undefined' ? window.location.origin : 'https://yourwebsite.com'}/order/${orderDetails.orderId}/start-processing`
  : "Link will be available in EmailJS template"}
    `.trim();

    // For mailto fallback, use comma-separated list
    const mailtoEmails = emailsToSend.join(",");
    const mailtoLink = `mailto:${mailtoEmails}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    const link = document.createElement("a");
    link.href = mailtoLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Email notification prepared (mailto fallback)");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

/**
 * Sends order confirmation email to customer
 */
export const sendOrderConfirmationToCustomer = async (
  orderDetails: OrderDetails,
  trackingUrl: string
): Promise<boolean> => {
  if (!orderDetails.email) {
    return false;
  }

  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    if (serviceId && templateId && publicKey) {
      emailjs.init(publicKey);

      const productsList = orderDetails.products
        .map((item) => {
          const variantText = item.variant ? ` (${item.variant})` : "";
          return `${item.name}${variantText} x ${item.quantity}`;
        })
        .join("\n");

      const templateParams = {
        to_email: orderDetails.email,
        customer_name: orderDetails.customerName,
        order_number: orderDetails.orderNumber || "N/A",
        products: productsList,
        total_amount: `GH₵${orderDetails.totalAmount.toFixed(2)}`,
        tracking_url: trackingUrl,
        order_date: new Date().toLocaleString("en-GB", {
          dateStyle: "full",
          timeStyle: "long",
        }),
      };

      await emailjs.send(serviceId, templateId, templateParams);
      return true;
    }

    // Fallback: Use mailto for customer confirmation
    const emailSubject = `✅ Your Order #${orderDetails.orderNumber} is Now Processing!`;
    const emailBody = `
✅ ORDER PROCESSING STARTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${orderDetails.customerName},

Great news! We've started processing your order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderDetails.orderNumber || "N/A"}
Status: Processing
Expected Delivery: 1-3 days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTS ORDERED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${orderDetails.products.map(item => {
  const variantText = item.variant ? ` (${item.variant})` : "";
  return `${item.name}${variantText} x ${item.quantity}`;
}).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL AMOUNT: GH₵${orderDetails.totalAmount.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track your order: ${trackingUrl}

Thank you for your order!
    `.trim();

    const mailtoLink = `mailto:${orderDetails.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const link = document.createElement("a");
    link.href = mailtoLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Error sending customer confirmation:", error);
  }

  return false;
};
