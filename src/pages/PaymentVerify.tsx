import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import * as backendApi from "@/services/backendApi";

type VerifyState = "loading" | "success" | "failed";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    const runVerification = async () => {
      const ref = searchParams.get("reference");
      if (!ref) {
        setState("failed");
        setMessage("Missing payment reference. Please try checkout again.");
        return;
      }

      setReference(ref);
      const verifyRes = await backendApi.verifyPayment(ref);

      if (verifyRes.success) {
        setOrderId(verifyRes.data?.orderId || "");
        setState("success");
        setMessage("Payment successful. Your order has been confirmed.");
        return;
      }

      setState("failed");
      setMessage(verifyRes.error || verifyRes.data?.message || "Payment verification failed.");
    };

    runVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state === "loading" && (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p>{message}</p>
              </div>
            )}

            {state === "success" && (
              <div className="space-y-3">
                <p className="text-green-600 font-medium">{message}</p>
                {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
                {reference && <p><strong>Reference:</strong> {reference}</p>}
                <Button onClick={() => navigate("/my-orders")}>Go to Order History</Button>
              </div>
            )}

            {state === "failed" && (
              <div className="space-y-3">
                <p className="text-destructive font-medium">{message}</p>
                {reference && <p><strong>Reference:</strong> {reference}</p>}
                <Button variant="outline" onClick={() => navigate("/checkout")}>
                  Retry Checkout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentVerify;
