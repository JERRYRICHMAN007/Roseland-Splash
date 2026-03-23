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
import { sendProfessionalOrderEmail } from "@/services/professionalEmailService";
import * as backendApi from "@/services/backendApi";
import { buildOrderSpecialInstructions } from "@/services/databaseService";

/** Customer-requested delivery time window (shown when Delivery is selected) */
const DELIVERY_TIME_PRESETS = [
  { value: "any", label: "Any time (flexible)" },
  { value: "morning", label: "Morning (8:00 AM – 12:00 PM)" },
  { value: "afternoon", label: "Afternoon (12:00 PM – 5:00 PM)" },
  { value: "evening", label: "Evening (5:00 PM – 8:30 PM)" },
  { value: "custom", label: "Custom time (type your own)" },
] as const;

function getDeliveryTimeWindowLabel(
  preset: string,
  customDeliveryTime: string
): string | undefined {
  if (preset === "any") return undefined;
  if (preset === "custom") {
    const typed = customDeliveryTime.trim();
    return typed ? `Custom: ${typed}` : undefined;
  }
  return DELIVERY_TIME_PRESETS.find((p) => p.value === preset)?.label;
}

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
  /** Preferred delivery time window when delivery is selected */
  const [deliveryTimePreset, setDeliveryTimePreset] = useState<string>("any");
  const [customDeliveryTime, setCustomDeliveryTime] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = total >= 100 ? 0 : 15;
  const finalTotal = total + deliveryFee;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // MoMo uses server-side Paystack (PAYSTACK_SECRET_KEY on API). Do not require
    // VITE_PAYSTACK_PUBLIC_KEY — that was only for old inline Paystack popup.

    let order: any = null;

    try {
      const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();
      const location = `${deliveryInfo.address}, ${deliveryInfo.area}, ${deliveryInfo.city}`.trim();
      const deliveryTimeWindow =
        deliveryMethod === "yango"
          ? getDeliveryTimeWindowLabel(deliveryTimePreset, customDeliveryTime)
          : undefined;

      // Create order (saves to database; appears in My Orders)
      // Timeout so we never hang forever if Supabase/network doesn't respond
      const ORDER_TIMEOUT_MS = 15000;
      const addOrderWithTimeout = Promise.race([
        addOrder({
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
            paymentMethod === "mobile_money" ? "MoMo" : "Payment on Delivery",
          deliveryMethod:
            deliveryMethod === "yango" ? "Delivery" : "Store Pickup",
          deliveryTimeWindow,
          specialInstructions: deliveryInfo.instructions || undefined,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Order request timed out. Please check your connection and try again.")), ORDER_TIMEOUT_MS)
        ),
      ]);
      order = await addOrderWithTimeout;

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
          paymentMethod === "mobile_money" ? "MoMo" : "Payment on Delivery",
        deliveryMethod:
          deliveryMethod === "yango" ? "Delivery" : "Store Pickup",
        specialInstructions: buildOrderSpecialInstructions(
          deliveryTimeWindow,
          deliveryInfo.instructions || undefined
        ),
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingUrl: trackingUrl,
      };

      // Integrate with delivery API (mock implementation)
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
          special_instructions: buildOrderSpecialInstructions(
            deliveryTimeWindow,
            deliveryInfo.instructions || undefined
          ),
        };

        console.log("Yango delivery order:", yangoOrder);
      }

      // If MoMo, initialize Paystack redirect payment on backend
      if (paymentMethod === "mobile_money") {
        const initRes = await backendApi.initializePayment({
          email: customerInfo.email || "customer@rollslandsplash.com",
          amount: finalTotal,
          orderId: order.id,
          cartItems: items.map((item) => ({
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price,
          })),
        });

        if (!initRes.success || !initRes.data?.authorization_url) {
          throw new Error(initRes.error || "Could not initialize payment.");
        }

        window.location.href = initRes.data.authorization_url;
        return;
      }

      // Payment on Delivery: order already created. Notify owner in background so email never blocks success.
      sendProfessionalOrderEmail(orderData).catch(() => {});
      toast({
        title: "✅ Order Placed Successfully!",
        description: `Order #${order.orderNumber} - Status: ⏳ PENDING PROCESSING. The store will be notified.`,
        duration: 8000,
      });
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Error sending order:", error);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Could not place order. Please try again.",
        variant: "destructive",
      });
      if (order) navigate(`/order-confirmation/${order.id}`);
      else navigate("/cart");
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
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
                  {deliveryMethod === "yango" && (
                    <div>
                      <Label htmlFor="deliveryTime">
                        Preferred delivery time
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        When would you like your order delivered? We&apos;ll do our best to match your window.
                      </p>
                      <Select
                        value={deliveryTimePreset}
                        onValueChange={setDeliveryTimePreset}
                      >
                        <SelectTrigger id="deliveryTime">
                          <SelectValue placeholder="Choose a time range" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TIME_PRESETS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {deliveryTimePreset === "custom" && (
                        <Input
                          className="mt-2"
                          placeholder="e.g., 3:30 PM - 5:00 PM"
                          value={customDeliveryTime}
                          onChange={(e) => setCustomDeliveryTime(e.target.value)}
                        />
                      )}
                    </div>
                  )}
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
                            <p className="font-medium">Delivery</p>
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
                        <p className="font-medium">MoMo</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with MTN / Vodafone / AirtelTigo
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem
                        value="cash_on_delivery"
                        id="cash_on_delivery"
                      />
                      <Label htmlFor="cash_on_delivery" className="flex-1">
                        <p className="font-medium">Payment on Delivery</p>
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
                            {item.bundleQuantity
                              ? ` (${item.bundleQuantity} for GH₵${item.price.toFixed(2)})`
                              : ""}
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
                    {deliveryMethod === "yango" && (
                      <div className="flex justify-between text-sm text-muted-foreground gap-2">
                        <span className="shrink-0">Delivery window</span>
                        <span className="text-right">
                          {getDeliveryTimeWindowLabel(
                            deliveryTimePreset,
                            customDeliveryTime
                          ) ?? "—"}
                        </span>
                      </div>
                    )}
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
                    {isProcessing
                      ? "Initializing Payment..."
                      : paymentMethod === "mobile_money"
                        ? "Pay Now"
                        : "Place Order"}
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
