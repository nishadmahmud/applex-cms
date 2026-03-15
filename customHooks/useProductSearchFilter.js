"use client";
import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import axios from "axios";

const useProductSearchFilter = () => {
  const { data: session } = useSession();
  const [searchResults, setSearchResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = useCallback(
    async (filters, page = 1, limit = 10) => {
      if (!session?.accessToken) {
        setError("No authentication token");
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const payload = {
          keyword: filters.keyword || "",
          categoryId: filters.categoryId || false,
          subCategoryId: filters.subCategoryId || false,
          unitId: filters.unitId || false,
          brandId: filters.brandId || false,
          product_type: filters.product_type || "",
          stockIn: filters.stockIn || false,
          stockOut: filters.stockOut || false,
          variants: filters.variants || false,
          normal: filters.normal || false,
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/search-product-v1?page=${page}&limit=${limit}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        setSearchResults(response.data);
        setTotal(response.data?.data?.total || 0);
        setIsSearching(false);
        return response.data;
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to search products");
        setIsSearching(false);
        return null;
      }
    },
    [session?.accessToken]
  );

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    searchProducts,
    clearSearch,
    total,
  };
};

export default useProductSearchFilter;
