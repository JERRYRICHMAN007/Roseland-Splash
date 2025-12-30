import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const CartPage = () => {
  const { items, total, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={48} className="text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 max-w-md mx-auto text-base">
              Looks like you haven't added any items to your cart yet. Start
              shopping to fill it up!
            </p>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="px-8 h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              Shopping Cart ({items.length} items)
            </h1>

            {items.map((item) => (
              <Card
                key={`${item.id}-${item.variant || "default"}`}
                className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-28 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {item.name}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.variant}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-300 hover:bg-gray-50"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-12 text-center font-semibold text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-300 hover:bg-gray-50"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">
                              GH₵{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              GH₵{item.price.toFixed(2)} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                            onClick={() => {
                              removeItem(item.id);
                              toast({
                                title: "Item Removed",
                                description: `${item.name} has been removed from your cart`,
                              });
                            }}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-white border border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-bold">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({items.length}{" "}
                      {items.length === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">GH₵{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-green-600">
                      {total >= 100 ? "Free" : "GH₵15.00"}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary">
                      GH₵{(total + (total >= 100 ? 0 : 15)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {total < 100 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      🎁 Add GH₵{(100 - total).toFixed(2)} more for{" "}
                      <strong>free delivery</strong>!
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 text-base shadow-md hover:shadow-lg transition-all"
                    size="lg"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 h-11"
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Free returns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
