import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoriesData } from "@/data/categories";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

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

  const totalProducts = category.subcategories.reduce(
    (total, sub) => total + sub.products.length,
    0
  );

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

        {/* Subcategories Grid */}
        <div className="space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center">
            Browse Subcategories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {category.subcategories.map((subcategory) => (
              <Card
                key={subcategory.id}
                className="group hover:shadow-[var(--card-shadow)] transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-0">
                  <div
                    className="relative overflow-hidden rounded-t-lg"
                    onClick={() =>
                      navigate(
                        `/category/${categoryId}/subcategory/${subcategory.id}`
                      )
                    }
                  >
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      {subcategory.products.length} items
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                        {subcategory.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {subcategory.description}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() =>
                        navigate(
                          `/category/${categoryId}/subcategory/${subcategory.id}`
                        )
                      }
                    >
                      Shop {subcategory.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Shop All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            size="lg"
            onClick={() => navigate(`/category/${categoryId}/all-products`)}
            className="px-6 sm:px-8"
          >
            Shop All {category.name} Products
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
