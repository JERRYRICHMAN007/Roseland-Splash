import { Search, ShoppingCart, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                R&S
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base lg:text-lg font-bold">
                <span className="text-primary">Roseland</span> &
                <span className="text-secondary"> Splash</span>
              </h1>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown in mobile menu */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Search for fresh produce, purees, snacks..."
                className="pl-10 bg-accent/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/categories")}
              className="text-foreground hover:text-primary"
            >
              Categories
            </Button>
          </nav>

          {/* Location - Desktop only */}
          <div className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} />
            <span>Accra & Kumasi</span>
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate("/cart");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="relative hover:bg-accent"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="space-y-6 pt-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 bg-accent/50 border-border/50"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/categories")}
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      Categories
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/cart")}
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      Cart ({itemCount})
                    </Button>
                  </div>

                  {/* Mobile Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                    <MapPin size={16} />
                    <span>Delivering to Accra & Kumasi</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
