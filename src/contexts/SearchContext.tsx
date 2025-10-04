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

          // Search products in nested subcategories
          nestedSub.products?.forEach((product) => {
            if (
              product.name.toLowerCase().includes(lowercaseQuery) ||
              product.description.toLowerCase().includes(lowercaseQuery)
            ) {
              results.push({
                type: "product",
                id: product.id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                unit: product.unit,
                image: product.image,
                categoryId: category.id,
                subcategoryId: nestedSub.id, // Use nested subcategory ID for navigation
                productId: product.id,
              });
            }

            // Search variants in nested subcategories
            product.variants?.forEach((variant) => {
              if (variant.name.toLowerCase().includes(lowercaseQuery)) {
                results.push({
                  type: "variant",
                  id: variant.id,
                  name: `${product.name} - ${variant.name}`,
                  description: product.description,
                  price: variant.price,
                  unit: variant.unit,
                  image: variant.image,
                  categoryId: category.id,
                  subcategoryId: nestedSub.id, // Use nested subcategory ID for navigation
                  productId: product.id,
                });
              }
            });
          });
        });

        // Search products in direct subcategories
        subcategory.products?.forEach((product) => {
          if (
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.description.toLowerCase().includes(lowercaseQuery)
          ) {
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
          }

          // Search variants in direct subcategories
          product.variants?.forEach((variant) => {
            if (variant.name.toLowerCase().includes(lowercaseQuery)) {
              results.push({
                type: "variant",
                id: variant.id,
                name: `${product.name} - ${variant.name}`,
                description: product.description,
                price: variant.price,
                unit: variant.unit,
                image: variant.image,
                categoryId: category.id,
                subcategoryId: subcategory.id,
                productId: product.id,
              });
            }
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
