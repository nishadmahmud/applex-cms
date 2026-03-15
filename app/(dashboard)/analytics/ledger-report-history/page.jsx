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

import { useGetMonthlyLedgerReportQuery } from "@/app/store/api/ledgerReportHistoryApi";
import LedgerReportHistoryPDF from "./ledger-report-history-pdf";

// Formatters (no thousands separators to match your screenshot)
const fmtInt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    useGrouping: false,
  });

const fmtDec = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    useGrouping: false,
  });

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

export default function LedgerReportHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default to today's date)
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
  } = useGetMonthlyLedgerReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const openingBalance = res?.data?.opening_balance ?? 0;
  const ledgerData = res?.data?.ledger_data ?? [];
  const closingBalance = res?.data?.closing_balance ?? 0;
  const grandDebit = res?.data?.grand_total_debit ?? 0;
  const grandCredit = res?.data?.grand_total_credit ?? 0;

  // Normalize rows
  const rows = useMemo(() => {
    return (ledgerData || []).map((item, idx) => ({
      sl: idx + 1,
      particulars: item?.particulars || "",
      debit: Number(item?.debit ?? 0),
      credit: Number(item?.credit ?? 0),
      closing_balance: Number(item?.closing_balance ?? 0),
    }));
  }, [ledgerData]);

  // Search by particulars
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) => (r.particulars || "").toLowerCase().includes(q));
  }, [rows, searchTerm]);

  // Totals for filtered view (fallback to API totals when no search)
  const filteredTotals = useMemo(() => {
    const debit = filteredRows.reduce((s, r) => s + r.debit, 0);
    const credit = filteredRows.reduce((s, r) => s + r.credit, 0);
    return { debit, credit };
  }, [filteredRows]);

  const showDebitTotal = searchTerm ? filteredTotals.debit : grandDebit;
  const showCreditTotal = searchTerm ? filteredTotals.credit : grandCredit;

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Exports
  const handleExcelExport = () => {
    const opening = [
      {
        Particulars: "Opening",
        "Debit (BDT)": "",
        "Credit (BDT)": "",
        "Closing Balance (BDT)": openingBalance,
      },
    ];
    const dataRows = filteredRows.map((r) => ({
      Particulars: r.particulars,
      "Debit (BDT)": r.debit,
      "Credit (BDT)": r.credit,
      "Closing Balance (BDT)": r.closing_balance,
    }));
    const grand = [
      {
        Particulars: "Grand Total",
        "Debit (BDT)": showDebitTotal,
        "Credit (BDT)": showCreditTotal,
        "Closing Balance (BDT)": closingBalance,
      },
    ];
    const sheetData = [...opening, ...dataRows, ...grand];

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger Report");
    XLSX.writeFile(
      wb,
      `ledger-report-history-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <LedgerReportHistoryPDF
        openingBalance={openingBalance}
        rows={filteredRows}
        totals={{
          debit: showDebitTotal,
          credit: showCreditTotal,
          closingBalance,
        }}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `ledger-report-history-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Ledger Report History</title>
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
            window.onload = function () { window.print(); window.close(); }
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
              Ledger Report History
            </h1>
            <p className="text-sm text-muted-foreground">
              Monthly debit, credit and running closing balance
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white flex justify-center items-center">
          <CardContent className="p-3">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{fmtDec(closingBalance)} BDT</p>
              <p className="text-sm font-medium">Closing Balance</p>
              <p className="text-xs opacity-90">
                Opening: {fmtDec(openingBalance)} | Debit:{" "}
                {fmtInt(showDebitTotal)} | Credit: {fmtInt(showCreditTotal)}
              </p>
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
                  onClick={() => setAppliedFilters(filters)}
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
            placeholder="Search by Particulars"
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
          <CardTitle>Ledger Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading ledger...
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
                        Particulars
                        <div className="text-[10px] text-muted-foreground"></div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Debit
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Credit
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Closing Balance
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening row */}
                    <TableRow>
                      <TableCell>Opening</TableCell>
                      <TableCell className="text-right"></TableCell>
                      <TableCell className="text-right"></TableCell>
                      <TableCell className="text-right">
                        {fmtDec(openingBalance)}
                      </TableCell>
                    </TableRow>

                    {/* Ledger rows */}
                    {filteredRows.map((r) => (
                      <TableRow key={r.sl}>
                        <TableCell>{r.particulars}</TableCell>
                        <TableCell className="text-right">
                          {fmtInt(r.debit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtInt(r.credit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtDec(r.closing_balance)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Grand total row */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell className="text-right">
                        {fmtInt(showDebitTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtInt(showCreditTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtDec(closingBalance)}
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
