import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categoriesData } from "@/data/categories";

const SubcategoryPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();

  const category = categoriesData.find((cat) => cat.id === categoryId);
  const subcategory = category?.subcategories.find(
    (sub) => sub.id === subcategoryId
  );

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryId, subcategoryId]);

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The subcategory you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/categories")}
            className="bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Back to Categories
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(`/category/${categoryId}`)}
            className="bg-secondary/80 hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <nav className="text-xs sm:text-sm text-muted-foreground mb-2">
              <span
                className="hover:text-primary cursor-pointer"
                onClick={() => navigate(`/category/${categoryId}`)}
              >
                {category.name}
              </span>
              <span className="mx-2">→</span>
              <span className="text-foreground">{subcategory.name}</span>
            </nav>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {subcategory.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {subcategory.description}
            </p>
            <p className="text-xs sm:text-sm text-primary font-medium">
              {subcategory.subcategories && subcategory.subcategories.length > 0
                ? subcategory.subcategories.reduce(
                    (total, nested) => total + (nested.products?.length || 0),
                    0
                  )
                : subcategory.products?.length || 0}{" "}
              products available
            </p>
          </div>
        </div>

        {/* Subcategory Hero Image */}
        <div className="relative mb-8 sm:mb-12">
          <div className="h-32 sm:h-48 rounded-xl overflow-hidden">
            <img
              src={subcategory.image}
              alt={subcategory.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
              <h2 className="text-lg sm:text-xl font-bold">
                {subcategory.name}
              </h2>
              <p className="text-sm text-white/90 hidden sm:block">
                {subcategory.description}
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {subcategory.subcategories && subcategory.subcategories.length > 0
            ? // Show products from nested subcategories (like Cake in Cup)
              subcategory.subcategories.map((nestedSub) =>
                nestedSub.products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )
            : // Show direct products
              subcategory.products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* Empty State */}
        {(subcategory.subcategories && subcategory.subcategories.length > 0
          ? subcategory.subcategories.reduce(
              (total, nested) => total + (nested.products?.length || 0),
              0
            )
          : subcategory.products?.length || 0) === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No products found in this subcategory.
            </p>
            <Button
              onClick={() => navigate(`/category/${categoryId}`)}
              className="mt-4 bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Back to {category.name}
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SubcategoryPage;
