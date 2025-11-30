/**
 * Database Service for Supabase
 * Handles all database operations for orders
 */

import { getSupabaseClient } from "@/lib/supabase";
import { Order, OrderStatus } from "@/contexts/OrderContext";

// Helper to check if Supabase is available
const isSupabaseAvailable = () => {
  const client = getSupabaseClient();
  return client !== null;
};

export interface DatabaseOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  location: string;
  total_amount: number;
  payment_method: string;
  delivery_method: string;
  special_instructions?: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  received_at?: string | null;
  delivered_at?: string | null;
}

export interface DatabaseOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_variant?: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

/**
 * Convert database order to app order format
 */
const convertDbOrderToOrder = (
  dbOrder: DatabaseOrder,
  items: DatabaseOrderItem[]
): Order => {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    customerEmail: dbOrder.customer_email,
    products: items.map((item) => ({
      name: item.product_name,
      variant: item.product_variant || undefined,
      quantity: item.quantity,
      price: item.price,
    })),
    location: dbOrder.location,
    totalAmount: parseFloat(dbOrder.total_amount.toString()),
    paymentMethod: dbOrder.payment_method,
    deliveryMethod: dbOrder.delivery_method,
    specialInstructions: dbOrder.special_instructions || undefined,
    status: dbOrder.status,
    createdAt: dbOrder.created_at,
    receivedAt: dbOrder.received_at || undefined,
    deliveredAt: dbOrder.delivered_at || undefined,
  };
};

/**
 * Create a new order in the database
 */
export const createOrder = async (
  orderData: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">
): Promise<Order> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error("Database not configured");
  }
  
  try {
    // Generate order number
    const orderNumber = `RS${Date.now().toString().slice(-8)}`;

    console.log("📝 Creating order in database:", {
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      totalAmount: orderData.totalAmount,
      productCount: orderData.products.length,
    });

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        location: orderData.location,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        delivery_method: orderData.deliveryMethod,
        special_instructions: orderData.specialInstructions,
        status: "processing",
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      console.error("Error details:", {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      });
      throw orderError;
    }

    if (!order) {
      console.error("❌ No order data returned from insert");
      throw new Error("Failed to create order - no data returned");
    }

    console.log("✅ Order created successfully:", order.id);

    // Insert order items
    const orderItems = orderData.products.map((product) => ({
      order_id: order.id,
      product_name: product.name,
      product_variant: product.variant || null,
      quantity: product.quantity,
      price: product.price,
    }));
    
    console.log(`📦 Inserting ${orderItems.length} order items...`);
    const { error: itemsError, data: insertedItems } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error("❌ Error creating order items:", itemsError);
      console.error("Items error details:", {
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
      });
      throw itemsError;
    }

    console.log(`✅ Created ${insertedItems?.length || 0} order items`);

    // Fetch complete order with items
    const completeOrder = await getOrder(order.id);
    if (!completeOrder) {
      throw new Error("Failed to fetch created order");
    }

    return completeOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Get a single order by ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return null;
    }

    if (!order) {
      return null;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .eq("order_id", orderId)
      .select();

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return null;
    }

    return convertDbOrderToOrder(order, items || []);
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

/**
 * Get all orders
 */
export const getAllOrders = async (): Promise<Order[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("⚠️ Supabase client not available - cannot fetch orders");
    return [];
  }
  
  try {
    console.log("📦 Fetching all orders from database...");
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error("❌ Error fetching orders:", orderError);
      console.error("Error details:", {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      });
      return [];
    }

    if (!orders || orders.length === 0) {
      console.log("ℹ️ No orders found in database");
      return [];
    }

    console.log(`✅ Found ${orders.length} orders in database`);

    // Fetch items for all orders
    const orderIds = orders.map((o) => o.id);
    
    // Only fetch items if there are orders
    let items: DatabaseOrderItem[] = [];
    if (orderIds.length > 0) {
      const { data: fetchedItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else {
        items = fetchedItems || [];
      }
    }

    // Group items by order
    const itemsByOrder = (items || []).reduce(
      (acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      },
      {} as Record<string, DatabaseOrderItem[]>
    );

    // Convert to app format
    return orders.map((order) =>
      convertDbOrderToOrder(order, itemsByOrder[order.id] || [])
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

/**
 * Get orders by phone number
 */
export const getOrdersByPhone = async (phone: string): Promise<Order[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  try {
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error("Error fetching orders by phone:", orderError);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Fetch items for all orders
    const orderIds = orders.map((o) => o.id);
    
    // Only fetch items if there are orders
    let items: DatabaseOrderItem[] = [];
    if (orderIds.length > 0) {
      const { data: fetchedItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else {
        items = fetchedItems || [];
      }
    }

    // Group items by order
    const itemsByOrder = (items || []).reduce(
      (acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      },
      {} as Record<string, DatabaseOrderItem[]>
    );

    return orders.map((order) =>
      convertDbOrderToOrder(order, itemsByOrder[order.id] || [])
    );
  } catch (error) {
    console.error("Error fetching orders by phone:", error);
    return [];
  }
};

/**
 * Get orders by user (phone or email)
 */
export const getOrdersByUser = async (
  phone?: string,
  email?: string
): Promise<Order[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  try {
    let query = supabase.from("orders").select("*");

    if (phone && email) {
      query = query.or(`customer_phone.eq.${phone},customer_email.eq.${email}`);
    } else if (phone) {
      query = query.eq("customer_phone", phone);
    } else if (email) {
      query = query.eq("customer_email", email);
    } else {
      return [];
    }

    const { data: orders, error: orderError } = await query.order("created_at", {
      ascending: false,
    });

    if (orderError) {
      console.error("Error fetching orders by user:", orderError);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Fetch items for all orders
    const orderIds = orders.map((o) => o.id);
    
    // Only fetch items if there are orders
    let items: DatabaseOrderItem[] = [];
    if (orderIds.length > 0) {
      const { data: fetchedItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else {
        items = fetchedItems || [];
      }
    }

    // Group items by order
    const itemsByOrder = (items || []).reduce(
      (acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      },
      {} as Record<string, DatabaseOrderItem[]>
    );

    return orders.map((order) =>
      convertDbOrderToOrder(order, itemsByOrder[order.id] || [])
    );
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    return [];
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set timestamps based on status
    if (status === "delivering") {
      updateData.received_at = new Date().toISOString();
    }
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return null;
    }

    if (!order) {
      return null;
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .eq("order_id", orderId)
      .select();

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return null;
    }

    return convertDbOrderToOrder(order, items || []);
  } catch (error) {
    console.error("Error updating order status:", error);
    return null;
  }
};

/**
 * Cancel an order (only if status is "processing")
 */
export const cancelOrder = async (orderId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  try {
    // First check if order exists and is in "processing" status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .eq("id", orderId)
      .select("status")
      .single();

    if (fetchError || !order) {
      console.error("Error fetching order for cancellation:", fetchError);
      return false;
    }

    if (order.status !== "processing") {
      console.log("Order cannot be cancelled - not in processing status");
      return false;
    }

    // Delete the order (cascades to order_items)
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (deleteError) {
      console.error("Error cancelling order:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error cancelling order:", error);
    return false;
  }
};

