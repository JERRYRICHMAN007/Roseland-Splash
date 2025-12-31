import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Search,
  ShoppingCart,
  Grid3x3,
  List,
  Star,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoriesData } from "@/data/categories";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchResults, isSearching, performSearch } = useSearch();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [searchParams, performSearch]);

  const handleResultClick = (result: any, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

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
        if (result.categoryId && result.subcategoryId) {
          targetPath = `/category/${result.categoryId}/subcategory/${result.subcategoryId}`;
        } else {
          targetPath = "/categories";
        }
        break;
      default:
        targetPath = "/categories";
        break;
    }

    navigate(targetPath, { replace: false });
  };

  const handleAddToCart = (e: React.MouseEvent, result: any) => {
    e.stopPropagation();

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
        duration: 2000,
      });
    }
  };

  // Filter to show only products and variants
  const productResults = searchResults.filter(
    (result) => result.type === "product" || result.type === "variant"
  );

  // Sort results
  const sortedResults = [...productResults].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return 0;
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/categories" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Shop
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-primary">
                Search results for "{searchQuery}"
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Categories Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-gray-300">
                  <Menu className="mr-2 h-4 w-4" />
                  Product Categories
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="font-semibold text-lg text-gray-900">
                    Product Categories
                  </h2>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                  <ul className="space-y-0">
                    {categoriesData.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.id}`}
                          className="block py-3.5 px-5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Left Sidebar - Product Categories (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4 shadow-sm">
              <h2 className="font-semibold text-base mb-4 text-gray-900">
                Product Categories
              </h2>
              <ul className="space-y-0">
                {categoriesData.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.id}`}
                      className="block py-3 px-3 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-md border-b border-gray-100 last:border-b-0"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results Header with View Toggle and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-gray-600 font-medium">
                  Showing all {sortedResults.length} result
                  {sortedResults.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0 rounded-md"
                    aria-label="Grid view"
                  >
                    <Grid3x3 size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0 rounded-md"
                    aria-label="List view"
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9 text-sm border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                  <p className="text-base font-medium text-gray-700">
                    Searching...
                  </p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!isSearching && sortedResults.length === 0 && searchQuery && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto px-4">
                  <Search size={64} className="text-primary mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    No results found
                  </h3>
                  <p className="text-base text-gray-600 mb-8 leading-relaxed">
                    We couldn't find any products matching "{searchQuery}". Try
                    different keywords or explore our categories.
                  </p>
                  <Button onClick={() => navigate("/categories")} className="px-6">
                    Browse All Categories
                  </Button>
                </div>
              </div>
            )}

            {/* Empty Search */}
            {!searchQuery && (
              <div className="text-center py-20">
                <div className="max-w-lg mx-auto px-4">
                  <Search size={64} className="text-primary mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Ready to Shop?
                  </h3>
                  <p className="text-base text-gray-600 mb-8 leading-relaxed">
                    Use the search bar in the header to find products,
                    categories, and more.
                  </p>
                  <Button onClick={() => navigate("/categories")} className="px-6">
                    Browse All Categories
                  </Button>
                </div>
              </div>
            )}

            {/* Product Results - Grid View */}
            {!isSearching && sortedResults.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedResults.map((result, index) => (
                  <Card
                    key={`${result.type}-${result.id}-${index}`}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
                    onClick={(e) => handleResultClick(result, e)}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-6 sm:p-8">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search size={48} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Product Title */}
                        <h3 className="font-medium text-base text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem] leading-snug">
                          {result.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className="text-yellow-400 fill-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            (4.8)
                          </span>
                        </div>

                        {/* Price */}
                        {result.price && (
                          <div className="mb-4">
                            <p className="text-xl font-bold text-primary">
                              GH₵{result.price.toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                          onClick={(e) => handleAddToCart(e, result)}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 shadow-sm hover:shadow-md transition-all duration-200 mt-auto"
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          ADD TO CART
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Product Results - List View */}
            {!isSearching && sortedResults.length > 0 && viewMode === "list" && (
              <div className="space-y-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
                {sortedResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    className="group cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                    onClick={(e) => handleResultClick(result, e)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <Search size={32} className="text-gray-300" />
                        )}
                      </div>

                      {/* Product Details - Middle Section */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base sm:text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {result.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className="text-yellow-400 fill-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            (4.8)
                          </span>
                        </div>

                        {/* Description if available */}
                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* Price and CTA - Right Section */}
                      <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3 sm:gap-4">
                        {/* Price */}
                        {result.price && (
                          <div className="text-right">
                            <p className="text-xl sm:text-2xl font-bold text-primary">
                              GH₵{result.price.toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                          onClick={(e) => handleAddToCart(e, result)}
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          ADD TO CART
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
