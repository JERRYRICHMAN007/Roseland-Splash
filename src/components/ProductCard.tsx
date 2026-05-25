import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus, Minus, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistCount } from "@/contexts/WishlistCountContext";
import {
  addToGeneralWishlist,
  isProductInWishlist,
  removeFromGeneralWishlistByProduct,
} from "@/services/generalWishlistService";
import { cn } from "@/lib/utils";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
  image: string;
  bundleQuantity?: number;
  bundlePrice?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  ingredients?: string;
  inStock: boolean;
  variants?: ProductVariant[];
  bundleQuantity?: number;
  bundlePrice?: number;
}

interface ProductCardProps {
  product: Product;
  /** Compact horizontal layout for search list view */
  display?: "grid" | "list";
}

const ProductCard = ({ product, display = "grid" }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants?.[0]?.id || "default"
  );
  const [bundleQty, setBundleQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addItemToCache, removeItemFromCacheByProduct, refreshItems } =
    useWishlistCount();

  const getCurrentVariant = () => {
    if (!product.variants || selectedVariant === "default") {
      return {
        name: "Standard",
        price: product.price,
        unit: product.unit,
        image: product.image,
        inStock: product.inStock,
        bundleQuantity: product.bundleQuantity,
        bundlePrice: product.bundlePrice,
      };
    }
    return (
      product.variants.find((v) => v.id === selectedVariant) ||
      product.variants[0]
    );
  };

  const currentVariant = getCurrentVariant();
  const hasBundle =
    (currentVariant as { bundleQuantity?: number; bundlePrice?: number })
      .bundleQuantity != null &&
    (currentVariant as { bundlePrice?: number }).bundlePrice != null;
  const bundleQuantity = (currentVariant as { bundleQuantity?: number }).bundleQuantity ?? 0;
  const bundlePrice = (currentVariant as { bundlePrice?: number }).bundlePrice ?? 0;

  // Check if product is in wishlist when component mounts or variant changes
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
    }
  }, [isAuthenticated, selectedVariant, product.id]);

  const checkWishlistStatus = async () => {
    if (!isAuthenticated) return;

    setIsWishlistLoading(true);
    try {
      const variantName = product.variants ? currentVariant.name : undefined;
      const result = await isProductInWishlist(
        product.id,
        variantName !== "Standard" ? variantName : undefined
      );
      if (result.success) {
        setIsInWishlist(result.isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsWishlistLoading(true);
    const variantName = product.variants ? currentVariant.name : undefined;
    const variant = variantName !== "Standard" ? variantName : undefined;

    try {

      if (isInWishlist) {
        removeItemFromCacheByProduct(product.id, variant);
        const result = await removeFromGeneralWishlistByProduct(
          product.id,
          variant
        );
        if (result.success) {
          setIsInWishlist(false);
          toast({
            title: "Removed from Wishlist",
            description: `${product.name}${
              variant ? ` (${variant})` : ""
            } has been removed from your wishlist`,
            duration: 2000,
          });
        } else {
          void refreshItems({ silent: true });
          toast({
            title: "Error",
            description: result.error || "Failed to remove from wishlist",
            variant: "destructive",
          });
        }
      } else {
        const pendingId = `pending-${product.id}-${variant ?? "default"}`;
        addItemToCache({
          id: pendingId,
          user_id: null,
          product_id: product.id,
          product_name: product.name,
          product_price: currentVariant.price,
          product_image: currentVariant.image,
          product_variant: variant ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const result = await addToGeneralWishlist(
          product.id,
          product.name,
          currentVariant.price,
          currentVariant.image,
          variant
        );

        if (result.success) {
          setIsInWishlist(true);
          removeItemFromCacheByProduct(product.id, variant);
          if (result.data) {
            addItemToCache(result.data);
          } else {
            void refreshItems({ silent: true });
          }
          toast({
            title: "Added to Wishlist",
            description: `${product.name}${
              variant ? ` (${variant})` : ""
            } has been added to your wishlist`,
            duration: 2000,
          });
        } else {
          removeItemFromCacheByProduct(product.id, variant);
          toast({
            title: "Error",
            description: result.error || "Failed to add to wishlist",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      void refreshItems({ silent: true });
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cartItemId = product.variants
      ? `${product.id}-${currentVariant.name}`
      : product.id.toString();

    if (hasBundle) {
      addItem({
        id: cartItemId,
        name: product.name,
        price: bundlePrice,
        image: currentVariant.image,
        variant: product.variants ? currentVariant.name : undefined,
        quantity: bundleQty,
        bundleQuantity,
      });
      toast({
        title: "Added to Cart",
        description: `${bundleQty} × (${bundleQuantity} for GH₵${bundlePrice.toFixed(2)}) ${product.name} added`,
        duration: 2000,
      });
    } else {
      addItem({
        id: cartItemId,
        name: product.name,
        price: currentVariant.price,
        image: currentVariant.image,
        variant: product.variants ? currentVariant.name : undefined,
      });
      toast({
        title: "Added to Cart",
        description: `${product.name}${
          product.variants ? ` (${currentVariant.name})` : ""
        } has been added to your cart`,
        duration: 2000,
      });
    }
  };

  const isOutOfStock = !currentVariant.inStock || !product.inStock;
  const isList = display === "list";

  return (
    <Card
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] touch-manipulation",
        isList &&
          "h-auto hover:translate-y-0 sm:hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
      )}
    >
      <CardContent
        className={cn(
          "flex h-full flex-1 flex-col p-0",
          isList && "sm:flex-row sm:items-stretch"
        )}
      >
        {/* Image area */}
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100",
            isList
              ? "mx-auto aspect-square w-full max-w-[11rem] shrink-0 sm:mx-0 sm:h-32 sm:w-32 sm:max-w-none sm:aspect-auto md:h-36 md:w-36"
              : "aspect-square w-full"
          )}
        >
          <img
            src={currentVariant.image}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full transition-transform duration-500 group-hover:scale-105",
              isList ? "object-contain p-2" : "object-cover"
            )}
          />

          {/* Wishlist Button - glass */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:shadow-md disabled:opacity-60"
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div
          className={cn(
            "flex flex-1 flex-col gap-2 p-3.5",
            isList && "min-w-0 sm:justify-between sm:py-4 sm:pl-0 sm:pr-4"
          )}
        >
          {/* Name */}
          <h3
            className={cn(
              "line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary",
              isList ? "min-h-0" : "min-h-[2.5rem]"
            )}
          >
            {product.name}
          </h3>

          {/* Description (only when product has no variants and has description) */}
          {!product.variants && product.description && (
            <p className="line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Ingredients (distinct from description) */}
          {!product.variants && product.ingredients && (
            <div className="rounded-md border border-primary/15 bg-primary/5 px-2 py-1.5">
              <p className="text-xs font-semibold text-primary">Ingredients:</p>
              <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-foreground/80">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Variant selector */}
          {product.variants && product.variants.length > 1 && (
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="h-8 w-full rounded-lg border-border/60 bg-muted/50 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem
                    key={variant.id}
                    value={variant.id}
                    className="text-xs"
                  >
                    {variant.name} - GH₵{variant.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Price row */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-2">
            {hasBundle ? (
              <>
                <span className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {bundleQuantity} for GH₵{bundlePrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentVariant.unit}
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">
                  GH₵{currentVariant.price.toFixed(2)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {product.variants ? currentVariant.name : currentVariant.unit}
                </span>
              </>
            )}
          </div>

          {/* Bundle quantity stepper */}
          {hasBundle && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Bundle{bundleQty !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBundleQty((q) => Math.max(1, q - 1));
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-white text-foreground transition hover:bg-muted"
                  aria-label="Decrease bundles"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                  {bundleQty}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBundleQty((q) => q + 1);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-white text-foreground transition hover:bg-muted"
                  aria-label="Increase bundles"
                >
                  <Plus size={12} />
                </button>
                <span className="ml-1 text-xs font-semibold text-primary tabular-nums">
                  GH₵{(bundlePrice * bundleQty).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={
              isOutOfStock
                ? "mt-2 flex h-9 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted text-sm font-semibold text-muted-foreground shadow-none hover:bg-muted hover:shadow-none"
                : "mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-green-medium text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-primary-hover hover:to-primary hover:shadow-md"
            }
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
