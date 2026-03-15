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

import {
  useGetCategorySaleReportDateWiseQuery,
  useGetMostSellingCategoryDateWiseQuery,
} from "@/app/store/api/categorySaleReportApi";
import CategorySaleReportPDF from "./category-sale-report-pdf";

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Default both Start and End to "today"
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

const toISOStartOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T00:00:00.000Z` : "";
const toISOEndOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T23:59:59.999Z` : "";

function toDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d || "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return d || "";
  }
}

export default function CategorySaleReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters: both default to "today"
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const {
    data: detailRes,
    isLoading,
    error,
  } = useGetCategorySaleReportDateWiseQuery(
    { ...appliedFilters, page: 1, limit: 500 },
    { skip: status !== "authenticated" }
  );
  const { data: topRes, isLoading: isLoadingTop } =
    useGetMostSellingCategoryDateWiseQuery(
      { ...appliedFilters, page: 1, limit: 20 },
      { skip: status !== "authenticated" }
    );

  // Parse detail list
  const pageObj = detailRes?.data;
  const detailList = Array.isArray(pageObj?.data) ? pageObj.data : [];
  const detailRows = useMemo(
    () =>
      detailList
        .map((r) => ({
          date: r?.created_at || "",
          category: r?.category_name || "",
          product: r?.product_name || "",
          customer: r?.customer || "",
          invoice: r?.invoice || "",
          qty: Number(r?.total_sale ?? 0),
          amount: Number(r?.total_sale_amount ?? 0),
          due: Number(r?.due ?? 0),
        }))
        .sort((a, b) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          if (isNaN(da) || isNaN(db)) return 0;
          return da - db;
        }),
    [detailList]
  );

  // Parse top categories
  const topPageObj = topRes?.data;
  const topRows = useMemo(
    () => (Array.isArray(topPageObj?.data) ? topPageObj.data : []),
    [topPageObj]
  );

  // Calculate total due from actual data (don't trust API's due_amount)
  const calculatedDueAmount = detailRows.reduce((sum, row) => {
    return sum + (Number.isFinite(row.due) ? row.due : 0);
  }, 0);

  // Summary from API (with corrected due amount)
  const summary = {
    totalCategories: Number(detailRes?.total_categories ?? 0),
    soldCategories: Number(detailRes?.sold_categories ?? 0),
    soldAmount: Number(detailRes?.sold_amount ?? 0),
    paidAmount: Number(detailRes?.paid_amount ?? 0),
    dueAmount: calculatedDueAmount, // Using calculated value instead of API
  };

  // Search filter (for on-screen table only)
  const filteredRows = useMemo(() => {
    if (!searchTerm) return detailRows;
    const q = searchTerm.toLowerCase();
    return detailRows.filter(
      (r) =>
        (r.invoice || "").toLowerCase().includes(q) ||
        (r.product || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (r.customer || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [detailRows, searchTerm]);

  // Totals for view (based on filtered rows)
  const viewTotals = useMemo(() => {
    const qty = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.qty) ? r.qty : 0),
      0
    );
    const amount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
      0
    );
    const due = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.due) ? r.due : 0),
      0
    );
    return { qty, amount, due };
  }, [filteredRows]);

  // Totals for PDF (use full dataset so PDF always shows data even if UI filtered to none)
  const pdfTotals = useMemo(() => {
    const qty = detailRows.reduce(
      (s, r) => s + (Number.isFinite(r.qty) ? r.qty : 0),
      0
    );
    const amount = detailRows.reduce(
      (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
      0
    );
    const due = detailRows.reduce(
      (s, r) => s + (Number.isFinite(r.due) ? r.due : 0),
      0
    );
    return { qty, amount, due };
  }, [detailRows]);

  // Handlers
  const apply = () => setAppliedFilters(filters);

  // Excel export
  const handleExcel = () => {
    // Sheet 1: Details (use the same filtered rows as the table)
    const detailSheet = filteredRows.map((r, i) => ({
      SL: i + 1,
      Date: toDate(r.date),
      Category: r.category,
      Product: r.product,
      Customer: r.customer,
      Invoice: r.invoice,
      Qty: r.qty,
      "Amount (BDT)": r.amount,
      "Due (BDT)": r.due,
    }));
    detailSheet.push({
      SL: "",
      Date: "",
      Category: "",
      Product: "",
      Customer: "",
      Invoice: "Totals",
      Qty: viewTotals.qty,
      "Amount (BDT)": viewTotals.amount,
      "Due (BDT)": viewTotals.due,
    });

    // Sheet 2: Top Categories
    const topSheet = topRows.map((c, i) => ({
      SL: i + 1,
      Category: c?.name || "",
      Invoices: Number(c?.category_count ?? 0),
      Products: Number(c?.total_products_sold ?? 0),
      "Amount (BDT)": Number(c?.amount ?? 0),
      "Due (BDT)": Number(c?.total_due_amount ?? 0),
      "Last Date": toDate(c?.date),
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(detailSheet);
    XLSX.utils.book_append_sheet(wb, ws1, "Details");

    const ws2 = XLSX.utils.json_to_sheet(topSheet);
    XLSX.utils.book_append_sheet(wb, ws2, "Top Categories");

    XLSX.writeFile(
      wb,
      `category-sale-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF export
  const handlePDF = async () => {
    // Important: pass the full dataset (detailRows), not the filteredRows,
    // so PDF always contains data even if the UI search narrows it down.
    const blob = await pdf(
      <CategorySaleReportPDF
        rows={detailRows}
        // Also pass aliases for compatibility, in case the PDF component uses a different prop name
        details={detailRows}
        items={detailRows}
        totals={pdfTotals}
        summary={summary}
        topRows={topRows}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `category-sale-report-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Print
  const tableRef = useRef(null);
  const topRef = useRef(null);
  const handlePrint = () => {
    const content1 = tableRef.current?.innerHTML || "";
    const content2 = topRef.current?.innerHTML || "";
    const w = window.open("", "PRINT", "height=900,width=1200");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Category Sale Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .muted { color: #6b7280; font-size: 11px; }
            .total-row { background: #eef2ff; font-weight: 700; }
            h2 { margin: 24px 0 8px; font-size: 16px; }
          </style>
        </head>
        <body>
          <h2>Category Sale Details</h2>
          ${content1}
          <h2>Most Selling Categories</h2>
          ${content2}
          <script>window.onload = function(){ window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    w.document.close();
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
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Category Sale Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Sales details with categories for a date range, plus top selling
              categories
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-5">
            <div className="space-y-2">
              <div className="text-2xl font-extrabold">
                {fmt2(summary.soldAmount)}{" "}
                <span className="text-xs align-top">BDT</span>
              </div>
              <div className="text-sm opacity-90">Total Sold Amount</div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div>Paid: {fmt2(summary.paidAmount)}</div>
                <div>Due: {fmt2(summary.dueAmount)}</div>
                <div>
                  Categories: {fmt0(summary.soldCategories)} /{" "}
                  {fmt0(summary.totalCategories)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={(filters.start_date || "").slice(0, 10)}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      start_date: toISOStartOfDay(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={(filters.end_date || "").slice(0, 10)}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      end_date: toISOEndOfDay(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={!filters.start_date || !filters.end_date}
                  title={
                    !filters.start_date || !filters.end_date
                      ? "Set a date range first"
                      : "Get Report"
                  }
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
            placeholder="Search by invoice / product / category / customer / date"
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
              onClick={handleExcel}
              className="hover:bg-blue-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePDF} className="hover:bg-blue-50">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePrint}
              className="hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2 text-blue-500" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading data...
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
                      <TableHead className="font-bold text-black">
                        Category
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Product
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Customer
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Invoice
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Due (BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoice}-${idx}`}>
                        <TableCell>{toDate(r.date)}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell className="whitespace-pre-wrap">
                          {r.product}
                        </TableCell>
                        <TableCell>{r.customer}</TableCell>
                        <TableCell>{r.invoice}</TableCell>
                        <TableCell className="text-right">
                          {fmt0(r.qty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.due)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={5}>Totals</TableCell>
                        <TableCell className="text-right">
                          {fmt0(viewTotals.qty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.due)}
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

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Most Selling Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTop ? (
            <div className="flex items-center justify-center h-24">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div ref={topRef}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">SL</TableHead>
                      <TableHead className="font-bold text-black">
                        Category
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Invoices
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Products
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Due (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Last Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRows.map((c, i) => (
                      <TableRow
                        key={`${c?.category_id || c?.name || "row"}-${i}`}
                      >
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{c?.name || ""}</TableCell>
                        <TableCell className="text-right">
                          {fmt0(c?.category_count || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt0(c?.total_products_sold || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(c?.amount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(c?.total_due_amount || 0)}
                        </TableCell>
                        <TableCell>{toDate(c?.date)}</TableCell>
                      </TableRow>
                    ))}

                    {topRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
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
