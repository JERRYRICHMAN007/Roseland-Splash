import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import {
  getGeneralWishlistItems,
  removeFromGeneralWishlist,
  type GeneralWishlistItem,
} from "@/services/generalWishlistService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface GeneralWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemRemoved?: () => void;
}

const GeneralWishlistModal = ({
  isOpen,
  onClose,
  onItemRemoved,
}: GeneralWishlistModalProps) => {
  const [wishlistItems, setWishlistItems] = useState<GeneralWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadWishlistItems();
    } else if (isOpen && !isAuthenticated) {
      setWishlistItems([]);
      setIsLoading(false);
    }
  }, [isOpen, isAuthenticated]);

  const loadWishlistItems = async () => {
    setIsLoading(true);
    try {
      const result = await getGeneralWishlistItems();
      if (result.success) {
        setWishlistItems(result.data || []);
      } else {
        toast({
          title: "Error loading wishlist",
          description: result.error || "Failed to load wishlist items.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load wishlist items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setIsDeleting(itemId);
    try {
      const result = await removeFromGeneralWishlist(itemId);
      if (result.success) {
        toast({
          title: "Item removed",
          description: "The item has been removed from your wishlist.",
        });
        setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
        onItemRemoved?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete item.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddToCart = (item: GeneralWishlistItem) => {
    const cartItemId = item.product_variant
      ? `${item.product_id}-${item.product_variant}`
      : item.product_id.toString();

    addItem({
      id: cartItemId,
      name: item.product_name,
      price: item.product_price,
      image: item.product_image,
      variant: item.product_variant || undefined,
    });

    toast({
      title: "Added to Cart",
      description: `${item.product_name}${
        item.product_variant ? ` (${item.product_variant})` : ""
      } has been added to your cart`,
      duration: 2000,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
              My Wishlist
            </h3>
            <p className="text-sm text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center min-h-0">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12 w-full min-h-[300px]">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4 text-center">
                Please log in to view your wishlist.
              </p>
              <Button onClick={() => {
                onClose();
                navigate("/login");
              }}>
                Log In
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 w-full min-h-[300px]">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Your wishlist is empty. Start adding products you love!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="aspect-square rounded-lg overflow-hidden bg-accent/20">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                          {item.product_name}
                        </h4>
                        {item.product_variant && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {item.product_variant}
                          </p>
                        )}
                        <p className="font-bold text-primary">
                          GH₵{item.product_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting === item.id}
                        >
                          {isDeleting === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralWishlistModal;

