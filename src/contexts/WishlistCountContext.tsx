import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGeneralWishlistItems,
  type GeneralWishlistItem,
} from "@/services/generalWishlistService";

interface WishlistCountContextValue {
  count: number;
  items: GeneralWishlistItem[];
  hasCache: boolean;
  isInitialLoading: boolean;
  setCount: (count: number) => void;
  adjustCount: (delta: number) => void;
  refreshCount: () => Promise<void>;
  refreshItems: (options?: { silent?: boolean }) => Promise<void>;
  addItemToCache: (item: GeneralWishlistItem) => void;
  removeItemFromCache: (itemId: string) => void;
  removeItemFromCacheByProduct: (
    productId: number,
    productVariant?: string
  ) => void;
}

const WishlistCountContext = createContext<WishlistCountContextValue | undefined>(
  undefined
);

export const WishlistCountProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<GeneralWishlistItem[]>([]);
  const [hasCache, setHasCache] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const fetchInFlight = useRef(false);

  const applyItems = useCallback((data: GeneralWishlistItem[]) => {
    setItems(data);
    setCount(data.length);
    setHasCache(true);
  }, []);

  const refreshItems = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isAuthenticated) {
        setItems([]);
        setCount(0);
        setHasCache(false);
        return;
      }

      const silent = options?.silent ?? false;
      if (!silent && !hasCache) {
        setIsInitialLoading(true);
      }

      if (fetchInFlight.current) return;
      fetchInFlight.current = true;

      try {
        const result = await getGeneralWishlistItems();
        if (result.success && result.data) {
          applyItems(result.data);
        }
      } catch (error) {
        console.error("Error refreshing wishlist items:", error);
      } finally {
        fetchInFlight.current = false;
        if (!silent) {
          setIsInitialLoading(false);
        }
      }
    },
    [isAuthenticated, hasCache, applyItems]
  );

  const refreshCount = useCallback(async () => {
    await refreshItems({ silent: hasCache });
  }, [refreshItems, hasCache]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshItems();
    } else {
      setItems([]);
      setCount(0);
      setHasCache(false);
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps -- load once per auth session

  const adjustCount = useCallback((delta: number) => {
    setCount((prev) => Math.max(0, prev + delta));
  }, []);

  const addItemToCache = useCallback((item: GeneralWishlistItem) => {
    setItems((prev) => {
      const exists = prev.some(
        (i) =>
          i.product_id === item.product_id &&
          (i.product_variant ?? null) === (item.product_variant ?? null)
      );
      if (exists) return prev;
      const next = [item, ...prev];
      setCount(next.length);
      setHasCache(true);
      return next;
    });
  }, []);

  const removeItemFromCache = useCallback((itemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== itemId);
      setCount(next.length);
      return next;
    });
  }, []);

  const removeItemFromCacheByProduct = useCallback(
    (productId: number, productVariant?: string) => {
      setItems((prev) => {
        const next = prev.filter(
          (i) =>
            !(
              i.product_id === productId &&
              (productVariant
                ? i.product_variant === productVariant
                : i.product_variant == null)
            )
        );
        setCount(next.length);
        return next;
      });
    },
    []
  );

  return (
    <WishlistCountContext.Provider
      value={{
        count,
        items,
        hasCache,
        isInitialLoading,
        setCount,
        adjustCount,
        refreshCount,
        refreshItems,
        addItemToCache,
        removeItemFromCache,
        removeItemFromCacheByProduct,
      }}
    >
      {children}
    </WishlistCountContext.Provider>
  );
};

export const useWishlistCount = () => {
  const context = useContext(WishlistCountContext);
  if (!context) {
    throw new Error("useWishlistCount must be used within WishlistCountProvider");
  }
  return context;
};
