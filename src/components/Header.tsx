import { Search, ShoppingCart, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useSearch } from "@/contexts/SearchContext";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { setSearchQuery } = useSearch();
  const [searchInput, setSearchInput] = useState("");
  const [mobileSearchInput, setMobileSearchInput] = useState("");

  const handleSearch = (query: string, isMobile = false) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      // Clear the input after search
      if (isMobile) {
        setMobileSearchInput("");
      } else {
        setSearchInput("");
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(mobileSearchInput, true);
  };

  return (
    <header className="border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm sm:text-base">
                R&S
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base lg:text-lg font-bold">
                <span className="text-primary">Rollsland</span> &
                <span className="text-secondary"> Splash</span>
              </h1>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, shown in mobile menu */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for fresh produce, purees, snacks..."
                className="pl-10 bg-accent/50 border-border/50 focus:bg-background transition-colors"
              />
            </form>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 touch-manipulation"
                  aria-label="Open menu"
                >
                  <Menu size={20} className="sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-4 sm:p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          R&S
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">
                          <span className="text-primary">Rollsland</span> &{" "}
                          <span className="text-secondary">Splash</span>
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Fresh groceries delivered
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {/* Mobile Search */}
                    <form
                      onSubmit={handleMobileSearchSubmit}
                      className="relative"
                    >
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        value={mobileSearchInput}
                        onChange={(e) => setMobileSearchInput(e.target.value)}
                        placeholder="Search products..."
                        className="pl-10 bg-accent/50 border-border/50"
                      />
                    </form>

                    {/* Mobile Navigation */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/categories")}
                        className="w-full justify-start text-foreground hover:text-primary hover:bg-accent h-12 text-base font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm">📂</span>
                          </div>
                          <span>Categories</span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/cart")}
                        className="w-full justify-start text-foreground hover:text-primary hover:bg-accent h-12 text-base font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center relative">
                            <ShoppingCart size={16} className="text-primary" />
                            {itemCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {itemCount > 99 ? "99+" : itemCount}
                              </span>
                            )}
                          </div>
                          <span>Cart ({itemCount})</span>
                        </div>
                      </Button>
                    </div>

                    {/* Mobile Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-accent/30 rounded-lg">
                      <MapPin size={16} className="text-primary" />
                      <span>Delivering to Accra & Kumasi</span>
                    </div>
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
