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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
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
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Search Results
              </h1>
              <p className="text-muted-foreground mt-1">
                {searchQuery && `Searching for "${searchQuery}"`}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Filter by:
            </span>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All", count: searchResults.length },
                {
                  key: "category",
                  label: "Categories",
                  count: searchResults.filter((r) => r.type === "category")
                    .length,
                },
                {
                  key: "subcategory",
                  label: "Subcategories",
                  count: searchResults.filter((r) => r.type === "subcategory")
                    .length,
                },
                {
                  key: "product",
                  label: "Products",
                  count: searchResults.filter((r) => r.type === "product")
                    .length,
                },
                {
                  key: "variant",
                  label: "Variants",
                  count: searchResults.filter((r) => r.type === "variant")
                    .length,
                },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={
                    selectedFilter === filter.key ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter(filter.key)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Searching...</span>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && filteredResults.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try searching with different keywords or browse our categories
            </p>
            <Button onClick={() => navigate("/categories")}>
              Browse Categories
            </Button>
          </div>
        )}

        {/* Results */}
        {!isSearching && filteredResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {filteredResults.length} result
                  {filteredResults.length !== 1 ? "s" : ""} found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Click any item to explore further or add to cart
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredResults.map((result, index) => (
                <Card
                  key={`${result.type}-${result.id}-${index}`}
                  className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-primary/50 group touch-manipulation active:scale-95 select-none"
                >
                  <CardContent
                    className="p-3 sm:p-4"
                    onClick={(e) => handleResultClick(result, e)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Package
                            size={24}
                            className="text-muted-foreground group-hover:text-primary transition-colors"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getResultTypeIcon(result.type)}
                            </span>
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {result.name}
                            </h3>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getResultTypeColor(
                              result.type
                            )}`}
                          >
                            {result.type}
                          </Badge>
                        </div>

                        {result.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          {result.price && (
                            <span className="font-medium text-primary">
                              ₵{result.price.toFixed(2)}
                              {result.unit && ` ${result.unit}`}
                            </span>
                          )}
                          <span className="text-muted-foreground capitalize">
                            {result.type}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {(result.type === "product" ||
                          result.type === "variant") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleQuickAddToCart(e, result)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/10"
                          >
                            <ShoppingCart size={16} />
                          </Button>
                        )}
                        <div className="text-xs text-muted-foreground text-center">
                          Click to explore
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
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Start your search
            </h3>
            <p className="text-muted-foreground mb-6">
              Use the search bar in the header to find products, categories, and
              more
            </p>
            <Button onClick={() => navigate("/categories")}>
              Browse All Categories
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
