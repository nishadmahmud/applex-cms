"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

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

import { useGetCashBookReportQuery } from "@/app/store/api/transactionSummaryReportApi";
import TransactionSummaryReportPDF from "./transaction-summary-report-pdf";

// -------- Utils
const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const clampNearZero = (n, eps = 0.005) =>
  Math.abs(Number(n || 0)) < eps ? 0 : Number(n || 0);

function defaultRange(days = 30) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

const statusToSide = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "credit" || s === "in") return "credit";
  // Treat "debit", "out" and unknown as debit (cash out)
  return "debit";
};

const joinMeta = (parts = []) => parts.filter(Boolean).join(" • ");

// -------- Page
export default function TransactionSummaryReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { start, end } = defaultRange(90);

  // Filters
  const [filters, setFilters] = useState({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    view_order: "asc", // "asc" | "desc"
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");

  // API query (real response mapping)
  const {
    data: cashRes,
    isLoading,
    error,
  } = useGetCashBookReportQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters?.start_date ||
      !appliedFilters?.end_date ||
      !appliedFilters?.view_order,
  });

  // Extract values from API
  const txns = Array.isArray(cashRes?.data) ? cashRes.data : [];
  const openingBalance = clampNearZero(cashRes?.opening_balance);
  const closingBalance = clampNearZero(cashRes?.closing_balance);
  const apiTotalCredit = clampNearZero(cashRes?.current_total_credit);
  const apiTotalDebit = clampNearZero(cashRes?.current_total_debit);

  // Try to get currency code from session invoice settings, fallback to BDT
  const currency =
    session?.user?.invoice_settings?.currency_info?.code ||
    session?.user?.invoice_settings?.currency_info?.name ||
    "BDT";

  // Normalize rows from API
  const rows = useMemo(() => {
    return txns.map((t, idx) => {
      const side = statusToSide(t?.status);
      const amount = clampNearZero(t?.payment_amount);
      const debit = side === "debit" ? amount : 0;
      const credit = side === "credit" ? amount : 0;

      // Display fields
      const main =
        t?.particulars ||
        t?.type ||
        t?.status ||
        t?.invoice_id ||
        t?.type_name ||
        "-";

      const sub = joinMeta([
        t?.date || "",
        t?.status || "",
        t?.type || "",
        t?.invoice_id || "",
        t?.type_name || "",
      ]);

      return {
        id: `${t?.invoice_id || "row"}-${idx}`,
        date: t?.date || "",
        particularsMain: main,
        particularsSub: sub,
        debit,
        credit,
      };
    });
  }, [txns]);

  // Order by date (also API supports view_order, but we ensure locally)
  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (isNaN(da) || isNaN(db)) return 0;
      return appliedFilters.view_order === "desc" ? db - da : da - db;
    });
    return copy;
  }, [rows, appliedFilters.view_order]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm) return sortedRows;
    const q = searchTerm.toLowerCase();
    return sortedRows.filter(
      (r) =>
        (r.particularsMain || "").toLowerCase().includes(q) ||
        (r.particularsSub || "").toLowerCase().includes(q)
    );
  }, [sortedRows, searchTerm]);

  // View totals (for current filtered view)
  const viewTotals = useMemo(() => {
    const totalDebit = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.debit) ? r.debit : 0),
      0
    );
    const totalCredit = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.credit) ? r.credit : 0),
      0
    );
    return {
      totalDebit: clampNearZero(totalDebit),
      totalCredit: clampNearZero(totalCredit),
    };
  }, [filteredRows]);

  // Derived display values for opening/closing row placements
  const openingDebit = openingBalance > 0 ? openingBalance : 0;
  const openingCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;
  const closingDebit = closingBalance > 0 ? closingBalance : 0;
  const closingCredit = closingBalance < 0 ? Math.abs(closingBalance) : 0;

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const apply = () => setAppliedFilters(filters);

  // Excel export
  const handleExcelExport = () => {
    const sheetData = [];

    sheetData.push({
      Particulars: "Opening Balance",
      "Debit (BDT)": openingDebit,
      "Credit (BDT)": openingCredit,
    });

    filteredRows.forEach((r) => {
      sheetData.push({
        Date: r.date,
        "Particulars (Main)": r.particularsMain,
        "Particulars (Details)": r.particularsSub,
        "Debit (BDT)": r.debit,
        "Credit (BDT)": r.credit,
      });
    });

    sheetData.push({
      Particulars: "Current Total",
      "Debit (BDT)": apiTotalDebit || viewTotals.totalDebit,
      "Credit (BDT)": apiTotalCredit || viewTotals.totalCredit,
    });

    sheetData.push({
      Particulars: "Closing Balance",
      "Debit (BDT)": closingDebit,
      "Credit (BDT)": closingCredit,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaction Summary");
    XLSX.writeFile(
      wb,
      `transaction-summary-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  // PDF export
  const handlePDFExport = async () => {
    const blob = await pdf(
      <TransactionSummaryReportPDF
        rows={filteredRows}
        openingBalance={openingBalance}
        closingBalance={closingBalance}
        totals={{
          totalDebit: apiTotalDebit || viewTotals.totalDebit,
          totalCredit: apiTotalCredit || viewTotals.totalCredit,
        }}
        user={session?.user}
        meta={{
          start_date: appliedFilters?.start_date,
          end_date: appliedFilters?.end_date,
          view_order: appliedFilters?.view_order,
          currency,
        }}
      />
    ).toBlob();
    saveAs(
      blob,
      `transaction-summary-report-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Print
  const tableRef = useRef(null);
  const handlePrintTable = () => {
    if (!tableRef.current) return;
    const content = tableRef.current.innerHTML;
    const w = window.open("", "PRINT", "height=900,width=1200");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Transaction Summary Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #c7f48b; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .muted { color: #6b7280; font-size: 11px; }
            .section-row { background: #f9fafb; }
          </style>
        </head>
        <body>
          ${content}
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
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Transaction Summary Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Cash-book style summary of debit and credit within date range
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-lime-500 text-black">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide">
                Closing Balance ({currency})
              </p>
              <p className="text-2xl font-extrabold">{fmt2(closingBalance)}</p>
              <p className="text-xs text-black/70">
                Opening: {fmt2(openingBalance)} | Debit:{" "}
                {fmt2(apiTotalDebit || viewTotals.totalDebit)} | Credit:{" "}
                {fmt2(apiTotalCredit || viewTotals.totalCredit)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={(filters.start_date || "").slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "start_date",
                      e.target.value ? `${e.target.value}T00:00:00.000Z` : ""
                    )
                  }
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={(filters.end_date || "").slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "end_date",
                      e.target.value ? `${e.target.value}T23:59:59.999Z` : ""
                    )
                  }
                />
              </div>

              <div>
                <Label>Order</Label>
                <select
                  className="w-full h-[38px] rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.view_order}
                  onChange={(e) =>
                    handleFilterChange("view_order", e.target.value)
                  }
                >
                  <option value="asc">Ascending (Oldest first)</option>
                  <option value="desc">Descending (Newest first)</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={!filters.start_date || !filters.end_date}
                  title={
                    !filters.start_date || !filters.end_date
                      ? "Set date range first"
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
            placeholder="Search by particulars or details"
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
          <CardTitle>Cash Book Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading...
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
                    <TableRow className="bg-[#c7f48b]">
                      <TableHead className="font-bold text-black">
                        Particulars
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Debit ({currency})
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Credit ({currency})
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening Balance */}
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">Opening Balance</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(openingDebit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(openingCredit)}
                      </TableCell>
                    </TableRow>

                    {/* Transactions */}
                    {filteredRows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">
                            {r.particularsMain || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.particularsSub}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.debit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.credit)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Current Totals */}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>Current Total</TableCell>
                      <TableCell className="text-right">
                        {fmt2(apiTotalDebit || viewTotals.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(apiTotalCredit || viewTotals.totalCredit)}
                      </TableCell>
                    </TableRow>

                    {/* Closing Balance */}
                    <TableRow>
                      <TableCell className="font-semibold">
                        Closing Balance
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(closingDebit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(closingCredit)}
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
