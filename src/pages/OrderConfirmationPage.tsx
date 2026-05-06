import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Truck, Clock, Phone, Loader2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useOrders, type Order, type OrderStatus } from "@/contexts/OrderContext";
import { getOrder as fetchOrderFromDb } from "@/services/databaseService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function statusConfirmationLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending — awaiting payment";
    case "paid":
      return "Paid — we’ll prepare your order soon";
    case "processing":
      return "Processing";
    case "delivering":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status.toUpperCase();
  }
}

function formatMoney(value: number): string {
  return `GH₵${value.toFixed(2)}`;
}

/** Match checkout: free delivery when cart subtotal ≥ 100, else flat 15 */
function computeTotals(order: Order) {
  const subtotal = order.products.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );
  const deliveryFromParts =
    subtotal >= 100 ? 0 : Math.max(0, order.totalAmount - subtotal);
  const deliveryFee = Number(deliveryFromParts.toFixed(2));
  return { subtotal, deliveryFee };
}

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useOrders();

  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const orderFromContext = orderId
    ? orders.find((o) => o.id === orderId)
    : undefined;
  const order = orderFromContext ?? remoteOrder ?? null;

  const summary = useMemo(
    () => (order ? computeTotals(order) : null),
    [order]
  );

  useEffect(() => {
    if (!orderId) return;

    if (orders.some((o) => o.id === orderId)) {
      setRemoteOrder(null);
      setFetchFailed(false);
      return;
    }

    let cancelled = false;
    setFetching(true);
    setFetchFailed(false);

    fetchOrderFromDb(orderId)
      .then((o) => {
        if (cancelled) return;
        if (o) {
          setRemoteOrder(o);
          setFetchFailed(false);
        } else {
          setRemoteOrder(null);
          setFetchFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, orders]);

  const showSuccessChrome = Boolean(order);
  const showFailureChrome = !fetching && fetchFailed && !order;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {showFailureChrome ? (
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Order received
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                We could not load your order details. If you placed an order,
                check your email for confirmation or sign in to view your orders.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg" variant="default">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/orders">My orders</Link>
                </Button>
              </div>
            </div>
          ) : showSuccessChrome ? (
            <>
              <div className="w-20 h-20 mx-auto bg-green-light/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-medium" size={48} />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-green-medium">
                  Order Confirmed!
                </h1>

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
            </>
          ) : null}

          <Card className="bg-card/50 backdrop-blur-sm text-left">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fetching && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading order…
                </div>
              )}
              {!fetching && fetchFailed && !order && (
                <p className="text-center text-muted-foreground py-4">
                  We couldn't load this order. Sign in to the account you used
                  at checkout, or open this page from your confirmation link
                  again.
                </p>
              )}
              {order && (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-mono font-bold text-right">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm shrink-0">
                      {statusConfirmationLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Estimated Delivery:
                    </span>
                    <span className="font-medium">1-3 days</span>
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium text-right">
                        {order.paymentMethod}
                      </span>
                    </div>
                  )}
                  {order.deliveryMethod && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Delivery Method:
                      </span>
                      <span className="font-medium text-right">
                        {order.deliveryMethod}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div>
                    <p className="font-semibold mb-3">Items</p>
                    <ul className="space-y-3">
                      {order.products.map((item, idx) => (
                        <li
                          key={`${item.name}-${item.variant ?? "default"}-${idx}`}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="text-left">
                            <span className="font-medium">{item.name}</span>
                            {item.variant ? (
                              <span className="text-muted-foreground">
                                {" "}
                                ({item.variant})
                              </span>
                            ) : null}
                            <span className="block text-muted-foreground">
                              × {item.quantity} @ {formatMoney(item.price)}
                            </span>
                          </span>
                          <span className="font-medium shrink-0 tabular-nums">
                            {formatMoney(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {summary && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span className="tabular-nums">
                            {formatMoney(summary.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Delivery
                          </span>
                          <span className="tabular-nums">
                            {summary.deliveryFee === 0
                              ? "Free"
                              : formatMoney(summary.deliveryFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-semibold pt-1 border-t">
                          <span>Total</span>
                          <span className="tabular-nums">
                            {formatMoney(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

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
                    A driver will be assigned to your order
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

          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Phone size={16} className="text-primary" />
                <span>Need help? Call us at</span>
                <span className="font-medium">+233 XX XXX XXXX</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/")} size="lg" className="px-8">
              Continue Shopping
            </Button>
            {orderId && order && (
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
