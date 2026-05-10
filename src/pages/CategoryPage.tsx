import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoriesData } from "@/data/categories";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";

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
          <Button
            onClick={() => {
              navigate("/categories");
              scrollToTopInstant();
            }}
          >
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
        {/* Category header — glassmorphism hero banner */}
        <header className="mb-6 sm:mb-10">
          <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a2a] via-[#2d5a3d] to-[#1a3a2a] shadow-[var(--shadow-elevated)]">
            <img
              src={category.image}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/50 to-black/70"
              aria-hidden
            />
            <div className="relative z-10 flex flex-col gap-3 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/categories");
                    scrollToTopInstant();
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                  aria-label="Back to all categories"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <span className="text-xs font-medium uppercase tracking-widest text-white/60">
                  Category
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {category.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-sm">
                {category.description}
              </p>
              <div
                className="flex flex-wrap gap-2 pt-1"
                role="status"
                aria-label={`${totalProducts} products in ${category.subcategories.length} subcategories`}
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400"
                    aria-hidden
                  />
                  <span className="tabular-nums">{totalProducts}</span>
                  <span className="text-white/80">
                    {totalProducts === 1 ? "product" : "products"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <LayoutGrid
                    className="h-3.5 w-3.5 shrink-0 text-white/80"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="tabular-nums">
                    {category.subcategories.length}
                  </span>
                  <span className="text-white/80">
                    {category.subcategories.length === 1
                      ? "subcategory"
                      : "subcategories"}
                  </span>
                </div>
              </div>
              <nav
                aria-label="Subcategories"
                className="flex flex-wrap gap-2 pt-2 sm:gap-2.5"
              >
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      navigate(
                        `/category/${categoryId}/subcategory/${sub.id}`
                      );
                      scrollToTopInstant();
                    }}
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-left text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    <span className="max-w-[12rem] truncate sm:max-w-[16rem]">
                      {sub.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Subcategories Grid */}
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
                  onClick={() => {
                    navigate(
                      `/category/${categoryId}/subcategory/${subcategory.id}`
                    );
                    scrollToTopInstant();
                  }}
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
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors leading-snug">
                          {subcategory.name}
                        </h3>
                        <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.06] to-muted/40 px-3 py-2.5 sm:px-3.5 sm:py-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-primary/80 sm:text-xs">
                            About this section
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3 sm:text-sm sm:line-clamp-2">
                            {subcategory.description?.trim()
                              ? subcategory.description
                              : `Products and picks under ${subcategory.name}.`}
                          </p>
                        </div>
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
                          scrollToTopInstant();
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

        {/* Quick Shop All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            size="lg"
            onClick={() => {
              navigate(`/category/${categoryId}/all-products`);
              scrollToTopInstant();
            }}
            className="px-8 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg"
          >
            View All {category.name} Products
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
