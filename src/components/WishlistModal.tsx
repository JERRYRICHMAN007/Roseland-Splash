import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart, Trash2, Loader2 } from "lucide-react";
import { getWishlistItems, deleteWishlistItem, getUserWishlistItems } from "@/services/wishlistService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { WishlistItem } from "@/services/wishlistService";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

const WishlistModal = ({ isOpen, onClose, categoryId, categoryName }: WishlistModalProps) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadWishlistItems();
    }
  }, [isOpen, categoryId]);

  const loadWishlistItems = async () => {
    setIsLoading(true);
    try {
      // If user is authenticated, show their items; otherwise show all items
      const result = isAuthenticated
        ? await getUserWishlistItems(categoryId)
        : await getWishlistItems(categoryId);

      if (result.success) {
        setWishlistItems(result.data || []);
      } else {
        toast({
          title: "Error loading wishlist",
          description: result.error || "Failed to load wishlist items.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load wishlist items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete wishlist items.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(itemId);
    try {
      const result = await deleteWishlistItem(itemId);
      if (result.success) {
        toast({
          title: "Item removed",
          description: "The item has been removed from your wishlist.",
        });
        // Reload wishlist items
        await loadWishlistItems();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete item.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              Wishlist for {categoryName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated
                ? "Items you've suggested for this category"
                : "All suggested items for this category"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No items in the wishlist yet. Be the first to suggest something!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map((item) => {
                const canDelete = isAuthenticated && item.user_id === user?.id;
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">
                            {item.item_name}
                          </h4>
                          {item.item_description && (
                            <p className="text-sm text-muted-foreground">
                              {item.item_description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Suggested on{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="flex-shrink-0"
                          >
                            {isDeleting === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;

