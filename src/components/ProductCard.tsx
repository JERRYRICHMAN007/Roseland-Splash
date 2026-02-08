import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        inStock: product.inStock,
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

  const isOutOfStock = !currentVariant.inStock || !product.inStock;

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:border-primary/30 bg-white border border-gray-200 overflow-hidden touch-manipulation active:scale-[0.98] h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Product Image Container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <div className="w-full h-full bg-white flex items-center justify-center relative">
            <img
              src={currentVariant.image}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Stock Badge */}
            {isOutOfStock && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="destructive" className="text-xs font-semibold">
                  Out of Stock
                </Badge>
              </div>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading}
              className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all z-10 border border-gray-200"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] text-gray-900">
            {product.name}
          </h3>

          {/* Rating Stars (Placeholder - can be replaced with real ratings later) */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">(4.8)</span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="h-9 text-xs bg-gray-50 border-gray-200">
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

          {/* Price Section */}
          <div className="flex flex-col gap-1 mt-auto items-center text-center">
            <span className="font-bold text-xl text-primary">
              GH₵{currentVariant.price.toFixed(2)}
            </span>
            {product.variants && (
              <span className="text-xs text-gray-500">
                {currentVariant.name}
              </span>
            )}
            {!product.variants && product.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {product.description}
              </p>
            )}
            {!product.variants && (
              <p className="text-xs text-gray-500">{currentVariant.unit}</p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-200 h-10 mt-2"
            size="sm"
          >
            <ShoppingCart size={16} className="mr-2" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
