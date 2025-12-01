import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  addToGeneralWishlist,
  isProductInWishlist,
  removeFromGeneralWishlistByProduct,
} from "@/services/generalWishlistService";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants?.[0]?.id || "default"
  );
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const getCurrentVariant = () => {
    if (!product.variants || selectedVariant === "default") {
      return {
        name: "Standard",
        price: product.price,
        unit: product.unit,
        image: product.image,
      };
    }
    return (
      product.variants.find((v) => v.id === selectedVariant) ||
      product.variants[0]
    );
  };

  const currentVariant = getCurrentVariant();

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
    try {
      const variantName = product.variants ? currentVariant.name : undefined;
      const variant = variantName !== "Standard" ? variantName : undefined;

      if (isInWishlist) {
        // Remove from wishlist
        const result = await removeFromGeneralWishlistByProduct(product.id, variant);
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
          toast({
            title: "Error",
            description: result.error || "Failed to remove from wishlist",
            variant: "destructive",
          });
        }
      } else {
        // Add to wishlist
        const result = await addToGeneralWishlist(
          product.id,
          product.name,
          currentVariant.price,
          currentVariant.image,
          variant
        );

        if (result.success) {
          setIsInWishlist(true);
          toast({
            title: "Added to Wishlist",
            description: `${product.name}${
              variant ? ` (${variant})` : ""
            } has been added to your wishlist`,
            duration: 2000,
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add to wishlist",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
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
      duration: 2000, // 2 seconds instead of default 5 seconds
    });
  };

  return (
    <Card className="group hover:shadow-[var(--elevated-shadow)] transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 overflow-hidden touch-manipulation active:scale-95">
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-accent/20 p-2 sm:p-3">
          <img
            src={currentVariant.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
          />
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md hover:shadow-lg transition-all"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist ? "text-primary fill-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-1.5 sm:space-y-3">
          <h3 className="font-semibold text-xs sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] break-words">
            {product.name}
          </h3>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="h-9 sm:h-8 text-xs sm:text-sm bg-background/50 touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name} - GH₵{variant.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-lg sm:text-xl text-primary">
                GH₵{currentVariant.price.toFixed(2)}
              </span>
              <p className="text-xs text-muted-foreground">
                {product.variants ? currentVariant.name : currentVariant.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full group-hover:bg-primary-hover transition-all duration-300 font-medium rounded-lg shadow-sm hover:shadow-md touch-manipulation active:scale-95 h-10 sm:h-9"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
