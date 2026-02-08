import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoriesData } from "@/data/categories";
import WishlistButton from "@/components/WishlistButton";
import WishlistModal from "@/components/WishlistModal";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const category = categoriesData.find((cat) => cat.id === categoryId);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

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

  const totalProducts = category.subcategories.reduce((total, sub) => {
    // Handle subcategories that have nested subcategories (like Cake in Cup)
    if (sub.subcategories && sub.subcategories.length > 0) {
      return (
        total +
        sub.subcategories.reduce(
          (nestedTotal, nestedSub) =>
            nestedTotal + (nestedSub.products?.length || 0),
          0
        )
      );
    }
    // Handle regular subcategories with products
    return total + (sub.products?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate("/categories")}
            className="flex-shrink-0 bg-secondary/80 hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {category.description}
            </p>
            <p className="text-xs sm:text-sm text-primary font-medium">
              {totalProducts} products across {category.subcategories.length}{" "}
              subcategories
            </p>
          </div>
        </div>

        {/* Category Hero Image */}
        <div className="relative mb-8 sm:mb-12">
          <div className="h-40 sm:h-64 rounded-xl overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
              <h2 className="text-lg sm:text-2xl font-bold">{category.name}</h2>
              <p className="text-sm text-white/90 hidden sm:block">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Feature Section - For all subcategories */}
        <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Wishlist Feature
              </h3>
              <p className="text-sm text-muted-foreground">
                Suggest items you'd like to see in any subcategory!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {category.subcategories.map((sub) => (
              <Card
                key={sub.id}
                className="p-4 border border-primary/20 bg-white/80"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {sub.name}
                    </h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  <WishlistButton
                    categoryId={sub.id}
                    categoryName={sub.name}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubcategory({ id: sub.id, name: sub.name });
                      setWishlistModalOpen(true);
                    }}
                    className="shrink-0"
                  >
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center">
            Browse Subcategories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {category.subcategories.map((subcategory) => {
              const productCount =
                subcategory.subcategories &&
                subcategory.subcategories.length > 0
                  ? subcategory.subcategories.reduce(
                      (total, nested) => total + (nested.products?.length || 0),
                      0
                    )
                  : subcategory.products?.length || 0;

              return (
                <Card
                  key={subcategory.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 bg-white hover:border-primary/40 h-full flex flex-col"
                  onClick={() =>
                    navigate(
                      `/category/${categoryId}/subcategory/${subcategory.id}`
                    )
                  }
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {productCount} {productCount === 1 ? "item" : "items"}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors mb-2">
                          {subcategory.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {subcategory.description}
                        </p>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/category/${categoryId}/subcategory/${subcategory.id}`
                          );
                        }}
                      >
                        Shop Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Shop All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            size="lg"
            onClick={() => navigate(`/category/${categoryId}/all-products`)}
            className="px-8 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg"
          >
            View All {category.name} Products
          </Button>
        </div>
      </div>

      <Footer />

      {/* Wishlist Modal */}
      {selectedSubcategory && (
        <WishlistModal
          isOpen={wishlistModalOpen}
          onClose={() => {
            setWishlistModalOpen(false);
            setSelectedSubcategory(null);
          }}
          categoryId={selectedSubcategory.id}
          categoryName={selectedSubcategory.name}
        />
      )}
    </div>
  );
};

export default CategoryPage;
