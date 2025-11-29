import React, { createContext, useContext, useReducer, useEffect } from "react";

export type OrderStatus = "processing" | "delivering" | "delivered";

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
  | { type: "LOAD_ORDERS"; payload: Order[] };

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
    default:
      return state;
  }
};

interface OrderContextType extends OrderState {
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        dispatch({ type: "LOAD_ORDERS", payload: orders });
      } catch (error) {
        console.error("Error loading orders from localStorage:", error);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(state.orders));
  }, [state.orders]);

  const generateOrderNumber = (): string => {
    return `RS${Date.now().toString().slice(-8)}`;
  };

  const addOrder = (
    orderData: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">
  ): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: generateOrderNumber(),
      status: "processing",
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_ORDER", payload: newOrder });
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { id, status } });
  };

  const getOrder = (id: string): Order | undefined => {
    return state.orders.find((order) => order.id === id);
  };

  const getOrdersByPhone = (phone: string): Order[] => {
    return state.orders.filter((order) => order.customerPhone === phone);
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        addOrder,
        updateOrderStatus,
        getOrder,
        getOrdersByPhone,
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

