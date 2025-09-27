import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductVariant {
  size: string;
  price: number;
  image: string;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants?.[0]?.size || "default"
  );
  const { addItem } = useCart();
  const { toast } = useToast();

  const getCurrentVariant = () => {
    if (!product.variants || selectedVariant === "default") {
      return {
        size: "Standard",
        price: product.basePrice,
        image: product.image,
      };
    }
    return (
      product.variants.find((v) => v.size === selectedVariant) ||
      product.variants[0]
    );
  };

  const currentVariant = getCurrentVariant();

  const handleAddToCart = () => {
    const cartItemId = product.variants
      ? `${product.id}-${currentVariant.size}`
      : product.id;

    addItem({
      id: cartItemId,
      name: product.name,
      price: currentVariant.price,
      image: currentVariant.image,
      variant: product.variants ? currentVariant.size : undefined,
    });

    toast({
      title: "Added to Cart",
      description: `${product.name}${
        product.variants ? ` (${currentVariant.size})` : ""
      } has been added to your cart`,
    });
  };

  return (
    <Card className="group hover:shadow-[var(--elevated-shadow)] transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 overflow-hidden">
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Product Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-accent/20">
          <img
            src={currentVariant.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="h-8 text-xs sm:text-sm bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem key={variant.size} value={variant.size}>
                    {variant.size} - GH₵{variant.price.toFixed(2)}
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
              {product.variants && (
                <p className="text-xs text-muted-foreground">
                  {currentVariant.size}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full group-hover:bg-primary-hover transition-all duration-300 font-medium rounded-lg shadow-sm hover:shadow-md"
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
