/**
 * Professional Email Service for Rollsland & Splash
 * Branded email templates with all order information
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
  paymentStatus?: string;
}

/**
 * Creates professional HTML email template for owner (Rollsland & Splash)
 */
export const createOwnerEmailHTML = (orderDetails: OrderDetails): string => {
  const productsHTML = orderDetails.products
    .map((item) => {
      const variantText = item.variant ? ` <span style="color: #666;">(${item.variant})</span>` : "";
      const itemTotal = (item.price * item.quantity).toFixed(2);
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <strong>${item.name}${variantText}</strong>
            <div style="color: #666; font-size: 14px; margin-top: 4px;">
              Quantity: ${item.quantity} × GH₵${item.price.toFixed(2)}
            </div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
            GH₵${itemTotal}
          </td>
        </tr>
      `;
    })
    .join("");

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const startProcessingUrl = orderDetails.orderId 
    ? `${baseUrl}/order/${orderDetails.orderId}/start-processing`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - Rollsland & Splash</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🛒 Rollsland & Splash
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                New Order Received
              </p>
            </td>
          </tr>

          <!-- Order Number Banner -->
          <tr>
            <td style="background-color: #fff3cd; padding: 20px; text-align: center; border-left: 4px solid #25D366;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #856404;">
                Order #${orderDetails.orderNumber || "N/A"}
              </p>
              <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">
                ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" })}
              </p>
            </td>
          </tr>

          <!-- Action Required Alert -->
          <tr>
            <td style="padding: 20px 30px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #856404;">
                ⚠️ ACTION REQUIRED
              </p>
              <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                Click the button below to start processing this order. The customer will receive a confirmation email once you start processing.
              </p>
              ${startProcessingUrl ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${startProcessingUrl}" style="display: inline-block; padding: 14px 28px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  ✅ START PROCESSING ORDER
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #25D366; border-bottom: 2px solid #25D366; padding-bottom: 10px;">
                Customer Information
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Name:</strong> ${orderDetails.customerName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Phone:</strong> ${orderDetails.customerPhone}
                  </td>
                </tr>
                ${orderDetails.email ? `
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Email:</strong> ${orderDetails.email}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Products Ordered -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #25D366; border-bottom: 2px solid #25D366; padding-bottom: 10px;">
                Products Ordered
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 6px; padding: 15px;">
                ${productsHTML}
              </table>
            </td>
          </tr>

          <!-- Delivery Information -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #25D366; border-bottom: 2px solid #25D366; padding-bottom: 10px;">
                Delivery Information
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Location:</strong> ${orderDetails.location}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Delivery Method:</strong> ${orderDetails.deliveryMethod}
                  </td>
                </tr>
                ${orderDetails.specialInstructions ? `
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Special Instructions:</strong> ${orderDetails.specialInstructions}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #25D366; border-bottom: 2px solid #25D366; padding-bottom: 10px;">
                Order Summary
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9f4; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Subtotal:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">
                    GH₵${(orderDetails.totalAmount - (orderDetails.totalAmount >= 100 ? 0 : 15)).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Delivery Fee:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">
                    ${orderDetails.totalAmount >= 100 ? "Free" : "GH₵15.00"}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 15px 0 0 0; border-top: 2px solid #25D366;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #25D366;">
                          Total Amount:
                        </td>
                        <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #25D366;">
                          GH₵${orderDetails.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; color: #333;">
                    <strong>Payment Method:</strong> ${orderDetails.paymentMethod}
                  </td>
                  <td style="padding: 12px 0 0 0; text-align: right; color: #666; font-size: 14px;">
                    ${orderDetails.paymentStatus || "Pending"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                This is an automated email from <strong>Rollsland & Splash</strong><br>
                ${orderDetails.trackingUrl ? `<a href="${orderDetails.trackingUrl}" style="color: #25D366;">Track this order</a>` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Creates professional HTML email template for customer
 */
export const createCustomerEmailHTML = (orderDetails: OrderDetails, status: string = "Processing"): string => {
  const productsHTML = orderDetails.products
    .map((item) => {
      const variantText = item.variant ? ` <span style="color: #666;">(${item.variant})</span>` : "";
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong>${item.name}${variantText}</strong>
            <div style="color: #666; font-size: 14px; margin-top: 4px;">
              Quantity: ${item.quantity}
            </div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
            GH₵${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const statusColor = 
    status === "Processing" ? "#ffc107" :
    status === "Delivering" ? "#0dcaf0" :
    status === "Delivered" ? "#25D366" : "#6c757d";

  const statusText = 
    status === "Processing" ? "⏳ Processing" :
    status === "Delivering" ? "🚚 Out for Delivery" :
    status === "Delivered" ? "✅ Delivered" : status;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Rollsland & Splash</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🛒 Rollsland & Splash
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Order Confirmation
              </p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #333;">
                Thank You, ${orderDetails.customerName}!
              </h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                Your order has been confirmed and we're preparing it for you.
              </p>
            </td>
          </tr>

          <!-- Order Status -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: ${statusColor}20; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 6px;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusColor};">
                  ${statusText}
                </p>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                  Order #${orderDetails.orderNumber || "N/A"}
                </p>
              </div>
            </td>
          </tr>

          <!-- Products Ordered -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #25D366;">
                Your Order
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 6px; padding: 15px;">
                ${productsHTML}
              </table>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9f4; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Total Amount:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #25D366;">
                    GH₵${orderDetails.totalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Payment Method:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #666;">
                    ${orderDetails.paymentMethod}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Delivery To:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #666;">
                    ${orderDetails.location}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;">
                    <strong>Expected Delivery:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #666;">
                    1-3 days
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order Button -->
          ${orderDetails.trackingUrl ? `
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="${orderDetails.trackingUrl}" style="display: inline-block; padding: 14px 28px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Track Your Order
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                We'll send you updates as your order is processed and shipped.<br>
                If you have any questions, please contact us.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                <strong>Rollsland & Splash</strong><br>
                Fresh groceries delivered to your door
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Sends professional branded email to owner
 */
export const sendProfessionalOrderEmail = async (
  orderDetails: OrderDetails,
  recipientEmail: string = "jerryrichman07@gmail.com"
): Promise<boolean> => {
  try {
    const htmlContent = createOwnerEmailHTML(orderDetails);
    const plainText = createPlainTextEmail(orderDetails);

    // Try EmailJS first
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    if (serviceId && templateId && publicKey) {
      try {
        emailjs.init(publicKey);
        await emailjs.send(serviceId, templateId, {
          to_email: recipientEmail,
          subject: `🛒 New Order #${orderDetails.orderNumber} - Rollsland & Splash`,
          html_content: htmlContent,
          plain_text: plainText,
          ...getEmailParams(orderDetails),
        });
        console.log("Professional email sent via EmailJS");
        return true;
      } catch (error) {
        console.error("EmailJS error:", error);
      }
    }

    // Fallback to FormSubmit with HTML
    try {
      const formSubmitUrl = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;
      const response = await fetch(formSubmitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: "Rollsland & Splash",
          subject: `🛒 New Order #${orderDetails.orderNumber} - ${orderDetails.customerName}`,
          message: plainText,
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

    // Final fallback
    return false;
  } catch (error) {
    console.error("Error sending professional email:", error);
    return false;
  }
};

/**
 * Sends professional branded email to customer
 */
export const sendProfessionalCustomerEmail = async (
  orderDetails: OrderDetails,
  status: string = "Processing"
): Promise<boolean> => {
  if (!orderDetails.email) return false;

  try {
    const htmlContent = createCustomerEmailHTML(orderDetails, status);
    const plainText = createPlainTextCustomerEmail(orderDetails, status);

    // Try EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER || "";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

    if (serviceId && templateId && publicKey) {
      try {
        emailjs.init(publicKey);
        await emailjs.send(serviceId, templateId, {
          to_email: orderDetails.email,
          subject: `✅ Your Order #${orderDetails.orderNumber} - Rollsland & Splash`,
          html_content: htmlContent,
          plain_text: plainText,
          customer_name: orderDetails.customerName,
          order_number: orderDetails.orderNumber,
          status: status,
          tracking_url: orderDetails.trackingUrl || "",
        });
        return true;
      } catch (error) {
        console.error("EmailJS error:", error);
      }
    }

    // Fallback
    return false;
  } catch (error) {
    console.error("Error sending customer email:", error);
    return false;
  }
};

// Helper functions
function createPlainTextEmail(orderDetails: OrderDetails): string {
  const productsList = orderDetails.products
    .map((item) => {
      const variantText = item.variant ? ` (${item.variant})` : "";
      return `${item.name}${variantText} x ${item.quantity} = GH₵${(item.price * item.quantity).toFixed(2)}`;
    })
    .join("\n");

  return `
ROLLSLAND & SPLASH - NEW ORDER RECEIVED

Order Number: ${orderDetails.orderNumber}
Date: ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" })}

CUSTOMER INFORMATION:
Name: ${orderDetails.customerName}
Phone: ${orderDetails.customerPhone}
Email: ${orderDetails.email || "Not provided"}

PRODUCTS ORDERED:
${productsList}

DELIVERY INFORMATION:
Location: ${orderDetails.location}
Delivery Method: ${orderDetails.deliveryMethod}

ORDER SUMMARY:
Total Amount: GH₵${orderDetails.totalAmount.toFixed(2)}
Payment Method: ${orderDetails.paymentMethod}
Payment Status: ${orderDetails.paymentStatus || "Pending"}

Track Order: ${orderDetails.trackingUrl || ""}
  `.trim();
}

function createPlainTextCustomerEmail(orderDetails: OrderDetails, status: string): string {
  const productsList = orderDetails.products
    .map((item) => {
      const variantText = item.variant ? ` (${item.variant})` : "";
      return `${item.name}${variantText} x ${item.quantity}`;
    })
    .join("\n");

  return `
Thank you for your order from Rollsland & Splash!

ORDER #${orderDetails.orderNumber}
Status: ${status}

PRODUCTS:
${productsList}

TOTAL: GH₵${orderDetails.totalAmount.toFixed(2)}

Track your order: ${orderDetails.trackingUrl || ""}

Thank you for choosing Rollsland & Splash!
  `.trim();
}

function getEmailParams(orderDetails: OrderDetails) {
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

  return {
    customer_name: orderDetails.customerName,
    customer_phone: orderDetails.customerPhone,
    customer_email: orderDetails.email || "Not provided",
    products: productsList,
    location: orderDetails.location,
    total_amount: `GH₵${orderDetails.totalAmount.toFixed(2)}`,
    payment_method: orderDetails.paymentMethod,
    delivery_method: orderDetails.deliveryMethod,
    order_number: orderDetails.orderNumber || "N/A",
    tracking_url: orderDetails.trackingUrl || "",
    start_processing_url: startProcessingUrl,
    order_date: new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" }),
  };
}

