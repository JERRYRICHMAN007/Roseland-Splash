import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, LayoutGrid } from "lucide-react";
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
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-background to-emerald-50/40 shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
            <div
              className="pointer-events-none absolute -left-12 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/15 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/15">
                  <LayoutGrid className="h-7 w-7" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-xs">
                    Shop by area
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    Browse subcategories
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Explore collections inside{" "}
                    <span className="font-semibold text-foreground">
                      {category.name}
                    </span>
                    —each section groups related products so you can go straight to
                    what you need.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end lg:flex-col lg:items-stretch">
                <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-primary/15 bg-card/90 px-4 py-3 text-center shadow-sm backdrop-blur-sm sm:flex-none">
                  <span className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                    {category.subcategories.length}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {category.subcategories.length === 1 ? "Section" : "Sections"}
                  </span>
                </div>
                <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center shadow-sm backdrop-blur-sm sm:flex-none">
                  <span className="text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                    {totalProducts}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Products
                  </span>
                </div>
              </div>
            </div>
            <div className="relative border-t border-primary/10 bg-muted/30 px-4 py-4 sm:px-7 sm:py-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Jump to
              </p>
              <div className="flex flex-wrap gap-2">
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
                    className="group inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-left text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-md sm:text-sm"
                  >
                    <span className="max-w-[10rem] truncate sm:max-w-[14rem]">
                      {sub.name}
                    </span>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
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
