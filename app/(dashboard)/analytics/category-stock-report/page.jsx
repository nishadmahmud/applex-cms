"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from "lucide-react";
import { useGetCategoryStockReportDateWiseQuery } from "@/app/store/api/categoryStockReportApi";
import CategoryStockReportPDF from "./category-stock-report-pdf";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

function todayStartISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function todayEndISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function CategoryStockReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (limit fixed to 20 by default; no field in UI)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetCategoryStockReportDateWiseQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const categories = res?.data?.data || [];
  const currentPage = res?.data?.current_page || appliedFilters.page || 1;
  const lastPage = res?.data?.last_page || 1;
  const totalCategories = Number(res?.data?.total ?? categories.length);

  // Transform rows (per-category metrics)
  const rows = useMemo(() => {
    return (categories || []).map((cat, idx) => {
      const purchaseQty = Number(cat?.total_purchase_qty ?? 0);
      const salesQty = Number(cat?.total_sales_qty ?? 0);
      const stockUnit = Number(cat?.product_stock_unit ?? 0);
      const salesAmount = Number(cat?.total_sales_amount ?? 0);
      return {
        sl: (appliedFilters.page - 1) * appliedFilters.limit + (idx + 1),
        categoryName: cat?.name || "N/A",
        purchaseQty,
        salesQty,
        stockUnit,
        salesAmount,
      };
    });
  }, [categories, appliedFilters.page, appliedFilters.limit]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => (r.categoryName || "").toLowerCase().includes(q));
  }, [rows, searchTerm]);

  // Page totals (for current list)
  const pageTotals = useMemo(() => {
    const purchaseQty = filteredRows.reduce((s, r) => s + r.purchaseQty, 0);
    const salesQty = filteredRows.reduce((s, r) => s + r.salesQty, 0);
    const stockUnit = filteredRows.reduce((s, r) => s + r.stockUnit, 0);
    const salesAmount = filteredRows.reduce((s, r) => s + r.salesAmount, 0);
    const categoriesCount = filteredRows.length;
    return { categoriesCount, purchaseQty, salesQty, stockUnit, salesAmount };
  }, [filteredRows]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  const changePage = (dir) => {
    const next = Math.min(
      Math.max(1, appliedFilters.page + dir),
      lastPage || 1
    );
    const newFilters = { ...appliedFilters, page: next };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  // Export handlers
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      SL: r.sl,
      "Category Name": r.categoryName,
      "Purchase Qty": r.purchaseQty,
      "Sales Qty": r.salesQty,
      "Stock Unit": r.stockUnit,
      "Sales Amount (BDT)": r.salesAmount,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Category Stock");
    XLSX.writeFile(
      wb,
      `category-stock-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <CategoryStockReportPDF
        data={filteredRows}
        pageTotals={pageTotals}
        summary={{
          totalCategories,
          start_date: appliedFilters.start_date,
          end_date: appliedFilters.end_date,
        }}
        filters={appliedFilters}
        user={session?.user}
        pagination={{ currentPage, lastPage }}
      />
    ).toBlob();
    saveAs(
      blob,
      `category-stock-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Category Stock Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-row { background: #e5e7eb; font-weight: 700; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function () {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
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
              Category Stock Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Category-wise purchase, sales, stock unit and sales amount
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
                {fmt(pageTotals.salesAmount)} BDT
              </p>
              <p className="text-sm font-medium">
                Total Sales Amount (Current List)
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left mt-2 text-xs">
                <p>
                  Categories (all pages):{" "}
                  <span className="font-semibold">{fmt(totalCategories)}</span>
                </p>
                <p>
                  Categories (this page):{" "}
                  <span className="font-semibold">
                    {fmt(pageTotals.categoriesCount)}
                  </span>
                </p>
                <p>
                  Purchase Qty (page):{" "}
                  <span className="font-semibold">
                    {fmt(pageTotals.purchaseQty)}
                  </span>
                </p>
                <p>
                  Sales Qty (page):{" "}
                  <span className="font-semibold">
                    {fmt(pageTotals.salesQty)}
                  </span>
                </p>
                <p>
                  Stock Unit (page):{" "}
                  <span className="font-semibold">
                    {fmt(pageTotals.stockUnit)}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={
                    filters.start_date ? filters.start_date.slice(0, 10) : ""
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      "start_date",
                      e.target.value ? `${e.target.value}T00:00:00.000Z` : ""
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date ? filters.end_date.slice(0, 10) : ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "end_date",
                      e.target.value ? `${e.target.value}T23:59:59.999Z` : ""
                    )
                  }
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                >
                  Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center w-full space-x-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 border-gray-200"
              title="Export Options"
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
              onClick={handlePDFExport}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download PDF
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
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Category Stock Report</CardTitle>
          <div className="mt-2 md:mt-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => changePage(-1)}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= lastPage}
              onClick={() => changePage(1)}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading category stock...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">
              Error loading data
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black w-16">
                        SL
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Category Name
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Purchase Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sales Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Stock Unit
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sales Amount (BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r) => (
                      <TableRow key={r.sl}>
                        <TableCell>{r.sl}</TableCell>
                        <TableCell>{r.categoryName}</TableCell>
                        <TableCell className="text-right">
                          {fmt(r.purchaseQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.salesQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.stockUnit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.salesAmount)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={2} className="text-right">
                          Page Totals
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(pageTotals.purchaseQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(pageTotals.salesQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(pageTotals.stockUnit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(pageTotals.salesAmount)}
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
