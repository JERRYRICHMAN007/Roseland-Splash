import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section");
    categoriesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[88vh] overflow-hidden bg-gradient-to-br from-[#0a2e1a] via-[#0f4d2a] to-[#1a3d0f]">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left: Headline + CTAs + Trust pills */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Fresh • Local • Trusted
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              <span className="gradient-text-gold block">Rollsland &amp; Splash</span>
              <span className="mt-2 block text-white">Freshness Delivered</span>
            </h1>

            {/* Subhead */}
            <p className="mx-auto max-w-xl text-lg text-white/80 sm:text-xl lg:mx-0">
              Premium groceries from farm to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:items-start lg:justify-start">
              <Button
                size="lg"
                onClick={scrollToCategories}
                className="group h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_hsl(142_76%_36%/0.6)] transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_14px_48px_-10px_hsl(142_76%_36%/0.8)]"
              >
                Shop Now
                <ArrowRight
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  navigate("/categories");
                  scrollToTopInstant();
                }}
                className="glass h-14 rounded-full px-8 text-base font-semibold text-white hover:text-white border-white/40 hover:bg-white/15"
              >
                Browse All
              </Button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:gap-3 lg:justify-start">
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white sm:text-sm">
                <span aria-hidden>🚚</span>
                Free Delivery over GH₵100
              </span>
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white sm:text-sm">
                <span aria-hidden>⚡</span>
                Same Day
              </span>
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white sm:text-sm">
                <span aria-hidden>✓</span>
                Fresh Daily
              </span>
            </div>
          </div>

          {/* Right: Floating product image card (desktop only) */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="glass glass-shadow overflow-hidden rounded-3xl">
                <img
                  src={heroImage}
                  alt="Fresh organic vegetables, fruits and spices"
                  className="h-[460px] w-full object-cover xl:h-[520px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              {/* Floating badge: Fresh Today */}
              <div className="glass glass-shadow absolute -left-6 top-10 rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Fresh Today
                </p>
                <p className="text-sm font-semibold text-foreground">
                  From local farms
                </p>
              </div>

              {/* Floating badge: 4.9 Rated */}
              <div className="glass glass-shadow absolute -right-6 bottom-10 flex items-center gap-2 rounded-2xl px-4 py-3">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">
                    4.9
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Rated by customers
                  </p>
                </div>
              </div>
            </div>

            {/* Soft halo behind card */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-emerald-400/20 to-transparent blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
