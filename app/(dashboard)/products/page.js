// "use client";
// import React from "react";
// import ProductsHeader from "./ProductHeader";
// import ProductsFilters from "./ProductsFilters";
// import { useState, useEffect } from "react";
// import useProductList from "@/customHooks/useProductList";
// import dynamic from "next/dynamic";
// import ProductsTable from "./ProductTable";
// import TableSkeleton from "./TableSkeleton";
// import useProductSearchFilter from "@/customHooks/useProductSearchFilter";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import ProductsTableCompact from "./ProductsTableCompact";

// const ProductsPagination = dynamic(() => import("./ProductPagination"), {
//   ssr: false,
// });

// export default function ProductListPage() {
//   const [limit, setLimit] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewMode, setViewMode] = useState("card"); // "card" | "table"

//   const { products, isLoading, mutateProductList } = useProductList(
//     currentPage,
//     limit,
//   );

//   const { searchResults, isSearching, searchProducts, clearSearch, total } =
//     useProductSearchFilter();

//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [filters, setFilters] = useState({
//     categoryId: false,
//     subCategoryId: false,
//     unitId: false,
//     brandId: false,
//     service: false,
//     variants: false,
//     normal: false,
//     stockIn: false,
//     stockOut: false,
//   });

//   const hasActiveFilters = () => {
//     return Object.values(filters).some((value) => value === true);
//   };

//   const hasFilters = hasActiveFilters();

//   // If user is searching or has active filters → show searchResults total
//   const totalToShow =
//     hasFilters || searchKeyword
//       ? searchResults?.data?.total || 0
//       : products?.data?.total || 0;

//   useEffect(() => {
//     const shouldSearch = searchKeyword || hasActiveFilters();

//     if (shouldSearch) {
//       searchProducts(
//         {
//           keyword: searchKeyword,
//           ...filters,
//         },
//         currentPage,
//         limit,
//       );
//     } else {
//       clearSearch();
//     }
//   }, [searchKeyword, filters, currentPage, limit]);

//   const handleSearch = (keyword) => {
//     setSearchKeyword(keyword);
//     setCurrentPage(1); // Reset to first page on new search
//   };

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//     setCurrentPage(1); // Reset to first page on filter change
//   };

//   const displayProducts = searchResults
//     ? searchResults?.data?.data || []
//     : products?.data?.data || [];

//   const totalProducts = searchResults
//     ? searchResults?.data?.total || 0
//     : products?.data?.total || 0;

//   const isLoadingData = isLoading || isSearching;

//   return (
//     <ProtectedRoute featureName="Products" optionName="Product List">
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto">
//           {/* <ProductsHeader total={totalToShow} /> */}
//           <ProductsHeader
//             total={totalToShow}
//             searchFilters={filters}
//             hasActiveFilters={hasFilters}
//             searchKeyword={searchKeyword}
//             viewMode={viewMode} // ← pass down
//             onViewModeChange={setViewMode} // ← pass down
//           />
//           <ProductsFilters
//             onSearch={handleSearch}
//             onFilterChange={handleFilterChange}
//             filters={filters}
//             isSearching={isSearching}
//           />
//           {isLoadingData || products?.data?.data === undefined ? (
//             <TableSkeleton itemsPerPage={limit} />
//           ) : (
//             <>
//               {viewMode === "card" ? (
//                 <ProductsTable
//                   allProducts={displayProducts}
//                   mutateProductList={mutateProductList}
//                   currentPage={currentPage}
//                   limit={limit}
//                 />
//               ) : (
//                 <ProductsTableCompact
//                   allProducts={displayProducts}
//                   currentPage={currentPage}
//                   limit={limit}
//                 />
//               )}
//               <ProductsPagination
//                 totalProducts={totalProducts}
//                 currentPage={currentPage}
//                 setCurrentPage={setCurrentPage}
//                 limit={limit}
//                 setLimit={setLimit}
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import ProductsHeader from "./ProductHeader";
import ProductsFilters from "./ProductsFilters";
import useProductList from "@/customHooks/useProductList";
import dynamic from "next/dynamic";
import ProductsTable from "./ProductTable";
import TableSkeleton from "./TableSkeleton";
import useProductSearchFilter from "@/customHooks/useProductSearchFilter";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductsTableCompact from "./ProductsTableCompact";

const ProductsPagination = dynamic(() => import("./ProductPagination"), {
  ssr: false,
});

export default function ProductListPage() {
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("card");

  // 🔹 define effectiveLimit EARLY and independent
  // large fallback means "fetch all" when "all" is selected
  // const effectiveLimit =
  //   limit === "all" ? Number.MAX_SAFE_INTEGER : Number(limit);
  const effectiveLimit = limit === "all" ? 9999 : Number(limit);

  // now use it safely
  const { products, isLoading, mutateProductList } = useProductList(
    currentPage,
    effectiveLimit,
  );

  const { searchResults, isSearching, searchProducts, clearSearch } =
    useProductSearchFilter();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState({
    categoryId: false,
    subCategoryId: false,
    unitId: false,
    brandId: false,
    service: false,
    variants: false,
    normal: false,
    stockIn: false,
    stockOut: false,
  });

  const hasActiveFilters = () =>
    Object.values(filters).some((value) => value === true);

  const hasFilters = hasActiveFilters();

  const totalProducts = searchResults
    ? searchResults?.data?.total || 0
    : products?.data?.total || 0;

  const totalToShow =
    hasFilters || searchKeyword
      ? searchResults?.data?.total || 0
      : products?.data?.total || 0;

  useEffect(() => {
    const shouldSearch = searchKeyword || hasActiveFilters();
    if (shouldSearch) {
      searchProducts(
        {
          keyword: searchKeyword,
          ...filters,
        },
        currentPage,
        effectiveLimit, // ✅ use same limit here too
      );
    } else {
      clearSearch();
    }
  }, [searchKeyword, filters, currentPage, effectiveLimit]);

  const displayProducts = searchResults
    ? searchResults?.data?.data || []
    : products?.data?.data || [];

  const isLoadingData = isLoading || isSearching;

  return (
    <ProtectedRoute featureName="Products" optionName="Product List">
      <div className="min-h-screen bg-gray-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <ProductsHeader
            total={totalToShow}
            searchFilters={filters}
            hasActiveFilters={hasFilters}
            searchKeyword={searchKeyword}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <ProductsFilters
            onSearch={setSearchKeyword}
            onFilterChange={setFilters}
            filters={filters}
            isSearching={isSearching}
          />
          {isLoadingData || products?.data?.data === undefined ? (
            <TableSkeleton itemsPerPage={limit} />
          ) : (
            <>
              {viewMode === "card" ? (
                <ProductsTable
                  allProducts={displayProducts}
                  mutateProductList={mutateProductList}
                  currentPage={currentPage}
                  limit={limit}
                />
              ) : (
                <ProductsTableCompact
                  allProducts={displayProducts}
                  mutateProductList={mutateProductList}
                  currentPage={currentPage}
                  limit={limit}
                />
              )}

              {/* Pagination component handles "All" gracefully */}
              <ProductsPagination
                totalProducts={totalProducts}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
              />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
