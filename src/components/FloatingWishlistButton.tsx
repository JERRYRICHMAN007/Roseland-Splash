import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlistCount } from "@/contexts/WishlistCountContext";
import GeneralWishlistModal from "./GeneralWishlistModal";

const FloatingWishlistButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { count: wishlistCount } = useWishlistCount();

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
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default FloatingWishlistButton;
