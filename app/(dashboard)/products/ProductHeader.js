"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileSpreadsheet,
  FileText,
  Printer,
  LayoutGrid,
  Table,
} from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import ProductListPDF from "./ProductListPDF"; // ⬅️ create this like CustomerListPDF style

import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ProductsHeader
 * Exports ALL rows:
 *  • full list if no search/filter active
 *  • search-filtered list (from search-product-v1) if active
 */
function ProductsHeader({
  total,
  searchFilters = {},
  hasActiveFilters = false,
  searchKeyword = "",
  viewMode = "card",
  onViewModeChange = () => { },
}) {
  const { data: session } = useSession();
  const isEmployee = !!session?.isEmployee;
  const { data: features } = useRolePermissions();

  const canAddProduct =
    !isEmployee || canAccess(features, "Products", "Add Product");

  const [exporting, setExporting] = useState(false);

  /* ------------------------------------------------------------
     Helper 1: fetch full list from /product (all pages)
  ------------------------------------------------------------ */
  const fetchAllProducts = async () => {
    if (!session?.accessToken) return [];
    const all = [];
    try {
      let page = 1;
      let pages = 1;
      const token = session.accessToken;
      do {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/product?page=${page}&limit=5000`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        const data = json?.data?.data || [];
        all.push(...data);
        const total = json?.data?.total || 0;
        const perPage = json?.data?.per_page || 5000;
        pages = Math.ceil(total / perPage);
        page++;
      } while (page <= pages);
      return all;
    } catch (err) {
      console.error("Fetch /product error:", err);
      return [];
    }
  };

  /* ------------------------------------------------------------
     Helper 2: fetch search results from /search-product-v1 (all)
  ------------------------------------------------------------ */
  const fetchSearchResults = async () => {
    if (!session?.accessToken) return [];
    const token = session.accessToken;
    const payload = {
      keyword: searchKeyword || searchFilters.keyword || "",
      categoryId: searchFilters.categoryId || false,
      subCategoryId: searchFilters.subCategoryId || false,
      unitId: searchFilters.unitId || false,
      brandId: searchFilters.brandId || false,
      product_type: searchFilters.product_type || "",
      stockIn: searchFilters.stockIn || false,
      stockOut: searchFilters.stockOut || false,
      variants: searchFilters.variants || false,
      normal: searchFilters.normal || false,
    };
    try {
      let page = 1;
      let pages = 1;
      const all = [];
      do {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/search-product-v1?page=${page}&limit=500`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = res.data;
        const data = json?.data?.data || [];
        all.push(...data);
        const total = json?.data?.total || 0;
        const perPage = json?.data?.per_page || 500;
        pages = Math.ceil(total / perPage);
        page++;
      } while (page <= pages);
      return all;
    } catch (err) {
      console.error("Fetch /search-product-v1 error:", err);
      return [];
    }
  };

  /* ------------------------------------------------------------
     Unified exporter → decides which API to hit
  ------------------------------------------------------------ */
  const resolveProductsForExport = async () => {
    if (hasActiveFilters || searchKeyword) {
      return await fetchSearchResults();
    }
    return await fetchAllProducts();
  };

  /* === Excel Export === */
  const handleExcelExport = async () => {
    setExporting(true);
    try {
      const data = await resolveProductsForExport();
      if (!data.length) {
        alert("No product data found to export.");
        return;
      }
      const sheetData = data.map((p) => ({
        "Product Name": p.name,
        Serial: p.serial,
        "Brand Name": p.brands?.name || "-",
        "Purchase Price": Number(p.purchase_price || 0),
        "Retail Price": Number(p.retails_price || 0),
        Category: p.category?.name || "-",
        "Sub Category": p.sub_category?.name || "-",
        "Current Stock": Number(p.current_stock || 0),
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);

      // ✅ Proper Excel freeze header row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomLeft",
        state: "frozen",
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(
        wb,
        `product-list-${new Date().toISOString().split("T")[0]}.xlsx`
      );

    } finally {
      setExporting(false);
    }
  };

  const logoUrlForPdf = session?.user?.profile_pic
    ? `/api/logo-proxy?url=${encodeURIComponent(session.user.profile_pic)}`
    : null;

  /* === PDF Export === */
  const handlePDFExport = async () => {
    setExporting(true);
    try {
      const data = await resolveProductsForExport();
      if (!data.length) {
        alert("No product data found to export.");
        return;
      }
      const blob = await pdf(
        <ProductListPDF
          data={data}
          user={session?.user}
          logoUrlForPdf={logoUrlForPdf}
        />,
      ).toBlob();
      saveAs(
        blob,
        `product-list-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  /* === Print Export === */
  const handlePrint = async () => {
    setExporting(true);
    try {
      const data = await resolveProductsForExport();
      if (!data.length) {
        alert("No product data found to export.");
        return;
      }
      const rows = data
        .map(
          (p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td>${p.purchase_price}</td>
            <td>${p.retails_price}</td>
            <td>${p.category?.name || "-"}</td>
            <td>${p.sub_category?.name || "-"}</td>
            <td>${p.current_stock}</td>
          </tr>`,
        )
        .join("");

      const win = window.open("", "PRINT", "height=900,width=1200");
      win.document.write(`
        <html>
          <head><title>Products List</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 5px; font-size: 12px; }
              th { background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h2>Products Report</h2>
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Product Name</th>
                  <th>Purchase Price</th>
                  <th>Retail Price</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <script>window.onload=()=>{window.print();window.close();}</script>
          </body>
        </html>
      `);
      win.document.close();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
      <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
        Products List ({total || 0})
      </h1>

      <div className="flex items-center gap-1.5 md:gap-2">
        {/* View Switch */}
        <div className="flex items-center bg-gray-100 rounded-md">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => onViewModeChange("card")}
            title="Card View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => onViewModeChange("table")}
            title="Table View"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={exporting}>
            <Button variant="outline" size="sm">
              {exporting ? (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin text-gray-400" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                  Export
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          {!exporting && (
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExcelExport}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                Download Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePDFExport}>
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2 text-blue-500" />
                Print Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        {/* Add Product Button stays intact */}
        {canAddProduct && (
          <Link
            href="/add-products"
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 md:gap-3 text-xs text-white py-[6px] px-2 md:px-3 rounded-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default memo(ProductsHeader);
