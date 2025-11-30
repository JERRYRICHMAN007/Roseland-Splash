/**
 * Database Connection Test Utility
 * Use this to verify Supabase connection and test queries
 */

import { getSupabaseClient } from "@/lib/supabase";

export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return {
      success: false,
      message: "❌ Supabase client not initialized. Check your .env file.",
    };
  }

  try {
    // Test 1: Check if we can query orders table
    console.log("🔍 Testing database connection...");
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .limit(1);
    
    if (ordersError) {
      console.error("❌ Orders table error:", ordersError);
      return {
        success: false,
        message: `❌ Cannot access orders table: ${ordersError.message}`,
        details: ordersError,
      };
    }

    // Test 2: Check if we can query user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);
    
    if (profilesError) {
      console.error("❌ User profiles table error:", profilesError);
      return {
        success: false,
        message: `❌ Cannot access user_profiles table: ${profilesError.message}`,
        details: profilesError,
      };
    }

    // Test 3: Check if we can query order_items table
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id")
      .limit(1);
    
    if (itemsError) {
      console.error("❌ Order items table error:", itemsError);
      return {
        success: false,
        message: `❌ Cannot access order_items table: ${itemsError.message}`,
        details: itemsError,
      };
    }

    console.log("✅ Database connection successful!");
    console.log("📊 Tables accessible:");
    console.log(`  - orders: ${orders ? "✅" : "❌"}`);
    console.log(`  - user_profiles: ${profiles ? "✅" : "❌"}`);
    console.log(`  - order_items: ${orderItems ? "✅" : "❌"}`);

    return {
      success: true,
      message: "✅ Database connection successful! All tables are accessible.",
      details: {
        ordersCount: orders?.length || 0,
        profilesCount: profiles?.length || 0,
        orderItemsCount: orderItems?.length || 0,
      },
    };
  } catch (error: any) {
    console.error("❌ Database connection test failed:", error);
    return {
      success: false,
      message: `❌ Database connection test failed: ${error.message}`,
      details: error,
    };
  }
};

// Run test on import (for debugging)
if (import.meta.env.MODE === 'development') {
  // Don't auto-run, let it be called explicitly
}

