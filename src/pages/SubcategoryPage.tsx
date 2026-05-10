import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categoriesData } from "@/data/categories";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";
import WishlistButton from "@/components/WishlistButton";
import WishlistModal from "@/components/WishlistModal";

/** Short contextual footer tags for the subcategory header bar. */
function getSubcategoryFooterTags(
  subName: string,
  subDesc: string,
  categoryName: string
): [string, string] {
  const t = `${subName} ${subDesc} ${categoryName}`.toLowerCase();

  if (
    /\b(meat|fish|egg|gizzard|sausage|goat|beef|chicken|pork|stripe|smoked)\b/.test(
      t
    )
  ) {
    return ["Beef · Chicken · Fish · Eggs", "Farm sourced · daily fresh"];
  }
  if (
    /\b(farm produce|farm|produce|vegetable|plantain|yam|pepper|onion|tomato|carrot|ginger|garlic)\b/.test(
      t
    )
  ) {
    return ["Vegetables · fruits · roots", "Local farms · seasonal picks"];
  }
  if (/\b(juice|smoothie|beverage|drink)\b/.test(t)) {
    return ["Fresh pressed · refreshing blends", "Made to enjoy · same-day picks"];
  }
  if (/\b(household|essential|cleaning|toiletries)\b/.test(t)) {
    return ["Pantry staples · home care", "Trusted brands · fair prices"];
  }
  if (/\b(snack|frozen|fried|noodle|biscuit|shortbread|cracker)\b/.test(t)) {
    return ["Ready to eat · party picks", "Crispy · quality you can taste"];
  }
  if (/\b(mashed|kenkey|gym|lactating|delight)\b/.test(t)) {
    return [
      "Nutritious blends · sizes for everyone",
      "Fresh ingredients · crafted with care",
    ];
  }
  if (/\b(stew|spice|seasoning|curry|pepper powder)\b/.test(t)) {
    return ["Cooking essentials · bold flavor", "Pantry-quality · recipe-ready"];
  }
  if (/\b(pastry|cake|cupcake|chocolate)\b/.test(t)) {
    return ["Baked treats · sweet moments", "Fresh batches · made with love"];
  }

  return ["Curated picks · shop favorites", "Quality checked · ready to cart"];
}

const SubcategoryPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  const category = categoriesData.find((cat) => cat.id === categoryId);
  const subcategory = category?.subcategories.find(
    (sub) => sub.id === subcategoryId
  );

  // Wishlist feature enabled for all subcategories
  const hasWishlistFeature = !!subcategoryId;

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryId, subcategoryId]);

  const productTotal =
    !category || !subcategory
      ? 0
      : subcategory.subcategories && subcategory.subcategories.length > 0
        ? subcategory.subcategories.reduce(
            (total, nested) => total + (nested.products?.length || 0),
            0
          )
        : subcategory.products?.length || 0;

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
            onClick={() => {
              navigate("/categories");
              scrollToTopInstant();
            }}
            className="bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Back to Categories
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const [footerTagA, footerTagB] = getSubcategoryFooterTags(
    subcategory.name,
    subcategory.description ?? "",
    category.name
  );

  const tagsPillText = `🌿 ${footerTagA} · ${footerTagB}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Merged glass hero — image + overlay + header content */}
        <section
          className="relative mb-6 min-h-[220px] overflow-hidden rounded-2xl sm:mb-8"
          aria-labelledby="subcategory-heading"
        >
          <img
            src={subcategory.image}
            alt={subcategory.name}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1a0f]/90 via-[#0a1a0f]/30 to-[#0a1a0f]/40"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigate(`/category/${categoryId}`);
                  scrollToTopInstant();
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                aria-label={`Back to ${category.name}`}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <nav
                className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                aria-label="Breadcrumb"
              >
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/category/${categoryId}`);
                    scrollToTopInstant();
                  }}
                  className="font-semibold text-[#86efac] hover:text-[#bbf7d0] hover:underline"
                >
                  {category.name}
                </button>
                <span className="text-white/40" aria-hidden>
                  →
                </span>
                <span className="text-white/60">{subcategory.name}</span>
              </nav>
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 max-w-xl">
                <h1
                  id="subcategory-heading"
                  className="text-2xl font-bold tracking-tight text-white"
                >
                  {subcategory.name}
                </h1>
                <p className="mt-1 text-sm text-white/65">
                  {subcategory.description}
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md sm:self-end">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]"
                    aria-hidden
                  />
                  <span className="tabular-nums">{productTotal}</span>
                  <span className="font-bold">
                    {productTotal === 1 ? "product" : "products"} available
                  </span>
                </div>
                <div className="max-w-full self-start rounded-full border border-white/15 bg-white/10 px-3 py-1 text-left text-[10px] leading-snug text-white/75 backdrop-blur-md sm:max-w-[20rem] sm:self-end">
                  <span className="line-clamp-2">{tagsPillText}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wishlist Feature Section */}
        {hasWishlistFeature && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-[#e5e9e5] bg-white sm:mb-12">
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-[#fdf2f8] text-lg text-pink-400">
                  <Heart className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#0f1a0f]">
                    Wishlist Feature
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Suggest items or flavors you&apos;d like to see in this
                    category!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWishlistModalOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#1a3a2a] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2d5a3d]"
              >
                <Heart className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                View Wishlist
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3 sm:flex-row sm:items-center">
              <WishlistButton
                categoryId={subcategoryId!}
                categoryName={subcategory.name}
                triggerClassName="h-auto rounded-full border border-[#e5e9e5] bg-white px-4 py-1.5 text-xs font-medium text-[#1a3a2a] shadow-none hover:border-[#16a34a] hover:bg-white hover:text-[#1a3a2a]"
              />
              <p className="text-xs text-gray-400">
                Share your ideas for new products or flavours
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
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
              onClick={() => {
                navigate(`/category/${categoryId}`);
                scrollToTopInstant();
              }}
              className="mt-4 bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Back to {category.name}
            </Button>
          </div>
        )}
      </div>

      <Footer />

      {/* Wishlist Modal */}
      {hasWishlistFeature && (
        <WishlistModal
          isOpen={wishlistModalOpen}
          onClose={() => setWishlistModalOpen(false)}
          categoryId={subcategoryId!}
          categoryName={subcategory.name}
        />
      )}
    </div>
  );
};

export default SubcategoryPage;
