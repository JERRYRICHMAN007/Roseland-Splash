import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { addWishlistItem } from "@/services/wishlistService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistButtonProps {
  categoryId: string;
  categoryName: string;
}

const WishlistButton = ({ categoryId, categoryName }: WishlistButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter a name for the item you wish to see.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addWishlistItem(
        categoryId,
        itemName.trim(),
        itemDescription.trim() || undefined
      );

      if (result.success) {
        toast({
          title: "Added to wishlist!",
          description: `Your request for "${itemName}" has been added to the ${categoryName} wishlist.`,
        });
        setItemName("");
        setItemDescription("");
        setIsOpen(false);
      } else {
        toast({
          title: "Failed to add item",
          description: result.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to wishlist.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Heart className="h-4 w-4" />
        Suggest an Item
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Suggest an Item for {categoryName}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setItemName("");
                  setItemDescription("");
                }}
              >
                ×
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Tell us what item or flavor you'd like to see in this category!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium mb-1">
                  Item/Flavor Name *
                </label>
                <input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Mango Smoothie, Vanilla MashedKe"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="itemDescription"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Any additional details about what you'd like..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground">
                  Note: You can still suggest items without an account. Your suggestions help us improve our offerings!
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setItemName("");
                    setItemDescription("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Wishlist
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WishlistButton;

