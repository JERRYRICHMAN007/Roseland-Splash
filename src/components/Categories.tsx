import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "@/data/categories";

const Categories = () => {
  const navigate = useNavigate();

  const totalProducts = categoriesData.reduce(
    (total, category) =>
      total +
      category.subcategories.reduce(
        (subtotal, sub) => subtotal + sub.products.length,
        0
      ),
    0
  );

  return (
    <section
      id="categories-section"
      className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-background to-accent/20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Shop by <span className="text-primary">Categories</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Discover our carefully curated selection of fresh foods, snacks, and
            essentials
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
          {categoriesData.map((category) => {
            const categoryProductCount = category.subcategories.reduce(
              (total, sub) => total + sub.products.length,
              0
            );
            return (
              <Card
                key={category.id}
                className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 touch-manipulation active:scale-95"
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <CardContent className="p-3 sm:p-4 lg:p-5 space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-1 text-center">
                    <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block line-clamp-2">
                      {category.description}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {categoryProductCount} products
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md touch-manipulation active:scale-95 h-8 sm:h-9"
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
