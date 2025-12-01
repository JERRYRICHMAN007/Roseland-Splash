import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { getGeneralWishlistItems } from "@/services/generalWishlistService";
import { useAuth } from "@/contexts/AuthContext";
import GeneralWishlistModal from "./GeneralWishlistModal";

const FloatingWishlistButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  const loadWishlistCount = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const result = await getGeneralWishlistItems();
      if (result.success && result.data) {
        setWishlistCount(result.data.length);
      }
    } catch (error) {
      console.error("Error loading wishlist count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 flex items-center justify-center p-0"
        size="icon"
        aria-label="Wishlist"
      >
        <Heart className="h-6 w-6" fill={isOpen ? "currentColor" : "none"} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </Button>

      <GeneralWishlistModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          loadWishlistCount(); // Refresh count when modal closes
        }}
        onItemRemoved={loadWishlistCount}
      />
    </>
  );
};

export default FloatingWishlistButton;

