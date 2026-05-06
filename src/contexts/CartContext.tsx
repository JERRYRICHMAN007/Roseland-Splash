import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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

/** Composite identity for cart lines */
export const itemKey = (id: string, variant?: string) =>
  `${id}|${variant ?? ""}`;

const lineKeyFromItem = (item: CartItem) => itemKey(item.id, item.variant);

/** Same composite identity as ADD_ITEM (id + optional variant) */
export type CartLineRef = { id: string; variant?: string };

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: CartLineRef }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; variant?: string; quantity: number } }
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
      const targetKey = itemKey(action.payload.id, action.payload.variant);
      const existingItem = state.items.find(
        (item) => lineKeyFromItem(item) === targetKey
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          lineKeyFromItem(item) === targetKey
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
      const ref = action.payload;
      const refKey = itemKey(ref.id, ref.variant);
      const newItems = state.items.filter(
        (item) => lineKeyFromItem(item) !== refKey
      );
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }

    case "UPDATE_QUANTITY": {
      const targetKey = itemKey(action.payload.id, action.payload.variant);
      const newItems = state.items
        .map((item) =>
          lineKeyFromItem(item) === targetKey
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
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CART_STORAGE_KEY = "rs_basket";

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(CART_STORAGE_KEY)
        : null;
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

/** DB row shape for `cart_items` (create table in Supabase if missing). */
interface CartItemRow {
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant: string | null;
  bundle_quantity: number | null;
}

function rowToCartItem(row: Record<string, unknown>): CartItem | null {
  const product_id = row.product_id;
  const name = row.name;
  const price = row.price;
  const image = row.image;
  const quantity = row.quantity;
  if (
    typeof product_id !== "string" ||
    typeof name !== "string" ||
    typeof price !== "number" ||
    typeof image !== "string" ||
    typeof quantity !== "number"
  ) {
    return null;
  }
  const variant =
    row.variant === null || row.variant === undefined
      ? undefined
      : String(row.variant);
  const bundleQty = row.bundle_quantity;
  const cart: CartItem = {
    id: product_id,
    name,
    price,
    image,
    quantity,
    ...(variant !== undefined && variant !== "" ? { variant } : {}),
  };
  if (typeof bundleQty === "number") cart.bundleQuantity = bundleQty;
  return cart;
}

function mergeCartLines(server: CartItem[], guest: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();

  for (const it of server) {
    map.set(lineKeyFromItem(it), { ...it });
  }
  for (const g of guest) {
    const k = lineKeyFromItem(g);
    const ex = map.get(k);
    if (ex) {
      map.set(k, { ...ex, quantity: ex.quantity + g.quantity });
    } else {
      map.set(k, { ...g });
    }
  }
  return Array.from(map.values());
}

type FetchCartResult = { items: CartItem[]; error: boolean };

async function fetchCartFromSupabase(userId: string): Promise<FetchCartResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { items: [], error: false };
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("[cart] fetchCartFromSupabase:", error);
      return { items: [], error: true };
    }
    const out: CartItem[] = [];
    for (const row of data ?? []) {
      const item = rowToCartItem(row as Record<string, unknown>);
      if (item) out.push(item);
    }
    return { items: out, error: false };
  } catch (e) {
    console.error("[cart] fetchCartFromSupabase:", e);
    return { items: [], error: true };
  }
}

async function syncCartToSupabase(
  userId: string,
  items: CartItem[]
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    if (delErr) {
      console.error("[cart] syncCartToSupabase delete:", delErr);
      return;
    }
    if (items.length === 0) return;

    const rows: CartItemRow[] = items.map((item) => ({
      user_id: userId,
      product_id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      variant: item.variant ?? null,
      bundle_quantity: item.bundleQuantity ?? null,
    }));

    const { error: insErr } = await supabase.from("cart_items").insert(rows);
    if (insErr) console.error("[cart] syncCartToSupabase insert:", insErr);
  } catch (e) {
    console.error("[cart] syncCartToSupabase:", e);
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isLoading: authLoading } = useAuth();
  const hydratedRef = useRef(false);
  const mutatedRef = useRef(false);
  /** After failed server fetch during hydration: avoid syncing until user mutates (would overwrite/delete server). */
  const hydrationFetchFailedRef = useRef(false);
  const lastHydratedUserIdRef = useRef<string | undefined>(undefined);

  // Hydrate cart when auth is ready: logged-in → server vs localStorage + merge; guest → localStorage only
  useEffect(() => {
    hydratedRef.current = false;
    hydrationFetchFailedRef.current = false;

    if (user?.id !== lastHydratedUserIdRef.current) {
      mutatedRef.current = false;
      lastHydratedUserIdRef.current = user?.id;
    }

    if (authLoading) return;

    if (!user?.id) {
      const stored = loadCartFromStorage();
      if (stored.length > 0) {
        dispatch({ type: "LOAD_CART", payload: stored });
      }
      hydratedRef.current = true;
      return;
    }

    let cancelled = false;
    (async () => {
      const guest = loadCartFromStorage();
      const { items: serverItems, error: fetchError } =
        await fetchCartFromSupabase(user.id);
      if (cancelled) return;

      if (fetchError) {
        hydrationFetchFailedRef.current = true;
        const stored = loadCartFromStorage();
        if (stored.length > 0) {
          dispatch({ type: "LOAD_CART", payload: stored });
        }
        hydratedRef.current = true;
        return;
      }

      if (guest.length > 0 && serverItems.length > 0) {
        const next = mergeCartLines(serverItems, guest);
        dispatch({ type: "LOAD_CART", payload: next });
        localStorage.removeItem(CART_STORAGE_KEY);
      } else if (guest.length > 0) {
        dispatch({ type: "LOAD_CART", payload: guest });
        localStorage.removeItem(CART_STORAGE_KEY);
      } else if (serverItems.length > 0) {
        dispatch({ type: "LOAD_CART", payload: serverItems });
      }

      hydratedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  // Persist guest cart to localStorage when items change (skip while logged-in hydration pending — avoids wiping rs_basket before merge)
  useEffect(() => {
    if (user?.id && !hydratedRef.current) return;
    saveCartToStorage(state.items);
  }, [state.items, user?.id]);

  // Sync logged-in cart to Supabase after mutations (and once hydrated)
  useEffect(() => {
    if (authLoading || !user?.id || !hydratedRef.current) return;
    if (hydrationFetchFailedRef.current && !mutatedRef.current) return;
    if (!mutatedRef.current && state.items.length === 0) return;
    void syncCartToSupabase(user.id, state.items);
  }, [authLoading, user?.id, state.items]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    mutatedRef.current = true;
    hydrationFetchFailedRef.current = false;
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string, variant?: string) => {
    mutatedRef.current = true;
    hydrationFetchFailedRef.current = false;
    dispatch({ type: "REMOVE_ITEM", payload: { id, variant } });
  };

  const updateQuantity = (id: string, quantity: number, variant?: string) => {
    mutatedRef.current = true;
    hydrationFetchFailedRef.current = false;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, variant, quantity } });
  };

  const clearCart = () => {
    mutatedRef.current = true;
    hydrationFetchFailedRef.current = false;
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
