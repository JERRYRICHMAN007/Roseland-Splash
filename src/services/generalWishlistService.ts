/**
 * General Wishlist Service
 * Handles all database operations for general product wishlist
 */

import { getSupabaseClient } from "@/lib/supabase";

export interface GeneralWishlistItem {
  id: string;
  user_id: string | null;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_variant?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to check if Supabase is available
const isSupabaseAvailable = () => {
  const client = getSupabaseClient();
  return client !== null;
};

/**
 * Add a product to the general wishlist
 */
export const addToGeneralWishlist = async (
  productId: number,
  productName: string,
  productPrice: number,
  productImage: string,
  productVariant?: string
): Promise<{ success: boolean; error?: string; data?: GeneralWishlistItem }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    console.log("📝 Adding product to general wishlist:", {
      productId,
      productName,
      productVariant,
      userId: userId || "anonymous",
    });

    const { data, error } = await supabase
      .from("general_wishlist")
      .insert({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        product_variant: productVariant || null,
      })
      .select()
      .single();

    if (error) {
      // If it's a unique constraint violation, the item already exists
      if (error.code === "23505") {
        return {
          success: false,
          error: "This product is already in your wishlist",
        };
      }
      console.error("❌ Error adding to wishlist:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Product added to wishlist successfully:", data);
    return { success: true, data: data as GeneralWishlistItem };
  } catch (error: any) {
    console.error("❌ Exception adding to wishlist:", error);
    return { success: false, error: error.message || "Failed to add to wishlist" };
  }
};

/**
 * Get all wishlist items for the current user
 */
export const getGeneralWishlistItems = async (): Promise<{
  success: boolean;
  error?: string;
  data?: GeneralWishlistItem[];
}> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, data: [] }; // No user, return empty array
    }

    console.log("📋 Fetching general wishlist items for user:", user.id);

    const { data, error } = await supabase
      .from("general_wishlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching wishlist items:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Found ${data?.length || 0} wishlist items`);
    return { success: true, data: (data || []) as GeneralWishlistItem[] };
  } catch (error: any) {
    console.error("❌ Exception fetching wishlist items:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch wishlist items",
    };
  }
};

/**
 * Check if a product is in the wishlist
 */
export const isProductInWishlist = async (
  productId: number,
  productVariant?: string
): Promise<{ success: boolean; isInWishlist: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, isInWishlist: false, error: "Database not configured" };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, isInWishlist: false };
    }

    let query = supabase
      .from("general_wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (productVariant) {
      query = query.eq("product_variant", productVariant);
    } else {
      query = query.is("product_variant", null);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error("❌ Error checking wishlist:", error);
      return { success: false, isInWishlist: false, error: error.message };
    }

    return { success: true, isInWishlist: (data?.length || 0) > 0 };
  } catch (error: any) {
    console.error("❌ Exception checking wishlist:", error);
    return {
      success: false,
      isInWishlist: false,
      error: error.message || "Failed to check wishlist",
    };
  }
};

/**
 * Remove a product from the wishlist by product ID and variant
 */
export const removeFromGeneralWishlistByProduct = async (
  productId: number,
  productVariant?: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    console.log("🗑️ Removing product from wishlist:", {
      productId,
      productVariant,
      userId: user.id,
    });

    let query = supabase
      .from("general_wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (productVariant) {
      query = query.eq("product_variant", productVariant);
    } else {
      query = query.is("product_variant", null);
    }

    const { error } = await query;

    if (error) {
      console.error("❌ Error removing from wishlist:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Product removed from wishlist successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception removing from wishlist:", error);
    return {
      success: false,
      error: error.message || "Failed to remove from wishlist",
    };
  }
};

/**
 * Remove a product from the wishlist by wishlist item ID
 */
export const removeFromGeneralWishlist = async (
  wishlistItemId: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    console.log("🗑️ Removing product from wishlist:", wishlistItemId);

    const { error } = await supabase
      .from("general_wishlist")
      .delete()
      .eq("id", wishlistItemId);

    if (error) {
      console.error("❌ Error removing from wishlist:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Product removed from wishlist successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception removing from wishlist:", error);
    return {
      success: false,
      error: error.message || "Failed to remove from wishlist",
    };
  }
};

