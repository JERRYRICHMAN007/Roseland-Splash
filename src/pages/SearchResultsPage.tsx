import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Package,
  ShoppingCart,
  ArrowLeft,
  Filter,
  X,
  Star,
  TrendingUp,
  Zap,
  Heart,
  Eye,
  Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchResults, isSearching, performSearch } = useSearch();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    // Scroll to top when component mounts or route changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [searchParams, performSearch]); // Now safe to include performSearch since it's memoized

  const handleResultClick = (result: any, event?: React.MouseEvent) => {
    // Prevent any default behavior
    event?.preventDefault();
    event?.stopPropagation();

    // Determine the correct navigation path based on result type
    let targetPath = "";

    switch (result.type) {
      case "category":
        targetPath = `/category/${result.id}`;
        break;

      case "subcategory":
        targetPath = `/category/${result.categoryId}/subcategory/${result.id}`;
        break;

      case "product":
      case "variant":
        // For products, navigate to their subcategory page where they can be added to cart
        if (result.categoryId && result.subcategoryId) {
          targetPath = `/category/${result.categoryId}/subcategory/${result.subcategoryId}`;
        } else {
          // Fallback to categories if we don't have proper IDs
          console.warn(
            "Missing category or subcategory ID for product:",
            result
          );
          targetPath = "/categories";
        }
        break;

      default:
        console.error("Unknown result type:", result.type);
        targetPath = "/categories";
        break;
    }

    // Navigate immediately using React Router
    navigate(targetPath, { replace: false });
  };

  const handleQuickAddToCart = (e: React.MouseEvent, result: any) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart

    // Only allow adding products and variants to cart
    if (result.type === "product" || result.type === "variant") {
      const cartItemId =
        result.type === "variant"
          ? `${result.productId}-${result.name.split(" - ")[1] || "variant"}`
          : `${result.productId}`;

      addItem({
        id: cartItemId,
        name: result.name,
        price: result.price,
        image: result.image,
        variant:
          result.type === "variant" ? result.name.split(" - ")[1] : undefined,
      });

      toast({
        title: "Added to Cart",
        description: `${result.name} has been added to your cart`,
        duration: 2000, // 2 seconds instead of default 5 seconds
      });
    }
  };

  const filteredResults =
    selectedFilter === "all"
      ? searchResults
      : searchResults.filter((result) => result.type === selectedFilter);

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case "category":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "subcategory":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "product":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "variant":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case "category":
        return "📁";
      case "subcategory":
        return "📂";
      case "product":
        return "📦";
      case "variant":
        return "🏷️";
      default:
        return "🔍";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Search Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Try to go back, with fallback to categories
                try {
                  navigate(-1);
                } catch (error) {
                  // If going back fails, go to categories
                  navigate("/categories");
                }
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Search Results
                </h1>
                <TrendingUp size={24} className="text-primary" />
              </div>
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-muted-foreground">
                    Showing results for
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                    "{searchQuery}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            <span className="text-base font-semibold text-foreground whitespace-nowrap flex items-center gap-2">
              <Filter size={18} />
              Filter by:
            </span>
            <div className="flex gap-3">
              {[
                { key: "all", label: "All", count: searchResults.length, icon: Search },
                {
                  key: "category",
                  label: "Categories",
                  count: searchResults.filter((r) => r.type === "category")
                    .length,
                  icon: Package,
                },
                {
                  key: "subcategory",
                  label: "Subcategories",
                  count: searchResults.filter((r) => r.type === "subcategory")
                    .length,
                  icon: Package,
                },
                {
                  key: "product",
                  label: "Products",
                  count: searchResults.filter((r) => r.type === "product")
                    .length,
                  icon: ShoppingCart,
                },
                {
                  key: "variant",
                  label: "Variants",
                  count: searchResults.filter((r) => r.type === "variant")
                    .length,
                  icon: Zap,
                },
              ].map((filter) => {
                const IconComponent = filter.icon;
                return (
                  <Button
                    key={filter.key}
                    variant={
                      selectedFilter === filter.key ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedFilter(filter.key)}
                    className="whitespace-nowrap h-10 px-4 font-medium transition-all duration-200 hover:scale-105"
                  >
                    <IconComponent size={16} className="mr-2" />
                    {filter.label}
                    {filter.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 text-xs font-bold bg-primary/20 text-primary border-0"
                      >
                        {filter.count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Searching for the best products...</p>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we find exactly what you're looking for</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && filteredResults.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Search size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                No results found
              </h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                We couldn't find any products matching "<span className="font-semibold text-foreground">{searchQuery}</span>". 
                Try different keywords or explore our categories.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/categories")}
                  className="h-12 px-6 text-base font-semibold"
                >
                  Browse All Categories
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="h-12 px-6 text-base font-medium"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!isSearching && filteredResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold text-foreground">
                    {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  Click any item to explore further or add to cart
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Updated just now</span>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredResults.map((result, index) => (
                <Card
                  key={`${result.type}-${result.id}-${index}`}
                  className="cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group touch-manipulation active:scale-95 select-none overflow-hidden bg-gradient-to-br from-background to-background/50 border-2 hover:border-primary/30"
                >
                  <CardContent
                    className="p-4 sm:p-6"
                    onClick={(e) => handleResultClick(result, e)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Image */}
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              size={32}
                              className="text-muted-foreground group-hover:text-primary transition-colors"
                            />
                          )}
                        </div>
                        {/* Trending Badge */}
                        {(result.type === "product" || result.type === "variant") && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <Star size={12} className="text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getResultTypeIcon(result.type)}
                            </span>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors mb-1">
                                {result.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs font-semibold px-2 py-1 ${getResultTypeColor(
                                    result.type
                                  )}`}
                                >
                                  {result.type}
                                </Badge>
                                {(result.type === "product" || result.type === "variant") && (
                                  <div className="flex items-center gap-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          size={12}
                                          className="text-yellow-400 fill-yellow-400"
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">(4.8)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {(result.type === "product" || result.type === "variant") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleQuickAddToCart(e, result)}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:scale-110 h-10 w-10 rounded-full shadow-lg"
                              >
                                <ShoppingCart size={18} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500 h-8 w-8 rounded-full"
                            >
                              <Heart size={16} />
                            </Button>
                          </div>
                        </div>

                        {result.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {result.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {result.price && (
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                  ₵{result.price.toFixed(2)}
                                </span>
                                {result.unit && (
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {result.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye size={14} />
                            <span>View Details</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty Search */}
        {!searchQuery && (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Search size={60} className="text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Ready to Shop?
              </h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Use the search bar in the header to find products, categories, and more. 
                Discover amazing deals and fresh products!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/categories")}
                  className="h-12 px-8 text-base font-semibold"
                >
                  Browse All Categories
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="h-12 px-8 text-base font-medium"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
