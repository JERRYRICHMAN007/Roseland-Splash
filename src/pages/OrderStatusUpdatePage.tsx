import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders, OrderStatus } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { sendOrderConfirmationToCustomer } from "@/services/emailService";
import { sendProfessionalCustomerEmail } from "@/services/professionalEmailService";

const OrderStatusUpdatePage = () => {
  const { orderId, action } = useParams<{ orderId: string; action: string }>();
  const { getOrder, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(getOrder(orderId || ""));
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrder(orderId);
      setOrder(foundOrder);
    }
  }, [orderId, getOrder]);

  useEffect(() => {
    if (order && action === "start-processing" && order.status === "processing") {
      handleStartProcessing();
    }
  }, [order, action]);

  const handleStartProcessing = async () => {
    if (!orderId || !order) return;

    setIsUpdating(true);
    
    try {
      // Update order status (stays as "processing" but we mark it as started)
      // In a real system, you might have a "processing_started" status
      // For now, we'll send customer confirmation email
      
      const baseUrl = window.location.origin;
      const trackingUrl = `${baseUrl}/track-order/${order.id}`;

      // Send professional confirmation email to customer
      await sendProfessionalCustomerEmail(
        {
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          email: order.customerEmail,
          products: order.products,
          location: order.location,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          specialInstructions: order.specialInstructions,
          orderNumber: order.orderNumber,
          orderId: order.id,
          trackingUrl: trackingUrl,
        },
        "Processing"
      );
      
      // Also send via old method as fallback
      await sendOrderConfirmationToCustomer(
        {
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          email: order.customerEmail,
          products: order.products,
          location: order.location,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          specialInstructions: order.specialInstructions,
          orderNumber: order.orderNumber,
        },
        trackingUrl
      );

      setSuccess(true);
      toast({
        title: "Order Processing Started!",
        description: "Customer has been notified via email.",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(`/track-order/${orderId}`);
      }, 3000);
    } catch (error) {
      console.error("Error starting processing:", error);
      toast({
        title: "Error",
        description: "Failed to start processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
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

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h2 className="text-2xl font-bold">Processing Started!</h2>
              <p className="text-muted-foreground">
                Order #{order.orderNumber} is now being processed.
              </p>
              <p className="text-sm text-muted-foreground">
                The customer has been notified via email.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to order details...
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Start Processing Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-yellow-600" size={20} />
                <p className="font-medium text-yellow-800">Order #{order.orderNumber}</p>
              </div>
              <p className="text-sm text-yellow-700">
                Click the button below to start processing this order. The customer will receive a confirmation email.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Customer: {order.customerName}</p>
              <p className="text-sm text-muted-foreground">Phone: {order.customerPhone}</p>
              <p className="text-sm text-muted-foreground">Total: GH₵{order.totalAmount.toFixed(2)}</p>
            </div>

            <Button
              onClick={handleStartProcessing}
              disabled={isUpdating}
              className="w-full"
              size="lg"
            >
              {isUpdating ? "Starting Processing..." : "Start Processing Order"}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatusUpdatePage;

