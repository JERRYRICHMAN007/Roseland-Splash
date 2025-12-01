/**
 * Wishlist Service for Category Wishlist Feature
 * Handles all database operations for category wishlist items
 */

import { getSupabaseClient } from "@/lib/supabase";

export interface WishlistItem {
  id: string;
  user_id: string | null;
  category_id: string;
  item_name: string;
  item_description?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to check if Supabase is available
const isSupabaseAvailable = () => {
  const client = getSupabaseClient();
  return client !== null;
};

/**
 * Add an item to the wishlist for a specific category
 */
export const addWishlistItem = async (
  categoryId: string,
  itemName: string,
  itemDescription?: string
): Promise<{ success: boolean; error?: string; data?: WishlistItem }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    console.log("📝 Adding wishlist item:", {
      categoryId,
      itemName,
      itemDescription,
      userId: userId || "anonymous",
    });

    const { data, error } = await supabase
      .from("category_wishlist")
      .insert({
        user_id: userId,
        category_id: categoryId,
        item_name: itemName,
        item_description: itemDescription || null,
      })
      .select()
      .single();

    if (error) {
      // If it's a unique constraint violation, the item already exists
      if (error.code === "23505") {
        return {
          success: false,
          error: "This item is already in your wishlist for this category",
        };
      }
      console.error("❌ Error adding wishlist item:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Wishlist item added successfully:", data);
    return { success: true, data: data as WishlistItem };
  } catch (error: any) {
    console.error("❌ Exception adding wishlist item:", error);
    return { success: false, error: error.message || "Failed to add wishlist item" };
  }
};

/**
 * Get all wishlist items for a specific category
 */
export const getWishlistItems = async (
  categoryId: string
): Promise<{ success: boolean; error?: string; data?: WishlistItem[] }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    console.log("📋 Fetching wishlist items for category:", categoryId);

    const { data, error } = await supabase
      .from("category_wishlist")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching wishlist items:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Found ${data?.length || 0} wishlist items`);
    return { success: true, data: (data || []) as WishlistItem[] };
  } catch (error: any) {
    console.error("❌ Exception fetching wishlist items:", error);
    return { success: false, error: error.message || "Failed to fetch wishlist items" };
  }
};

/**
 * Get wishlist items for the current user
 */
export const getUserWishlistItems = async (
  categoryId?: string
): Promise<{ success: boolean; error?: string; data?: WishlistItem[] }> => {
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

    console.log("📋 Fetching user wishlist items:", {
      userId: user.id,
      categoryId: categoryId || "all",
    });

    let query = supabase
      .from("category_wishlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching user wishlist items:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Found ${data?.length || 0} user wishlist items`);
    return { success: true, data: (data || []) as WishlistItem[] };
  } catch (error: any) {
    console.error("❌ Exception fetching user wishlist items:", error);
    return { success: false, error: error.message || "Failed to fetch user wishlist items" };
  }
};

/**
 * Delete a wishlist item
 */
export const deleteWishlistItem = async (
  itemId: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    console.log("🗑️ Deleting wishlist item:", itemId);

    const { error } = await supabase
      .from("category_wishlist")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("❌ Error deleting wishlist item:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Wishlist item deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception deleting wishlist item:", error);
    return { success: false, error: error.message || "Failed to delete wishlist item" };
  }
};

