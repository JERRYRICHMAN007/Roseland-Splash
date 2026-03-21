import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  /** Ghana-style bundle: e.g. 3 for 5 cedis — quantity in cart = number of bundles */
  bundleQuantity?: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const addQty = Math.max(1, action.payload.quantity ?? 1);
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.variant === action.payload.variant
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id &&
          item.variant === action.payload.variant
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      } else {
        const { quantity: _q, ...rest } = action.payload;
        newItems = [...state.items, { ...rest, quantity: addQty }];
      }

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case "CLEAR_CART":
      return initialState;

    case "LOAD_CART": {
      const { total, itemCount } = calculateTotals(action.payload);
      return { items: action.payload, total, itemCount };
    }

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "rs_basket";

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CART_STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item === "object" &&
        typeof (item as CartItem).id === "string" &&
        typeof (item as CartItem).name === "string" &&
        typeof (item as CartItem).price === "number" &&
        typeof (item as CartItem).quantity === "number" &&
        typeof (item as CartItem).image === "string"
    );
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    if (typeof window !== "undefined") {
      if (items.length === 0) localStorage.removeItem(CART_STORAGE_KEY);
      else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // ignore
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Restore cart from localStorage on mount (e.g. after login redirect)
  useEffect(() => {
    const stored = loadCartFromStorage();
    if (stored.length > 0) {
      dispatch({ type: "LOAD_CART", payload: stored });
    }
  }, []);

  // Persist cart whenever items change so it survives login redirect / refresh
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
