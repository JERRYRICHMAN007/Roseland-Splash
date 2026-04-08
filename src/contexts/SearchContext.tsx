import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { categoriesData } from "@/data/categories";
import { Product, ProductVariant } from "@/data/categories";

interface SearchResult {
  type: "category" | "subcategory" | "product" | "variant";
  id: string;
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  image?: string;
  categoryId?: string;
  subcategoryId?: string;
  productId?: number;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  performSearch: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/** Skip variant rows that only repeat the product name (avoids "Cowbell" + "Cowbell - Cowbell"). */
function isRedundantVariantLabel(product: Product, variant: ProductVariant): boolean {
  return (
    variant.name.toLowerCase().trim() === product.name.toLowerCase().trim()
  );
}

function productOrDescriptionMatches(product: Product, q: string): boolean {
  const qq = q.toLowerCase();
  return (
    product.name.toLowerCase().includes(qq) ||
    product.description.toLowerCase().includes(qq)
  );
}

/** Any variant label matches the query (excluding redundant same-as-product-name labels). */
function anyVariantMatches(product: Product, q: string): boolean {
  const qq = q.toLowerCase();
  return (
    product.variants?.some(
      (v) =>
        v.name.toLowerCase().includes(qq) &&
        !isRedundantVariantLabel(product, v)
    ) ?? false
  );
}

function productMatchesSearch(product: Product, q: string): boolean {
  return productOrDescriptionMatches(product, q) || anyVariantMatches(product, q);
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase().trim();

    const results: SearchResult[] = [];
    const seenProductKeys = new Set<string>();

    // Search categories
    categoriesData.forEach((category) => {
      if (
        category.name.toLowerCase().includes(lowercaseQuery) ||
        category.description.toLowerCase().includes(lowercaseQuery)
      ) {
        results.push({
          type: "category",
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
        });
      }

      // Search subcategories
      category.subcategories?.forEach((subcategory) => {
        if (
          subcategory.name.toLowerCase().includes(lowercaseQuery) ||
          subcategory.description.toLowerCase().includes(lowercaseQuery)
        ) {
          results.push({
            type: "subcategory",
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            image: subcategory.image,
            categoryId: category.id,
          });
        }

        // Search nested subcategories (like Cake in Cup)
        subcategory.subcategories?.forEach((nestedSub) => {
          if (
            nestedSub.name.toLowerCase().includes(lowercaseQuery) ||
            nestedSub.description.toLowerCase().includes(lowercaseQuery)
          ) {
            results.push({
              type: "subcategory",
              id: nestedSub.id,
              name: nestedSub.name,
              description: nestedSub.description,
              image: nestedSub.image,
              categoryId: category.id,
              subcategoryId: subcategory.id,
            });
          }

          // Search products in nested subcategories (one row per product; variants use dropdown)
          nestedSub.products?.forEach((product) => {
            if (!productMatchesSearch(product, lowercaseQuery)) return;
            const dedupeKey = `${category.id}:${nestedSub.id}:${product.id}`;
            if (seenProductKeys.has(dedupeKey)) return;
            seenProductKeys.add(dedupeKey);
            results.push({
              type: "product",
              id: product.id.toString(),
              name: product.name,
              description: product.description,
              price: product.price,
              unit: product.unit,
              image: product.image,
              categoryId: category.id,
              subcategoryId: nestedSub.id,
              productId: product.id,
            });
          });
        });

        // Search products in direct subcategories (one row per product; variants use dropdown)
        subcategory.products?.forEach((product) => {
          if (!productMatchesSearch(product, lowercaseQuery)) return;
          const dedupeKey = `${category.id}:${subcategory.id}:${product.id}`;
          if (seenProductKeys.has(dedupeKey)) return;
          seenProductKeys.add(dedupeKey);
          results.push({
            type: "product",
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit,
            image: product.image,
            categoryId: category.id,
            subcategoryId: subcategory.id,
            productId: product.id,
          });
        });
      });
    });

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(lowercaseQuery);
      const bExact = b.name.toLowerCase().startsWith(lowercaseQuery);

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return a.name.localeCompare(b.name);
    });

    setSearchResults(sortedResults);
    setIsSearching(false);
  }, []); // Empty dependency array since we don't depend on any external values

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
