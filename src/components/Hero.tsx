import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Truck, Clock, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section");
    categoriesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-slate-900/95 via-green-dark to-slate-800/95 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fresh organic produce and groceries"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-green-dark/80 to-slate-800/85"></div>
        <div className="absolute inset-0 bg-[var(--hero-gradient-dark)]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-green-medium/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[70vh]">
          {/* Hero Content */}
          <div className="space-y-8 lg:space-y-10 text-center lg:text-left animate-fade-in-up">
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-green-medium/20 backdrop-blur-sm rounded-full text-sm font-medium text-green-light border border-green-medium/30 mb-6">
                <span className="w-2 h-2 bg-green-medium rounded-full mr-2 animate-pulse"></span>
                Fresh • Local • Trusted
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-light via-green-medium to-primary bg-clip-text text-transparent drop-shadow-lg">
                  Roseland & Splash
                </span>
                <br />
                <span className="text-white drop-shadow-[var(--hero-text-glow)]">
                  — Freshness Delivered
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium drop-shadow-sm">
                Premium groceries from farm to your doorstep. Fresh foods,
                international snacks, Mashedke delights, and daily essentials.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={scrollToCategories}
                className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-4 h-auto font-bold rounded-full shadow-[var(--premium-shadow)] hover:shadow-[var(--elevated-shadow)] transition-all duration-300 hover:scale-105"
              >
                Shop Categories
                <span className="ml-2">→</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/track-order")}
                className="bg-transparent text-white border-2 border-white/40 hover:bg-white/10 hover:border-white/60 text-lg px-8 py-4 h-auto font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Track Order
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-4 justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-primary/90 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Truck className="text-white" size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-white text-base">
                    Free Delivery
                  </h3>
                  <p className="text-sm text-slate-200">Orders over GH₵100</p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-secondary/90 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-white text-base">Same Day</h3>
                  <p className="text-sm text-slate-200">Quick delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-green-medium/90 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-white text-base">
                    Fresh Quality
                  </h3>
                  <p className="text-sm text-slate-200">100% guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image - Hidden on small mobile, shown on larger screens */}
          <div className="relative hidden lg:block animate-scale-in">
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-3xl shadow-[var(--premium-shadow)] hover:shadow-[var(--elevated-shadow)] transition-all duration-500 hover:scale-105 border border-white/20">
                <img
                  src={heroImage}
                  alt="Fresh organic vegetables, fruits and spices"
                  className="w-full h-[400px] xl:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                  <p className="text-sm font-bold text-primary">Fresh Today</p>
                  <p className="text-xs text-muted-foreground">
                    From local farms
                  </p>
                </div>
                <div className="absolute bottom-6 left-6 bg-primary/95 backdrop-blur-sm rounded-2xl px-4 py-3 text-white">
                  <p className="text-sm font-bold">Premium Quality</p>
                  <p className="text-xs opacity-90">Guaranteed Fresh</p>
                </div>
              </div>
            </div>

            {/* Enhanced Background decorations */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-green-medium/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/2 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
