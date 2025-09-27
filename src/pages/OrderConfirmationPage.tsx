import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Truck, Clock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  // Generate a mock order ID
  const orderId = `RS${Date.now().toString().slice(-6)}`;

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
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Thank you for your order. We've received your request and are
              preparing your fresh groceries.
            </p>
          </div>

          {/* Order Details */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-left">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-bold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estimated Delivery:
                </span>
                <span className="font-medium">30-60 minutes</span>
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
            <Button
              variant="outline"
              onClick={() => navigate("/track-order")}
              size="lg"
              className="px-8"
            >
              Track Your Order
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
