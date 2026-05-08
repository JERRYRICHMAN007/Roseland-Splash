import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "@/data/categories";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <section
      id="categories-section"
      className="bg-gradient-to-b from-background to-accent/20 py-12 sm:py-16 lg:py-20"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Shop by <span className="gradient-text">Categories</span>
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Discover our carefully curated selection of fresh foods, snacks, and
            essentials.
          </p>
        </div>

        {/* Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categoriesData.map((category) => {
            const categoryProductCount = category.subcategories.reduce(
              (total, sub) => {
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
                return total + (sub.products?.length || 0);
              },
              0
            );

            return (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/category/${category.id}`);
                  }
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card card-shadow transition-all duration-300 hover:elevated-shadow focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              >
                {/* Image (top 60%) */}
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover gradient overlay */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Hover category name on top of overlay */}
                  <div className="pointer-events-none absolute bottom-3 left-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="font-display text-lg font-bold text-white drop-shadow">
                      {category.name}
                    </p>
                  </div>
                </div>

                {/* Bottom info section */}
                <div className="space-y-3 bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                      {category.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {categoryProductCount}{" "}
                      {categoryProductCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-sm font-medium text-primary">
                    <span>Shop Now</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
