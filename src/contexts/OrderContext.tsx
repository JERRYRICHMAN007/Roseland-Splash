import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import * as db from "@/services/databaseService";
import { getSupabaseClient } from "@/lib/supabase";
import * as backendApi from "@/services/backendApi";

export type OrderStatus =
  | "processing"
  | "paid"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  products: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
  }>;
  location: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryMethod: string;
  /** Preferred delivery window (e.g. "8:00 AM – 12:00 PM"); merged into special_instructions in DB */
  deliveryTimeWindow?: string;
  specialInstructions?: string;
  status: OrderStatus;
  createdAt: string;
  receivedAt?: string;
  deliveredAt?: string;
}

interface OrderState {
  orders: Order[];
}

type OrderAction =
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { id: string; status: OrderStatus } }
  | { type: "LOAD_ORDERS"; payload: Order[] }
  | { type: "CLEAR_ALL_ORDERS" }
  | { type: "CANCEL_ORDER"; payload: { id: string } };

const initialState: OrderState = {
  orders: [],
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "ADD_ORDER": {
      return {
        orders: [action.payload, ...state.orders],
      };
    }
    case "UPDATE_ORDER_STATUS": {
      const { id, status } = action.payload;
      const updatedOrders = state.orders.map((order) => {
        if (order.id === id) {
          const update: Partial<Order> = { status };
          if (status === "delivering" && !order.receivedAt) {
            update.receivedAt = new Date().toISOString();
          }
          if (status === "delivered" && !order.deliveredAt) {
            update.deliveredAt = new Date().toISOString();
          }
          return { ...order, ...update };
        }
        return order;
      });
      return { orders: updatedOrders };
    }
    case "LOAD_ORDERS": {
      return { orders: action.payload };
    }
    case "CLEAR_ALL_ORDERS": {
      return { orders: [] };
    }
    case "CANCEL_ORDER": {
      // Only cancel orders that are in "processing" status
      // Remove cancelled orders from the list (cleared)
      return {
        orders: state.orders.filter((order) => {
          if (order.id === action.payload.id && order.status === "processing") {
            return false; // Remove this order (cancelled and cleared)
          }
          return true; // Keep all other orders
        }),
      };
    }
    default:
      return state;
  }
};

interface OrderContextType extends OrderState {
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];
  getOrdersByUser: (phone?: string, email?: string) => Order[];
  clearAllOrders: () => void;
  cancelOrder: (id: string) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders from database on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Function to load orders from database
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      console.log("📦 Loading orders from database...");
      const orders = await db.getAllOrders();
      if (orders && orders.length > 0) {
        console.log(`✅ Loaded ${orders.length} orders from database`);
        dispatch({ type: "LOAD_ORDERS", payload: orders });
      } else {
        console.log("ℹ️ No orders found in database");
        dispatch({ type: "LOAD_ORDERS", payload: [] });
      }
    } catch (error) {
      console.error("❌ Error loading orders from database:", error);
      // Don't fallback to localStorage - show empty state
      dispatch({ type: "LOAD_ORDERS", payload: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh orders from database
  const refreshOrders = async () => {
    await loadOrders();
  };

  const generateOrderNumber = (): string => {
    return `RS${Date.now().toString().slice(-8)}`;
  };

  const addOrder = async (
    orderData: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">
  ): Promise<Order> => {
    console.log("💾 Saving order to database...", orderData);
    try {
      // Save to database
      const newOrder = await db.createOrder(orderData);
      console.log("✅ Order saved to database successfully:", newOrder.id);
      
      // Update local state
      dispatch({ type: "ADD_ORDER", payload: newOrder });
      
      return newOrder;
    } catch (error: any) {
      console.error("❌ Error creating order in database:", error);
      throw new Error(`Failed to save order: ${error.message || "Unknown error"}`);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    console.log(`🔄 Updating order ${id} status to ${status}...`);
    try {
      // Update in database
      const updatedOrder = await db.updateOrderStatus(id, status);
      
      if (updatedOrder) {
        console.log(`✅ Order ${id} status updated successfully`);
        // Update local state
        dispatch({ type: "UPDATE_ORDER_STATUS", payload: { id, status } });
      } else {
        console.error(`❌ Failed to update order ${id} status`);
        throw new Error("Failed to update order status in database");
      }
    } catch (error: any) {
      console.error("❌ Error updating order status in database:", error);
      throw new Error(`Failed to update order status: ${error.message || "Unknown error"}`);
    }
  };

  const getOrder = (id: string): Order | undefined => {
    return state.orders.find((order) => order.id === id);
  };

  const getOrdersByPhone = (phone: string): Order[] => {
    return state.orders.filter((order) => order.customerPhone === phone);
  };

  const getOrdersByUser = (phone?: string, email?: string): Order[] => {
    if (!phone && !email) return [];
    return state.orders.filter((order) => {
      const phoneMatch = phone ? order.customerPhone === phone : false;
      const emailMatch = email && order.customerEmail ? order.customerEmail.toLowerCase() === email.toLowerCase() : false;
      return phoneMatch || emailMatch;
    });
  };

  const clearAllOrders = () => {
    // Clear the state only (orders remain in database)
    // Note: This only clears local state, not database records
    dispatch({ type: "CLEAR_ALL_ORDERS" });
  };

  const cancelOrder = async (id: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`🚫 Cancelling order ${id}...`);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, message: "App configuration error. Please try again later." };
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, message: "Please sign in to cancel an order." };
      }

      const res = await backendApi.cancelOrderApi(id, session.access_token);
      if (res.success) {
        console.log(`✅ Order ${id} cancelled successfully`);
        dispatch({ type: "CANCEL_ORDER", payload: { id } });
        return { success: true };
      }
      console.error(`❌ Failed to cancel order ${id}`, res.error);
      return { success: false, message: res.error || "Could not cancel this order." };
    } catch (error: any) {
      console.error("❌ Error cancelling order:", error);
      return { success: false, message: error.message || "Could not cancel this order." };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        addOrder,
        updateOrderStatus,
        getOrder,
        getOrdersByPhone,
        getOrdersByUser,
        clearAllOrders,
        cancelOrder,
        isLoading,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

