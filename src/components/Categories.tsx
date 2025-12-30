import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "@/data/categories";

const Categories = () => {
  const navigate = useNavigate();

  const totalProducts = categoriesData.reduce(
    (total, category) =>
      total +
      category.subcategories.reduce((subtotal, sub) => {
        // Handle subcategories that have nested subcategories (like Cake in Cup)
        if (sub.subcategories && sub.subcategories.length > 0) {
          return (
            subtotal +
            sub.subcategories.reduce(
              (nestedTotal, nestedSub) =>
                nestedTotal + (nestedSub.products?.length || 0),
              0
            )
          );
        }
        // Handle regular subcategories with products
        return subtotal + (sub.products?.length || 0);
      }, 0),
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto">
          {categoriesData.map((category) => {
            const categoryProductCount = category.subcategories.reduce(
              (total, sub) => {
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
              },
              0
            );
            return (
              <Card
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-200 bg-white hover:border-primary/40 touch-manipulation active:scale-[0.98] h-full flex flex-col"
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 flex flex-col flex-1">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-2 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors leading-tight mb-2">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {category.description}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-primary font-semibold">
                      {categoryProductCount}{" "}
                      {categoryProductCount === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 h-10 mt-auto"
                  >
                    Shop Now
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
