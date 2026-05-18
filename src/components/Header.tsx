import {
  Search,
  ShoppingCart,
  MapPin,
  Menu,
  UserCircle,
  LogOut,
  Package,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drowpdown-menu";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { useState, useMemo, useEffect } from "react";
import { useWishlistCount } from "@/contexts/WishlistCountContext";
import GeneralWishlistModal from "./GeneralWishlistModal";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";

const announcements = [
  { icon: "🚚", text: "Free delivery on orders over GH₵100" },
  { icon: "⚡", text: "Same day delivery — order before 2pm" },
  { icon: "✓", text: "Fresh produce daily from local farms" },
  { icon: "💳", text: "Pay with MTN MoMo, Vodafone Cash & AirtelTigo" },
];

const Header = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { setSearchQuery } = useSearch();

  // useAuth now returns defaults if context is unavailable, so we can safely use it
  const { isAuthenticated, user, logout } = useAuth();
  const { getOrdersByUser, orders } = useOrders();
  const [searchInput, setSearchInput] = useState("");
  const [mobileSearchInput, setMobileSearchInput] = useState("");
  const { count: wishlistCount } = useWishlistCount();
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  // Auto-rotate announcement bar with fade + slide
  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setAnnouncementVisible(false);
      fadeTimeout = setTimeout(() => {
        setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        setAnnouncementVisible(true);
      }, 300);
    }, 3500);

    return () => {
      clearInterval(interval);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, []);

  // Get user's orders count
  const userOrdersCount = useMemo(() => {
    if (!isAuthenticated || !user) return 0;
    const userOrders = getOrdersByUser(user.phone, user.email);
    return userOrders.length;
  }, [isAuthenticated, user, getOrdersByUser, orders]);

  const handleSearch = (query: string, isMobile = false) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      scrollToTopInstant();
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
    <>
      {/* Announcement Bar — auto-rotating with fade + slide */}
      <div
        className="overflow-hidden bg-gradient-to-r from-primary via-green-medium to-primary px-4 py-2 text-white"
        role="status"
        aria-live="polite"
      >
        <div
          className="text-center text-xs font-medium transition-all duration-300 sm:text-sm"
          style={{
            opacity: announcementVisible ? 1 : 0,
            transform: announcementVisible ? "translateY(0)" : "translateY(-8px)",
          }}
        >
          <span aria-hidden className="mr-1.5">
            {announcements[announcementIndex].icon}
          </span>
          <span>{announcements[announcementIndex].text}</span>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="sticky top-0 z-50 border-b border-border/60"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-6 h-16 lg:h-[68px]">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
              onClick={() => {
                navigate("/");
                scrollToTopInstant();
              }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-dark rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">R&S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight font-display">
                  <span className="text-primary">Rollsland</span>
                  <span className="text-foreground"> & </span>
                  <span className="text-secondary">Splash</span>
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none -mt-0.5 hidden lg:block">
                  Fresh · Local · Trusted
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search size={16} />
                </div>
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search fresh produce, snacks, juices..."
                  className="pl-10 pr-4 h-10 rounded-full bg-muted/60 border-border/50 focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/70"
                />
              </form>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/categories");
                  scrollToTopInstant();
                }}
                className="h-9 px-4 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/8 rounded-lg transition-all"
              >
                Categories
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/my-orders");
                    scrollToTopInstant();
                  }}
                  className="h-9 px-4 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/8 rounded-lg transition-all relative"
                >
                  <Package size={15} className="mr-1.5" />
                  My Orders
                  {userOrdersCount > 0 && (
                    <span className="ml-1.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {userOrdersCount > 99 ? "99+" : userOrdersCount}
                    </span>
                  )}
                </Button>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              {/* Location pill - desktop only */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 border border-border/50">
                <MapPin size={12} className="text-primary" />
                <span className="font-medium">Accra & Kumasi</span>
              </div>

              {/* Wishlist */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWishlistModalOpen(true)}
                  className="relative w-10 h-10 rounded-full hover:bg-primary/8 transition-all"
                  aria-label="Wishlist"
                >
                  <Heart size={19} className="text-muted-foreground hover:text-primary transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigate("/cart");
                  scrollToTopInstant();
                }}
                className="relative w-10 h-10 rounded-full hover:bg-primary/8 transition-all"
                aria-label="Cart"
              >
                <ShoppingCart size={19} className="text-muted-foreground" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Button>

              {/* Auth - Desktop */}
              <div className="hidden lg:flex items-center gap-2 ml-1">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 pl-2 pr-3 rounded-full hover:bg-primary/8 transition-all gap-2 border border-border/60 hover:border-primary/30"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-green-dark flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">
                            {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                          </span>
                        </div>
                        <span className="text-sm font-medium max-w-[90px] truncate">
                          {user?.firstName || "Account"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-60 rounded-2xl p-2 shadow-lg border border-border/60"
                      sideOffset={8}
                    >
                      <div className="px-3 py-3 mb-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-dark flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">
                              {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem
                        onClick={() => setWishlistModalOpen(true)}
                        className="rounded-lg cursor-pointer"
                      >
                        <Heart size={15} className="mr-2.5 text-red-500" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                            {wishlistCount}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/account");
                          scrollToTopInstant();
                        }}
                        className="rounded-lg cursor-pointer"
                      >
                        <UserCircle size={15} className="mr-2.5 text-primary" />
                        My Account
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/my-orders");
                          scrollToTopInstant();
                        }}
                        className="rounded-lg cursor-pointer"
                      >
                        <Package size={15} className="mr-2.5 text-primary" />
                        My Orders
                        {userOrdersCount > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {userOrdersCount} orders
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        onClick={async () => {
                          await logout();
                          navigate("/", { replace: true });
                          scrollToTopInstant();
                        }}
                        className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
                      >
                        <LogOut size={15} className="mr-2.5" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate("/login");
                        scrollToTopInstant();
                      }}
                      className="h-9 px-4 rounded-full text-sm font-medium hover:bg-primary/8 hover:text-primary transition-all"
                    >
                      Log in
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate("/signup");
                        scrollToTopInstant();
                      }}
                      className="h-9 px-4 rounded-full text-sm font-medium bg-primary hover:bg-primary-hover shadow-sm hover:shadow-md transition-all"
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden w-10 h-10 rounded-full hover:bg-primary/8 ml-1"
                    aria-label="Open menu"
                  >
                    <Menu size={20} className="text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-[340px] p-0 border-l border-border/60"
                >
                  <div className="flex flex-col h-full bg-background">
                    {/* Mobile Header */}
                    <div className="p-5 border-b border-border/60 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-dark rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-sm">R&S</span>
                        </div>
                        <div>
                          <h2 className="text-base font-bold font-display">
                            <span className="text-primary">Rollsland</span>
                            <span className="text-foreground"> & </span>
                            <span className="text-secondary">Splash</span>
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Fresh groceries delivered
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {/* Mobile Search */}
                      <div className="p-4 border-b border-border/40">
                        <form onSubmit={handleMobileSearchSubmit} className="relative">
                          <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={15}
                          />
                          <Input
                            value={mobileSearchInput}
                            onChange={(e) => setMobileSearchInput(e.target.value)}
                            placeholder="Search products..."
                            className="pl-10 h-10 rounded-full bg-muted/60 border-border/50 text-sm"
                          />
                        </form>
                      </div>

                      {/* User info if logged in */}
                      {isAuthenticated && (
                        <div className="mx-4 mt-4 p-3.5 bg-gradient-to-br from-primary/8 to-secondary/5 rounded-2xl border border-primary/15">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-dark flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mobile Nav Links */}
                      <div className="p-4 space-y-1">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                          Navigation
                        </p>

                        <button
                          onClick={() => {
                            navigate("/categories");
                            scrollToTopInstant();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/8 hover:text-primary transition-all text-left group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                            <span className="text-base">📂</span>
                          </div>
                          <span className="font-medium text-sm">All Categories</span>
                        </button>

                        {isAuthenticated && (
                          <>
                            <button
                              onClick={() => setWishlistModalOpen(true)}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-left group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 relative">
                                <Heart size={17} className="text-red-500" />
                                {wishlistCount > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {wishlistCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between flex-1">
                                <span className="font-medium text-sm">Wishlist</span>
                                {wishlistCount > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {wishlistCount} items
                                  </span>
                                )}
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate("/account");
                                scrollToTopInstant();
                              }}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/8 hover:text-primary transition-all text-left group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                                <UserCircle size={17} className="text-primary" />
                              </div>
                              <span className="font-medium text-sm">My Account</span>
                            </button>

                            <button
                              onClick={() => {
                                navigate("/my-orders");
                                scrollToTopInstant();
                              }}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/8 hover:text-primary transition-all text-left group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 relative group-hover:bg-primary/15 transition-colors">
                                <Package size={17} className="text-primary" />
                                {userOrdersCount > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {userOrdersCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between flex-1">
                                <span className="font-medium text-sm">My Orders</span>
                                {userOrdersCount > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {userOrdersCount} orders
                                  </span>
                                )}
                              </div>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            navigate("/cart");
                            scrollToTopInstant();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/8 hover:text-primary transition-all text-left group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 relative group-hover:bg-primary/15 transition-colors">
                            <ShoppingCart size={17} className="text-primary" />
                            {itemCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {itemCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between flex-1">
                            <span className="font-medium text-sm">Cart</span>
                            {itemCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {itemCount} items
                              </span>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Auth buttons if not logged in */}
                      {!isAuthenticated && (
                        <div className="px-4 pb-4 space-y-2">
                          <Button
                            onClick={() => {
                              navigate("/signup");
                              scrollToTopInstant();
                            }}
                            className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary-hover shadow-sm"
                          >
                            Create account
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigate("/login");
                              scrollToTopInstant();
                            }}
                            className="w-full h-11 rounded-xl font-medium border-border/60"
                          >
                            Log in
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Footer */}
                    <div className="p-4 border-t border-border/60 space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl">
                        <MapPin size={14} className="text-primary flex-shrink-0" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Delivering to Accra & Kumasi
                        </span>
                      </div>
                      {isAuthenticated && (
                        <button
                          onClick={async () => {
                            await logout();
                            navigate("/", { replace: true });
                            scrollToTopInstant();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-destructive/8 text-destructive transition-all text-sm font-medium"
                        >
                          <LogOut size={15} />
                          <span>Log out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Wishlist Modal */}
      <GeneralWishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
      />
    </>
  );
};

export default Header;
