import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders, type OrderStatus } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  Hourglass,
  Ban,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [order, setOrder] = useState(useOrders().getOrder(orderId || ""));

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrder(orderId);
      setOrder(foundOrder);
    }
  }, [orderId, getOrder]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <XCircle className="mx-auto text-muted-foreground mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find an order with that ID.
              </p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200">
            <Hourglass className="mr-1" size={14} />
            Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle className="mr-1" size={14} />
            Paid
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1" size={14} />
            Processing
          </Badge>
        );
      case "delivering":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Package className="mr-1" size={14} />
            Out for Delivery
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1" size={14} />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <Ban className="mr-1" size={14} />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  const getStatusSteps = () => {
    const s = order.status;
    const pm = (order.paymentMethod || "").toLowerCase();
    const likelyOnlinePayment =
      /momo|paystack|card|mobile|online/.test(pm) &&
      !/cash|cod|delivery\s*only/.test(pm);

    const steps = [
      {
        status: "pending" as OrderStatus,
        label: "Order placed",
        description: "We’ve received your order",
        icon: Hourglass,
        completed: s !== "pending" && s !== "cancelled",
        isCurrent: s === "pending",
      },
      {
        status: "paid" as OrderStatus,
        label: "Payment confirmed",
        description: "Your payment has been received",
        icon: CheckCircle,
        completed:
          s === "paid" ||
          s === "delivering" ||
          s === "delivered" ||
          (s === "processing" && likelyOnlinePayment),
        isCurrent: s === "paid",
      },
      {
        status: "processing" as OrderStatus,
        label: "Processing",
        description: "The store is preparing your order",
        icon: Clock,
        completed: s === "delivering" || s === "delivered",
        isCurrent: s === "processing",
      },
      {
        status: "delivering" as OrderStatus,
        label: "Out for delivery",
        description: "Your order is on the way",
        icon: Truck,
        completed: s === "delivered",
        isCurrent: s === "delivering",
      },
      {
        status: "delivered" as OrderStatus,
        label: "Delivered",
        description: "Order completed",
        icon: CheckCircle,
        completed: s === "delivered",
        isCurrent: s === "delivered",
      },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Tracking</h1>
              <p className="text-muted-foreground mt-1">
                Order #{order.orderNumber}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === "cancelled" ? (
                <p className="text-sm text-muted-foreground">
                  This order was cancelled. If you were charged, please contact support for a refund.
                </p>
              ) : (
                <div className="space-y-6">
                  {getStatusSteps().map((step) => {
                    const Icon = step.icon;
                    const highlight = step.completed || step.isCurrent;

                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            highlight
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={24} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-medium ${
                                  highlight ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                            {step.isCurrent && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>
                          {step.status === "delivered" && order.status === "delivered" && (
                            <div className="mt-3">
                              <p className="text-sm text-green-700 font-medium">
                                Order successfully delivered!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-mono font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold">GH₵{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Method:</span>
                  <span>{order.deliveryMethod}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{order.location}</p>
                </div>
                {order.specialInstructions && (
                  <div>
                    <span className="text-muted-foreground">Instructions:</span>
                    <p className="font-medium">{order.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.variant && (
                        <p className="text-sm text-muted-foreground">
                          {product.variant}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Quantity: {product.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      GH₵{(product.price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")} variant="outline">
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;

