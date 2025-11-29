import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Truck, Clock, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder } = useOrders();

  const order = orderId ? getOrder(orderId) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto bg-green-light/20 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-medium" size={48} />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-green-medium">
              Order Confirmed!
            </h1>

            {/* PROMINENT Processing Status Banner */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-4 border-yellow-600 rounded-xl p-6 max-w-lg mx-auto shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-3">
                  <Clock className="text-yellow-600" size={32} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-yellow-900 text-2xl mb-1">
                    ⏳ PROCESSING
                  </p>
                  <p className="font-bold text-yellow-900 text-base">
                    Your order is pending confirmation
                  </p>
                  <p className="text-yellow-800 text-sm mt-1">
                    Expected delivery: 1-3 days
                  </p>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="font-bold text-blue-900 text-lg">
                    📧 You'll receive an email when we start processing
                  </p>
                  <p className="text-blue-700 text-sm">
                    Current Status:{" "}
                    <span className="font-bold">PENDING PROCESSING</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Thank you for your order! We've received your request and will
              begin processing shortly.
            </p>
          </div>

          {/* Order Details */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-left">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-mono font-bold">
                  {order?.orderNumber || "N/A"}
                </span>
              </div>
              {order && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm uppercase">
                    {order.status === "processing"
                      ? "⏳ PENDING PROCESSING"
                      : order.status.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estimated Delivery:
                </span>
                <span className="font-medium">1-3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Method:</span>
                <span className="font-medium">Yango Delivery</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-left flex items-center gap-2">
                <Truck className="text-primary" size={20} />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    We're preparing your items for delivery
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Driver Assignment</p>
                  <p className="text-sm text-muted-foreground">
                    A Yango driver will be assigned to your order
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Out for Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Your order is on its way to you
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Phone size={16} className="text-primary" />
                <span>Need help? Call us at</span>
                <span className="font-medium">+233 XX XXX XXXX</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/")} size="lg" className="px-8">
              Continue Shopping
            </Button>
            {orderId && (
              <Button
                variant="outline"
                onClick={() => navigate(`/track-order/${orderId}`)}
                size="lg"
                className="px-8"
              >
                Track Your Order
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
