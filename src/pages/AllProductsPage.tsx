import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, ShoppingCart, Filter } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoriesData } from "@/data/categories";

const AllProductsPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  const category = categoriesData.find((cat) => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/categories")}>
            Back to Categories
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Get all products from all subcategories
  const allProducts = category.subcategories.flatMap((sub) => sub.products);

  // Filter products based on selected subcategory
  const filteredProducts =
    selectedSubcategory === "all"
      ? allProducts
      : category.subcategories.find((sub) => sub.id === selectedSubcategory)
          ?.products || [];

  const updateQuantity = (productId: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const addToCart = (product: any) => {
    const quantity = quantities[product.id] || 1;
    // In real app, this would update cart state/context
    console.log(`Added ${quantity} x ${product.name} to cart`);

    // Show toast notification (using existing toast system)
    import("@/hooks/use-toast").then(({ toast }) => {
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added successfully`,
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/category/${categoryId}`)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <nav className="text-sm text-muted-foreground mb-2">
              <span
                className="hover:text-primary cursor-pointer"
                onClick={() => navigate(`/category/${categoryId}`)}
              >
                {category.name}
              </span>
              <span className="mx-2">→</span>
              <span className="text-foreground">All Products</span>
            </nav>
            <h1 className="text-3xl font-bold">All {category.name}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products available
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="font-medium">Filter by subcategory:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubcategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubcategory("all")}
            >
              All ({allProducts.length})
            </Button>
            {category.subcategories.map((subcategory) => (
              <Button
                key={subcategory.id}
                variant={
                  selectedSubcategory === subcategory.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedSubcategory(subcategory.id)}
              >
                {subcategory.name} (
                {subcategory.subcategories &&
                subcategory.subcategories.length > 0
                  ? subcategory.subcategories.reduce(
                      (total, nested) => total + (nested.products?.length || 0),
                      0
                    )
                  : subcategory.products?.length || 0}
                )
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group transition-all duration-300 shadow-none"
            >
              <CardContent className="p-4 space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-visible relative p-2">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <span className="text-white font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="text-primary font-bold">
                    GH₵{product.price.toFixed(2)}{" "}
                    <span className="text-xs text-muted-foreground">
                      {product.unit}
                    </span>
                  </p>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={!product.inStock}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {quantities[product.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, 1)}
                      disabled={!product.inStock}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => addToCart(product)}
                    className="gap-2"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart size={14} />
                    {product.inStock ? "Add" : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No products found with the current filter.
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedSubcategory("all")}
              className="mt-4"
            >
              Show All Products
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllProductsPage;
