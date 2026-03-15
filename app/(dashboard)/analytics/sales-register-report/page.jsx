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

import { useGetSalesRegisterReportQuery } from "@/app/store/api/salesRegisterReportApi";
import SalesRegisterReportPDF from "./sales-register-report-pdf";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

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

export default function SalesRegisterReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default both dates to today)
  const [filters, setFilters] = useState({
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
  } = useGetSalesRegisterReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const items = Array.isArray(res?.data) ? res.data : [];

  // Normalized rows
  const rows = useMemo(() => {
    return items.map((it) => ({
      date: it?.date || "",
      sl_imei: Number(it?.sl_imei ?? 0),
      normal: Number(it?.normal ?? 0),
      gift: Number(it?.gift ?? 0),
      gift_amount: Number(it?.gift_amount ?? 0),
      sales_amount: Number(it?.sales_amount ?? 0),
      sales_discount: Number(it?.sales_discount ?? 0),
    }));
  }, [items]);

  // Search by date
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => (r.date || "").toLowerCase().includes(q));
  }, [rows, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const totalSales = filteredRows.reduce((s, r) => s + r.sales_amount, 0);
    const totalDiscount =
      typeof res?.total_discount_amount === "number"
        ? Number(res.total_discount_amount)
        : filteredRows.reduce((s, r) => s + r.sales_discount, 0);
    return { totalSales, totalDiscount };
  }, [filteredRows, res?.total_discount_amount]);

  // Handlers
  const handleFilterChange = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const apply = () => setAppliedFilters(filters);

  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      Date: r.date,
      "SL/IMEI (qty)": r.sl_imei,
      "Normal (qty)": r.normal,
      "Gift (qty)": r.gift,
      "Gift Amount (BDT)": r.gift_amount,
      "Sales Amount (BDT)": r.sales_amount,
    }));
    // Append totals
    sheetData.push(
      { Date: "Total Discount", "Sales Amount (BDT)": totals.totalDiscount },
      { Date: "Grand Total", "Sales Amount (BDT)": totals.totalSales }
    );

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Register");
    XLSX.writeFile(
      wb,
      `sales-register-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <SalesRegisterReportPDF
        rows={filteredRows}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `sales-register-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Sales Register Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function(){ window.print(); window.close(); }
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
              Sales Register Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Daily summary of quantities and amounts
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters (compact layout) */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        {/* KPI */}
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold">
                {fmt(totals.totalSales)} BDT
              </p>
              <p className="text-sm font-medium">Sales Register Report</p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
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
              <div className="md:col-span-1">
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
              <div className="md:col-span-1 flex justify-end">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search By Particulars"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
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
          <CardTitle>Sales Register Report</CardTitle>
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
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        SL/IMEI
                        <div className="text-[10px] text-muted-foreground">
                          (qty)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Normal
                        <div className="text-[10px] text-muted-foreground">
                          (qty)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Gift
                        <div className="text-[10px] text-muted-foreground">
                          (qty)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Gift Amount
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sales Amount
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r) => (
                      <TableRow key={r.date}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell className="text-right">
                          {fmt(r.sl_imei)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.normal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.gift)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.gift_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.sales_amount)}
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

                    {/* Totals */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Total Discount</TableCell>
                      <TableCell colSpan={4}></TableCell>
                      <TableCell className="text-right">
                        {fmt(totals.totalDiscount)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell colSpan={4}></TableCell>
                      <TableCell className="text-right">
                        {fmt(totals.totalSales)}
                      </TableCell>
                    </TableRow>
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
