"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import AsyncSelect from "react-select/async";
import RSSelect from "react-select";

import {
  useGetImeiSerialStockReportQuery,
  useGetCustomersQuery,
  useGetVendorsQuery,
  useGetProductsQuery,
  useGetImeiBrandsQuery,
  useLazySearchCustomerQuery,
  useLazySearchVendorQuery,
  useLazySearchImeiProductQuery,
  useLazySearchBrandQuery,
} from "@/app/store/api/imeiSerialReportApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from "lucide-react";

import ImeiSerialReportPDFLandscape from "./imei-serial-report-landscape-pdf";
import ImeiSerialReportPDFPortrait from "./imei-serial-report-portrait-pdf";
import InventorySummaryPdf from "./inventory-summary-pdf";

// Helpers
function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
function todayISO() {
  return new Date().toISOString();
}

const rsStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderColor: state.isFocused ? "#93c5fd" : "#e5e7eb",
    boxShadow: "none",
    ":hover": { borderColor: "#93c5fd" },
    fontSize: 14,
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  option: (base) => ({ ...base, fontSize: 14 }),
};

export default function ImeiSerialReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters for API (keep strings here, react-select holds objects separately)
  const [filters, setFilters] = useState({
    stock_type: "",
    start_date: "",
    end_date: "",
    customer_name: "",
    vendor_name: "",
    product_name: "",
    brand_name: "",
    imei: "",
    product_condition: "",
  });

  // React-Select selected objects (so the dropdowns are controlled)
  const [selCustomer, setSelCustomer] = useState(null);
  const [selVendor, setSelVendor] = useState(null);
  const [selProduct, setSelProduct] = useState(null);
  const [selBrand, setSelBrand] = useState(null);
  const [selCondition, setSelCondition] = useState(null);

  // **NEW: Handle showing date fields**
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Add near other UI state
  const [showImeiCol, setShowImeiCol] = useState(true);
  const [showPurchaseCol, setShowPurchaseCol] = useState(true);

  // Applied filters (trigger API)
  const [appliedFilters, setAppliedFilters] = useState(filters);
  // **NEW: API will not be hit initially**
  const [fetchReport, setFetchReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial datasets for defaultOptions
  const { data: customersRes } = useGetCustomersQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const customers = customersRes?.data?.data || [];

  const { data: vendorsRes } = useGetVendorsQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const vendors = vendorsRes?.data?.data || [];

  const { data: productsRes } = useGetProductsQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const products = productsRes?.data?.data || [];

  const { data: brandsRes } = useGetImeiBrandsQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const brands = brandsRes?.data?.data || [];

  // Lazy search triggers for AsyncSelect
  const [triggerSearchCustomer] = useLazySearchCustomerQuery();
  const [triggerSearchVendor] = useLazySearchVendorQuery();
  const [triggerSearchProduct] = useLazySearchImeiProductQuery();
  const [triggerSearchBrand] = useLazySearchBrandQuery();

  // Report query  **UPDATED: skip until fetchReport = true**
  const {
    data: reportRes,
    isLoading,
    error,
  } = useGetImeiSerialStockReportQuery(appliedFilters, {
    skip: !fetchReport || status !== "authenticated",
  });

  // Option mappers
  const mapNameOptions = (arr) =>
    (arr || []).map((x) => ({
      label: x?.name || x?.product_name || x?.brand_name || "",
      value: x?.name || x?.product_name || x?.brand_name || "",
    }));

  const defaultCustomerOptions = [
    { label: "All Customers", value: "" },
    ...mapNameOptions(customers),
  ];
  const defaultVendorOptions = [
    { label: "All Vendors", value: "" },
    ...mapNameOptions(vendors),
  ];
  const defaultProductOptions = [
    { label: "All Products", value: "" },
    ...mapNameOptions(products),
  ];
  const defaultBrandOptions = [
    { label: "All Brands", value: "" },
    ...mapNameOptions(brands),
  ];

  // Async loaders
  const loadCustomerOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultCustomerOptions;
      try {
        const res = await triggerSearchCustomer({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
        return [{ label: "All Customers", value: "" }, ...mapNameOptions(list)];
      } catch {
        return defaultCustomerOptions;
      }
    },
    [triggerSearchCustomer, defaultCustomerOptions]
  );

  const loadVendorOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultVendorOptions;
      try {
        const res = await triggerSearchVendor({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
        return [{ label: "All Vendors", value: "" }, ...mapNameOptions(list)];
      } catch {
        return defaultVendorOptions;
      }
    },
    [triggerSearchVendor, defaultVendorOptions]
  );

  const loadProductOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultProductOptions;
      try {
        const res = await triggerSearchProduct({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
        return [{ label: "All Products", value: "" }, ...mapNameOptions(list)];
      } catch {
        return defaultProductOptions;
      }
    },
    [triggerSearchProduct, defaultProductOptions]
  );

  const loadBrandOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultBrandOptions;
      try {
        const res = await triggerSearchBrand({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
        return [{ label: "All Brands", value: "" }, ...mapNameOptions(list)];
      } catch {
        return defaultBrandOptions;
      }
    },
    [triggerSearchBrand, defaultBrandOptions]
  );

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGetReport = () => {
    setAppliedFilters(filters);
    setFetchReport(true); // **NEW: trigger API call only on Report**
  };

  // Transform API data (grouped object) to grouped array with rows
  const apiDataObj = reportRes?.data || {}; // { productName: [items...] }

  const groupedData = useMemo(() => {
    const groups = Object.keys(apiDataObj || {}).sort((a, b) =>
      a.localeCompare(b)
    );
    return groups.map((group) => {
      const rows = (apiDataObj[group] || []).map((item, idx) => ({
        slInGroup: idx + 1,
        date: item?.date || "",
        brand: item?.brand_name || "",
        productName: item?.product_name || group,
        imei: item?.imei ?? "",
        invoiceNo: item?.purchase_invoice || "",
        purchasePrice: Number(item?.purchase_price ?? 0),
        salePrice: Number(item?.sale_price ?? 0),
        productCondition: item?.product_condition ?? "N/A",
        vendorName: item?.vendor_name ?? "N/A",
        customerName: item?.customer_name ?? "N/A",
        inStock: Number(item?.in_stock ?? 0),

        // NEW: copy optional product details from API
        region: item?.region ?? "",
        color: item?.color ?? "",
        storage: item?.storage ?? "", // could be "256", "256GB" or "256 GB"
        batteryLife: item?.battery_life ?? null, // numeric or null
      }));
      return { group, rows };
    });
  }, [apiDataObj]);

  const flatRows = useMemo(
    () =>
      groupedData.flatMap(({ group, rows }) =>
        rows.map((r) => ({ ...r, group }))
      ),
    [groupedData]
  );

  // Client search
  const filteredFlatRows = useMemo(() => {
    if (!searchTerm) return flatRows;
    const q = searchTerm.toLowerCase();
    return flatRows.filter((item) => {
      return (
        (item?.brand || "").toLowerCase().includes(q) ||
        (item?.productName || "").toLowerCase().includes(q) ||
        (item?.imei || "").toLowerCase().includes(q) ||
        (item?.invoiceNo || "").toLowerCase().includes(q) ||
        (item?.vendorName || "").toLowerCase().includes(q) ||
        (item?.customerName || "").toLowerCase().includes(q)
      );
    });
  }, [flatRows, searchTerm]);

  // Rebuild groups for table
  const filteredGroups = useMemo(() => {
    const map = new Map();
    filteredFlatRows.forEach((row) => {
      if (!map.has(row.group)) map.set(row.group, []);
      map.get(row.group).push(row);
    });
    return Array.from(map.entries()).map(([group, rows]) => ({ group, rows }));
  }, [filteredFlatRows]);

  // Totals
  const totals = useMemo(() => {
    const totalPurchase = filteredFlatRows.reduce(
      (sum, r) =>
        sum + (Number.isFinite(r.purchasePrice) ? r.purchasePrice : 0),
      0
    );
    const totalSale = filteredFlatRows.reduce(
      (sum, r) => sum + (Number.isFinite(r.salePrice) ? r.salePrice : 0),
      0
    );
    const inStockCount = filteredFlatRows.filter((r) => r.inStock === 1).length;
    const outStockCount = filteredFlatRows.filter(
      (r) => r.inStock === 0
    ).length;
    const totalItems = filteredFlatRows.length;
    const uniqueProducts = new Set(filteredFlatRows.map((r) => r.group)).size;
    return {
      totalPurchase,
      totalSale,
      inStockCount,
      outStockCount,
      totalItems,
      uniqueProducts,
    };
  }, [filteredFlatRows]);

  const formatBDT = (n) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Export + Print code unchanged ----------------------------
  const handleExcelExport = () => {
    const sheetData = filteredFlatRows.map((r) => ({
      "SL #": `#${r.slInGroup}`,
      Date: r.date,
      Brand: r.brand,
      "Product Name": r.productName,
      Region: r.region || "",
      Color: r.color || "",
      Storage: r.storage || "",
      "Battery Health": r.batteryLife != null ? `${r.batteryLife}%` : "",
      "IMEI/Serial": r.imei,
      "Invoice No.": r.invoiceNo,
      "Purchase Price (BDT)": r.purchasePrice,
      "Sale Price (BDT)": r.salePrice,
      "Product Condition": r.productCondition,
      "Vendor Name": r.vendorName,
      "Customer Name": r.customerName,
      "Stock Status": r.inStock === 1 ? "Stock In" : "Stock Out",
      "Group (Product)": r.group,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IMEI Serial Report");
    XLSX.writeFile(
      wb,
      `imei-serial-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExportLandscape = async () => {
    const blob = await pdf(
      <ImeiSerialReportPDFLandscape
        data={filteredGroups}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
        showImeiColumn={showImeiCol}
        showPurchaseColumn={showPurchaseCol}
      />
    ).toBlob();
    saveAs(
      blob,
      `imei-serial-report-landscape-${new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const handlePDFExportPortrait = async () => {
    const blob = await pdf(
      <ImeiSerialReportPDFPortrait
        data={filteredGroups}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
        showImeiColumn={showImeiCol}
        showPurchaseColumn={showPurchaseCol}
      />
    ).toBlob();
    saveAs(
      blob,
      `imei-serial-report-portrait-${new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const handlePDFExportSummary = async () => {
    const blob = await pdf(
      <InventorySummaryPdf
        data={filteredGroups}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `inventory-summary-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const tableRef = useRef(null);
  const handlePrintTable = () => {
    if (!tableRef.current) return;
    const content = tableRef.current.innerHTML;
    const win = window.open("", "PRINT", "height=900,width=1200");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>IMEI/Serial Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .group-row { background: #f9fafb; font-weight: 700; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // UI
  const productConditions = ["Intact", "Used", "Damaged", "Service", "Client"];
  const conditionOptions = [
    { label: "All Conditions", value: "" },
    ...productConditions.map((c) => ({ label: c, value: c })),
  ];

  // Helper to normalize storage display and battery
  const formatStorage = (s) => {
    if (s == null || s === "") return "";
    // if numeric (e.g. "256" or 256) add "GB"
    if (!isNaN(Number(s))) return `${Number(s)} GB`;
    // normalize common patterns like "256gb" or "256 gb" -> "256 GB"
    const normalized = String(s).trim();
    const match = normalized.match(/^(\d+)\s*gb$/i);
    if (match) return `${match[1]} GB`;
    return normalized;
  };

  const buildProductTitle = (item) => {
    const storageText = formatStorage(item.storage);
    const batteryText =
      item.batteryLife != null && item.batteryLife !== ""
        ? `${item.batteryLife}%`
        : null;

    const parts = [
      item.productName,
      item.region,
      item.color,
      storageText,
      batteryText,
    ];

    return parts.filter(Boolean).join(" - ");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              IMEI/Serial Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Device transaction history with IMEI/Serial details
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white flex justify-center items-center">
          <CardContent className="p-3">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">
                {formatBDT(totals.totalPurchase)} BDT
              </p>
              <p className="text-sm font-medium">IMEI/Serial Report</p>
              <p className="text-xs opacity-90">
                In: {totals.inStockCount} | Out: {totals.outStockCount} | Items:{" "}
                {totals.totalItems}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* NEW: Checkbox to show/hide date range */}
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showDateFilter"
                  checked={showDateFilter}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowDateFilter(checked);
                    if (checked) {
                      handleFilterChange("start_date", todayISO());
                      handleFilterChange("end_date", todayISO());
                    } else {
                      handleFilterChange("start_date", "");
                      handleFilterChange("end_date", "");
                    }
                  }}
                />
                <Label htmlFor="showDateFilter">Select Date Range</Label>
              </div>

              {showDateFilter && (
                <>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={
                        filters.start_date
                          ? filters.start_date.slice(0, 10)
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "start_date",
                          e.target.value
                            ? e.target.value + "T00:00:00.000Z"
                            : ""
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={
                        filters.end_date ? filters.end_date.slice(0, 10) : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "end_date",
                          e.target.value
                            ? e.target.value + "T23:59:59.999Z"
                            : ""
                        )
                      }
                    />
                  </div>
                </>
              )}

              {/* Customer */}
              <div>
                <Label>Customer</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultCustomerOptions}
                  loadOptions={loadCustomerOptions}
                  value={selCustomer}
                  onChange={(opt) => {
                    setSelCustomer(opt);
                    handleFilterChange("customer_name", opt?.value ?? "");
                  }}
                  isClearable
                  placeholder="Select Customer"
                  styles={rsStyles}
                />
              </div>

              {/* Vendor */}
              <div>
                <Label>Vendor</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultVendorOptions}
                  loadOptions={loadVendorOptions}
                  value={selVendor}
                  onChange={(opt) => {
                    setSelVendor(opt);
                    handleFilterChange("vendor_name", opt?.value ?? "");
                  }}
                  isClearable
                  placeholder="Select Vendor"
                  styles={rsStyles}
                />
              </div>

              {/* Product */}
              <div>
                <Label>Product</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultProductOptions}
                  loadOptions={loadProductOptions}
                  value={selProduct}
                  onChange={(opt) => {
                    setSelProduct(opt);
                    handleFilterChange("product_name", opt?.value ?? "");
                  }}
                  isClearable
                  placeholder="Select Product"
                  styles={rsStyles}
                />
              </div>

              {/* Brand */}
              <div>
                <Label>Brand</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultBrandOptions}
                  loadOptions={loadBrandOptions}
                  value={selBrand}
                  onChange={(opt) => {
                    setSelBrand(opt);
                    handleFilterChange("brand_name", opt?.value ?? "");
                  }}
                  isClearable
                  placeholder="Select Brand"
                  styles={rsStyles}
                />
              </div>

              {/* IMEI */}
              <div>
                <Label htmlFor="imei">IMEI</Label>
                <Input
                  id="imei"
                  placeholder="Search IMEI"
                  value={filters.imei}
                  onChange={(e) => handleFilterChange("imei", e.target.value)}
                />
              </div>

              {/* Product Condition */}
              <div>
                <Label>Product Condition</Label>
                <RSSelect
                  value={selCondition}
                  onChange={(opt) => {
                    setSelCondition(opt);
                    handleFilterChange("product_condition", opt?.value ?? "");
                  }}
                  options={conditionOptions}
                  isClearable
                  placeholder="Select Condition"
                  styles={rsStyles}
                />
              </div>

              {/* Stock Type + Report */}
              <div className="md:col-span-2 flex gap-3">
                {/* UPDATED: Only two buttons, none selected by default */}
                <Button
                  variant={
                    filters.stock_type === "stock_in" ? "default" : "secondary"
                  }
                  onClick={() => handleFilterChange("stock_type", "stock_in")}
                >
                  Stock In
                </Button>
                <Button
                  variant={
                    filters.stock_type === "stock_out" ? "default" : "secondary"
                  }
                  onClick={() => handleFilterChange("stock_type", "stock_out")}
                >
                  Stock Out
                </Button>
                {/* Column toggles */}
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showImeiCol}
                      onChange={(e) => setShowImeiCol(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Show IMEI/Serial (PDF)</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showPurchaseCol}
                      onChange={(e) => setShowPurchaseCol(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Show Purchase Price (PDF)</span>
                  </label>
                </>

                <div className="ml-auto">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleGetReport}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of code (search, export, table) remains exactly same */}
      {/* Actions */}
      <div className="flex justify-end items-center w-full space-x-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Transaction"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 border-gray-200"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-gray-600 font-semibold text-sm">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleExcelExport}
              className="hover:bg-blue-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFExportLandscape}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download PDF (Landscape)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFExportPortrait}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download PDF (Portrait)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFExportSummary}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download Inventory Summary (PDF)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePrintTable}
              className="hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2 text-blue-500" />
              Print Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card className="max-w-[73vw] mx-auto">
        <CardHeader>
          <CardTitle>IMEI/Serial History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading report...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">
              Error loading data
            </div>
          ) : (
            <div className="w-xl overflow-x-auto">
              <div className="rounded-md border" ref={tableRef}>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-10">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </TableHead>
                      <TableHead className="w-12">SL</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>IMEI/Serial</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead className="text-right">Purchase Price</TableHead>
                      <TableHead className="text-right">Sale Price</TableHead>
                      <TableHead>Product Condition</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Customer Name</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredGroups.map(({ group, rows }) => (
                      <React.Fragment key={group}>
                        <TableRow className="bg-muted/30 hover:bg-muted/40">
                          <TableCell colSpan={12} className="font-semibold text-primary">
                            {group}
                          </TableCell>
                        </TableRow>

                        {rows.map((item, idx) => (
                          <TableRow key={`${group}-${idx}`}>
                            <TableCell>
                              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            </TableCell>
                            <TableCell className="font-medium text-muted-foreground">
                              #{item.slInGroup}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell className="max-w-[250px] whitespace-normal" title={buildProductTitle(item)}>
                              {buildProductTitle(item)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {item.imei || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.invoiceNo || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell className="text-right font-medium text-emerald-600">
                              {formatBDT(item.purchasePrice)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-blue-600">
                              {formatBDT(item.salePrice)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.productCondition === "intact"
                                  ? "bg-green-100 text-green-800"
                                  : item.productCondition === "used"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {item.productCondition}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{item.vendorName || "-"}</TableCell>
                            <TableCell className="text-sm">{item.customerName || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}

                    {filteredGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredGroups.length > 0 && (
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={7} className="text-right">
                          Grand Totals
                        </TableCell>
                        <TableCell className="text-right text-emerald-700">
                          {formatBDT(totals.totalPurchase)}
                        </TableCell>
                        <TableCell className="text-right text-blue-700">
                          {formatBDT(totals.totalSale)}
                        </TableCell>
                        <TableCell colSpan={3} className="text-xs text-muted-foreground">
                          In: {totals.inStockCount} | Out: {totals.outStockCount} | Products:{" "}
                          {totals.uniqueProducts}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
