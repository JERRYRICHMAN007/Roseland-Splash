import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, OrderStatus } from "@/contexts/OrderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, Package, CheckCircle, Truck, ArrowRight, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";

const MyOrdersPage = () => {
  const { user } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Get orders for logged-in user (excluding cancelled orders which are already removed)
  const myOrders = orders.filter(
    (order) => order.customerPhone === user?.phone || order.customerEmail === user?.email
  );

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    setCancellingOrderId(orderId);
    const success = cancelOrder(orderId);
    
    if (success) {
      toast({
        title: "Order Cancelled",
        description: `Order #${orderNumber} has been cancelled and removed.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Cannot Cancel Order",
        description: "This order cannot be cancelled. Only pending orders can be cancelled.",
        variant: "destructive",
      });
    }
    setCancellingOrderId(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1" size={12} />
            Processing
          </Badge>
        );
      case "delivering":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Truck className="mr-1" size={12} />
            Out for Delivery
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1" size={12} />
            Delivered
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return <Clock className="text-yellow-600" size={20} />;
      case "delivering":
        return <Truck className="text-blue-600" size={20} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "We're preparing your order";
      case "delivering":
        return "Your order is on its way";
      case "delivered":
        return "Order successfully delivered";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your orders
              </p>
            </div>

            {/* Orders List */}
            {myOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-16">
                  <Package className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Button onClick={() => navigate("/")} size="lg">
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">
                                  Order #{order.orderNumber}
                                </h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getStatusMessage(order.status)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Placed:</span>{" "}
                              <span className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                  dateStyle: "medium",
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Items:</span>{" "}
                              <span className="font-medium">
                                {order.products.length} item(s)
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>{" "}
                              <span className="font-bold text-lg">
                                GH₵{order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Delivery:</span>{" "}
                              <span className="font-medium">{order.location}</span>
                            </div>
                          </div>

                          {/* Products Preview */}
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Products:</p>
                            <div className="flex flex-wrap gap-2">
                              {order.products.slice(0, 3).map((product, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-accent px-2 py-1 rounded"
                                >
                                  {product.name} x{product.quantity}
                                </span>
                              ))}
                              {order.products.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{order.products.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[150px]">
                          <Button
                            onClick={() => navigate(`/track-order/${order.id}`)}
                            className="w-full"
                            variant="outline"
                          >
                            View Details
                            <ArrowRight className="ml-2" size={16} />
                          </Button>
                          {order.status === "processing" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  disabled={cancellingOrderId === order.id}
                                >
                                  <X className="mr-2" size={16} />
                                  Cancel Order
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel order #{order.orderNumber}? 
                                    This action cannot be undone. The order will be removed from your orders list.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default MyOrdersPage;

