import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
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
import { sendProfessionalOrderEmail } from "@/services/professionalEmailService";
import * as backendApi from "@/services/backendApi";
import { buildOrderSpecialInstructions } from "@/services/databaseService";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";

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

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Enter a valid email address",
    }),
  phone: z.string().trim().min(1, "Phone number is required"),
  city: z.string().trim().min(1, "City is required"),
  area: z.string().trim().min(1, "Area is required"),
  address: z.string().trim().min(1, "Address is required"),
  instructions: z.string().trim().optional(),
  paymentMethod: z.enum(["mobile_money", "cash_on_delivery"]),
  deliveryMethod: z.enum(["yango", "store_pickup"]),
  deliveryTimePreset: z.string().min(1),
  customDeliveryTime: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: "Accra",
      area: "",
      address: "",
      instructions: "",
      paymentMethod: "mobile_money",
      deliveryMethod: "yango",
      deliveryTimePreset: "any",
      customDeliveryTime: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when user identity changes
  }, [user?.id]);

  const deliveryMethod = useWatch({ control: form.control, name: "deliveryMethod" });
  const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" });
  const deliveryTimePreset = useWatch({
    control: form.control,
    name: "deliveryTimePreset",
  });
  const customDeliveryTime =
    useWatch({ control: form.control, name: "customDeliveryTime" }) || "";

  const deliveryFee = total >= 100 ? 0 : 15;
  const finalTotal = total + deliveryFee;

  const onSubmit = async (values: CheckoutFormValues) => {
    let order: {
      id: string;
      orderNumber: string;
    } | null = null;

    try {
      const customerName = `${values.firstName} ${values.lastName}`.trim();
      const location = `${values.address}, ${values.area}, ${values.city}`.trim();
      const deliveryTimeWindow =
        values.deliveryMethod === "yango"
          ? getDeliveryTimeWindowLabel(
              values.deliveryTimePreset,
              values.customDeliveryTime || ""
            )
          : undefined;

      const ORDER_TIMEOUT_MS = 15000;
      const addOrderWithTimeout = Promise.race([
        addOrder({
          userId: user?.id ?? null,
          customerName,
          customerPhone: values.phone,
          customerEmail: values.email || undefined,
          products: items.map((item) => ({
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price,
          })),
          location,
          totalAmount: finalTotal,
          paymentMethod:
            values.paymentMethod === "mobile_money"
              ? "MoMo"
              : "Payment on Delivery",
          deliveryMethod:
            values.deliveryMethod === "yango" ? "Delivery" : "Store Pickup",
          deliveryTimeWindow,
          specialInstructions: values.instructions || undefined,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Order request timed out. Please check your connection and try again."
                )
              ),
            ORDER_TIMEOUT_MS
          )
        ),
      ]);
      order = await addOrderWithTimeout;

      const baseUrl = window.location.origin;
      const trackingUrl = `${baseUrl}/track-order/${order.id}`;

      const orderData = {
        customerName,
        customerPhone: values.phone,
        email: values.email || undefined,
        products: items.map((item) => ({
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
        })),
        location,
        totalAmount: finalTotal,
        paymentMethod:
          values.paymentMethod === "mobile_money"
            ? "MoMo"
            : "Payment on Delivery",
        deliveryMethod:
          values.deliveryMethod === "yango" ? "Delivery" : "Store Pickup",
        specialInstructions: buildOrderSpecialInstructions(
          deliveryTimeWindow,
          values.instructions || undefined
        ),
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingUrl,
      };

      if (values.deliveryMethod === "yango") {
        console.log("Yango delivery order:", {
          pickup_address: "Rollsland & Splash Store, Accra, Ghana",
          delivery_address: `${values.address}, ${values.area}, ${values.city}`,
          customer_phone: values.phone,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total_amount: finalTotal,
          special_instructions: buildOrderSpecialInstructions(
            deliveryTimeWindow,
            values.instructions || undefined
          ),
        });
      }

      if (values.paymentMethod === "mobile_money") {
        const initRes = await backendApi.initializePayment({
          email: values.email || "customer@rollslandsplash.com",
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

      sendProfessionalOrderEmail(orderData).catch(() => {});
      toast({
        title: "✅ Order Placed Successfully!",
        description: `Order #${order.orderNumber} - Status: ⏳ PENDING PROCESSING. The store will be notified.`,
        duration: 8000,
      });
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
      scrollToTopInstant();
    } catch (error) {
      console.error("Error sending order:", error);
      toast({
        title: "Order failed",
        description:
          error instanceof Error ? error.message : "Could not place order. Please try again.",
        variant: "destructive",
      });
      if (order) {
        navigate(`/order-confirmation/${order.id}`);
        scrollToTopInstant();
      } else {
        navigate("/cart");
        scrollToTopInstant();
      }
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      scrollToTopInstant();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+233 XX XXX XXXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={20} />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Accra">Accra</SelectItem>
                              <SelectItem value="Kumasi">Kumasi</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area/Neighborhood *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., East Legon, Osu, Labone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="House number, street name, and any landmarks"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {deliveryMethod === "yango" && (
                      <div>
                        <FormField
                          control={form.control}
                          name="deliveryTimePreset"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred delivery time</FormLabel>
                              <p className="text-sm text-muted-foreground mb-2">
                                When would you like your order delivered? We&apos;ll do our best to
                                match your window.
                              </p>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger id="deliveryTime">
                                    <SelectValue placeholder="Choose a time range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DELIVERY_TIME_PRESETS.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                      {p.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {deliveryTimePreset === "custom" && (
                          <FormField
                            control={form.control}
                            name="customDeliveryTime"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 3:30 PM - 5:00 PM"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Special instructions for the delivery driver"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck size={20} />
                      Delivery Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <RadioGroupItem value="yango" id="yango" />
                                <Label htmlFor="yango" className="flex-1 cursor-pointer">
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
                                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <RadioGroupItem value="mobile_money" id="mobile_money" />
                                <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
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
                                <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                                  <p className="font-medium">Payment on Delivery</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pay when your order arrives
                                  </p>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${item.variant || "default"}`}
                          className="flex justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.variant && (
                              <p className="text-muted-foreground">{item.variant}</p>
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
                          {deliveryFee === 0 ? "Free" : `GH₵${deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                      {deliveryMethod === "yango" && (
                        <div className="flex justify-between text-sm text-muted-foreground gap-2">
                          <span className="shrink-0">Delivery window</span>
                          <span className="text-right">
                            {getDeliveryTimeWindowLabel(
                              deliveryTimePreset || "any",
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
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
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
        </Form>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
