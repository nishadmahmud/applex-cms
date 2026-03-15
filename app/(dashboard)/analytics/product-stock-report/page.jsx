"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { useGetProductStockReportQuery } from "@/app/store/api/productStockReportApi";
import ProductStockReportPDF from "./product-stock-report-pdf";

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
const fmtBDT = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ProductStockReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const rawLogoUrl = session?.user?.profile_pic || null;

  const logoUrlForPdf = rawLogoUrl
    ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
    : null;

  // Filters
  const [filters, setFilters] = useState({
    start_date: startOfTodayISO(),
    end_date: endOfTodayISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Local search
  const [searchTerm, setSearchTerm] = useState("");

  // Query
  const {
    data: reportRes,
    isLoading,
    error,
  } = useGetProductStockReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const reportData = reportRes?.data || [];

  // Normalize rows
  const rows = useMemo(() => {
    return (reportData || []).map((item, idx) => {
      const currentStock = Number(item?.current_stock ?? 0);
      const purchasePrice = Number(item?.purchase_price ?? 0);
      return {
        sl: idx + 1,
        productName: item?.name || "N/A",
        currentStock,
        purchasePrice,
        totalPrice: currentStock * purchasePrice,
      };
    });
  }, [reportData]);

  // Filter by product name
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => (r.productName || "").toLowerCase().includes(q));
  }, [rows, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const totalInventoryValue = filteredRows.reduce(
      (sum, r) => sum + (Number.isFinite(r.totalPrice) ? r.totalPrice : 0),
      0
    );
    const totalItems = filteredRows.length;
    return { totalInventoryValue, totalItems };
  }, [filteredRows]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleGetReport = () => setAppliedFilters(filters);

  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      SL: r.sl,
      "Product Name": r.productName,
      "Current Stock": r.currentStock,
      "Purchase Price": r.purchasePrice,
      "Total Price": r.totalPrice,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Stock");
    XLSX.writeFile(
      wb,
      `product-stock-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <ProductStockReportPDF
        data={filteredRows}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
        logoUrlForPdf={logoUrlForPdf}
      />
    ).toBlob();
    saveAs(
      blob,
      `product-stock-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Product Stock Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .neg { color: #dc2626; }
            .name-wrap { white-space: pre-wrap; word-break: break-word; }
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
              Product Stock Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Stock value by product and date range
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
                {fmtBDT(totals.totalInventoryValue)} BDT
              </p>
              <p className="text-sm font-medium">Total Inventory Value</p>
              <p className="text-xs opacity-90">Items: {totals.totalItems}</p>
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
                  value={filters.start_date.slice(0, 10)}
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
                  value={filters.end_date.slice(0, 10)}
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
                  onClick={handleGetReport}
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
            placeholder="Search Product"
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
        <CardHeader>
          <CardTitle>Product Stock Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading stock data...
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
                        Product Name
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Current Stock
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Purchase Price
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Total Price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r) => (
                      <TableRow key={r.sl}>
                        <TableCell>{r.sl}</TableCell>
                        <TableCell className="name-wrap">
                          {r.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtBDT(r.currentStock)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtBDT(r.purchasePrice)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            r.totalPrice < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {fmtBDT(r.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={2} className="text-right">
                          Total
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtBDT(
                            filteredRows.reduce(
                              (sum, r) => sum + r.currentStock,
                              0
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtBDT(
                            filteredRows.reduce(
                              (sum, r) => sum + r.purchasePrice,
                              0
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtBDT(
                            filteredRows.reduce(
                              (sum, r) => sum + r.totalPrice,
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No data found
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
