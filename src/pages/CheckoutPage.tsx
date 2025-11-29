import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Truck, Clock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { sendOrderToWhatsApp } from "@/services/whatsappService";
import { sendOrderViaEmail } from "@/services/emailService";
import { sendEmailSimple } from "@/services/simpleEmailService";
import { sendProfessionalOrderEmail } from "@/services/professionalEmailService";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-fill customer info from authenticated user
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Update customer info when user changes
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "Accra",
    area: "",
    instructions: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [deliveryMethod, setDeliveryMethod] = useState("yango");
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = total >= 100 ? 0 : 15;
  const finalTotal = total + deliveryFee;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create and save order
    try {
      const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();
      const location = `${deliveryInfo.address}, ${deliveryInfo.area}, ${deliveryInfo.city}`.trim();
      
      // Create order in the system
      const order = addOrder({
        customerName: customerName,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        products: items.map((item) => ({
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
        })),
        location: location,
        totalAmount: finalTotal,
        paymentMethod:
          paymentMethod === "mobile_money" ? "Mobile Money" : "Cash on Delivery",
        deliveryMethod:
          deliveryMethod === "yango" ? "Yango Delivery" : "Store Pickup",
        specialInstructions: deliveryInfo.instructions || undefined,
      });

      // Generate tracking URL
      const baseUrl = window.location.origin;
      const trackingUrl = `${baseUrl}/track-order/${order.id}`;

      // Prepare order data for email
      const orderData = {
        customerName: customerName,
        customerPhone: customerInfo.phone,
        email: customerInfo.email || undefined,
        products: items.map((item) => ({
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
        })),
        location: location,
        totalAmount: finalTotal,
        paymentMethod:
          paymentMethod === "mobile_money" ? "Mobile Money" : "Cash on Delivery",
        deliveryMethod:
          deliveryMethod === "yango" ? "Yango Delivery" : "Store Pickup",
        specialInstructions: deliveryInfo.instructions || undefined,
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingUrl: trackingUrl,
      };

      // Send professional branded email to owner (Rollsland & Splash)
      await sendProfessionalOrderEmail(orderData);
      // Fallback to simple email service
      await sendEmailSimple(orderData);
      // Also try EmailJS if configured
      await sendOrderViaEmail(orderData);
      
      // Integrate with Yango delivery API (mock implementation)
      if (deliveryMethod === "yango") {
        // Mock Yango API call
        const yangoOrder = {
          pickup_address: "Rollsland & Splash Store, Accra, Ghana",
          delivery_address: `${deliveryInfo.address}, ${deliveryInfo.area}, ${deliveryInfo.city}`,
          customer_phone: customerInfo.phone,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total_amount: finalTotal,
          special_instructions: deliveryInfo.instructions,
        };

        console.log("Yango delivery order:", yangoOrder);
      }

      toast({
        title: "✅ Order Placed Successfully!",
        description: `Order #${order.orderNumber} - Status: ⏳ PENDING PROCESSING. Email sent to owner.`,
        duration: 8000,
      });
    } catch (error) {
      console.error("Error sending order:", error);
      toast({
        title: "Order Placed",
        description:
          "Your order has been received. We'll contact you for delivery arrangements.",
      });
    }

    clearCart();
    navigate(`/order-confirmation/${order.id}`);
    setIsProcessing(false);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+233 XX XXX XXXX"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={deliveryInfo.city}
                      onValueChange={(value) =>
                        setDeliveryInfo({ ...deliveryInfo, city: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accra">Accra</SelectItem>
                        <SelectItem value="Kumasi">Kumasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area/Neighborhood *</Label>
                    <Input
                      id="area"
                      required
                      placeholder="e.g., East Legon, Osu, Labone"
                      value={deliveryInfo.area}
                      onChange={(e) =>
                        setDeliveryInfo({
                          ...deliveryInfo,
                          area: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Detailed Address *</Label>
                    <Textarea
                      id="address"
                      required
                      placeholder="House number, street name, and any landmarks"
                      value={deliveryInfo.address}
                      onChange={(e) =>
                        setDeliveryInfo({
                          ...deliveryInfo,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions">
                      Delivery Instructions (Optional)
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Special instructions for the delivery driver"
                      value={deliveryInfo.instructions}
                      onChange={(e) =>
                        setDeliveryInfo({
                          ...deliveryInfo,
                          instructions: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck size={20} />
                    Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="yango" id="yango" />
                      <Label htmlFor="yango" className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Yango Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Fast and reliable delivery service
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            30-60 mins
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                      <RadioGroupItem
                        value="store_pickup"
                        id="store_pickup"
                        disabled
                      />
                      <Label htmlFor="store_pickup" className="flex-1">
                        <div>
                          <p className="font-medium">Store Pickup</p>
                          <p className="text-sm text-muted-foreground">
                            Coming Soon
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="mobile_money" id="mobile_money" />
                      <Label htmlFor="mobile_money" className="flex-1">
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with MTN/Vodafone/AirtelTigo
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem
                        value="cash_on_delivery"
                        id="cash_on_delivery"
                      />
                      <Label htmlFor="cash_on_delivery" className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when your order arrives
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.variant || "default"}`}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          {item.variant && (
                            <p className="text-muted-foreground">
                              {item.variant}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          GH₵{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>GH₵{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0
                          ? "Free"
                          : `GH₵${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>GH₵{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing Order..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
