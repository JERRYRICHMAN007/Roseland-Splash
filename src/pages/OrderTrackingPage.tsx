import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders, OrderStatus } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package, Truck, XCircle, Truck as DeliveringIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!orderId) return;

    await updateOrderStatus(orderId, newStatus);
    setOrder({ ...order, status: newStatus });

    toast({
      title: "Status Updated",
      description: `Order status updated to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
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
    }
  };

  const getStatusSteps = () => {
    const steps = [
      {
        status: "processing" as OrderStatus,
        label: "Processing",
        description: "Your order is being prepared",
        icon: Clock,
        completed: true, // Always completed (starting state)
      },
      {
        status: "delivering" as OrderStatus,
        label: "Out for Delivery",
        description: "Your order is on its way",
        icon: Truck,
        completed: order.status === "delivering" || order.status === "delivered",
      },
      {
        status: "delivered" as OrderStatus,
        label: "Delivered",
        description: "Order successfully delivered",
        icon: CheckCircle,
        completed: order.status === "delivered",
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
              <div className="space-y-6">
                {getStatusSteps().map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.completed;
                  const isCurrent = 
                    (step.status === "processing" && order.status === "processing") ||
                    (step.status === "delivering" && order.status === "delivering") ||
                    (step.status === "delivered" && order.status === "delivered");

                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive
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
                                isActive ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                          {isCurrent && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        {step.status === "delivered" && order.status === "delivered" && (
                          <div className="mt-3">
                            <p className="text-sm text-green-700 font-medium">
                              ✅ Order successfully delivered!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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

