import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  const itemCount = wishlistItems.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Wishlist"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-lg overflow-hidden rounded-3xl bg-background shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0a2e1a] to-[#0d3d20] p-6 text-white">
          <div className="flex items-center gap-3 pr-10">
            <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold text-white">
                My Wishlist
              </h3>
              <p className="text-sm text-white/60">
                {itemCount} {itemCount === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
              <Heart className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-semibold text-foreground">
                Sign in to view your wishlist
              </h4>
              <p className="text-sm text-muted-foreground">
                Log in to save your favourite products and find them here later
              </p>
            </div>
            <Button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Log In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : itemCount === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
              <Heart className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-semibold text-foreground">
                Nothing saved yet
              </h4>
              <p className="text-sm text-muted-foreground">
                Tap the heart on any product to save it here
              </p>
            </div>
            <Button
              onClick={() => {
                onClose();
                navigate("/categories");
              }}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ul className="max-h-[60vh] divide-y divide-border/40 overflow-y-auto">
              {wishlistItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
                >
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 rounded-xl border border-border/40 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    {item.product_variant && (
                      <p className="text-xs text-muted-foreground">
                        {item.product_variant}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm font-bold text-primary">
                      GH₵{item.product_price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="hidden h-8 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white sm:inline-flex"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      aria-label="Add to cart"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white sm:hidden"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      aria-label="Remove from wishlist"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/[0.08] text-destructive transition-all hover:bg-destructive hover:text-white disabled:opacity-50"
                    >
                      {isDeleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 p-4">
              <span className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl border-border/60 text-xs font-medium"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneralWishlistModal;
