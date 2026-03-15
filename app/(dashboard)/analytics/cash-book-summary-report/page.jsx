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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from "lucide-react";

import {
  useGetCashBookSummaryReportQuery,
  useGetPaymentTypesQuery,
} from "@/app/store/api/cashBookSummaryReportApi";
import CashBookSummaryReportPDF from "./cash-book-summary-report-pdf";

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export default function CashBookSummaryReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default today, payment_type_id=all to avoid empty value)
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    payment_type_id: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Data queries
  const { data: payTypesRes } = useGetPaymentTypesQuery(
    { page: 1, limit: 100 },
    { skip: status !== "authenticated" }
  );
  const paymentTypes = payTypesRes?.data?.data || [];

  const {
    data: reportRes,
    isLoading,
    error,
  } = useGetCashBookSummaryReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const rawData = Array.isArray(reportRes?.data) ? reportRes.data : [];
  const openingBalanceAPI = Number(reportRes?.opening_balance ?? 0);
  const closingBalanceAPI = Number(reportRes?.closing_balance ?? 0);
  const totalCreditAPI = Number(reportRes?.current_total_credit ?? 0);
  const totalDebitAPI = Number(reportRes?.current_total_debit ?? 0);

  const selectedPayTypeName =
    filters.payment_type_id === "all"
      ? "All"
      : paymentTypes.find(
          (p) => String(p.id) === String(filters.payment_type_id)
        )?.type_name || "All";

  // Normalize rows -> compute debit/credit
  const baseRows = useMemo(() => {
    return rawData.map((r, idx) => {
      const status = (r?.status || "").toLowerCase();
      const amount = Number(r?.total_amount ?? 0);
      return {
        idx,
        date: r?.date || "",
        particulars: r?.particulars || "",
        vchType: r?.type || "",
        debit: status === "debit" || status === "out" ? amount : 0,
        credit: status === "credit" ? amount : 0,
      };
    });
  }, [rawData]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm) return baseRows;
    const q = searchTerm.toLowerCase();
    return baseRows.filter(
      (r) =>
        (r.particulars || "").toLowerCase().includes(q) ||
        (r.vchType || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [baseRows, searchTerm]);

  // Totals for current view
  const viewTotals = useMemo(() => {
    const debit = filteredRows.reduce((s, r) => s + r.debit, 0);
    const credit = filteredRows.reduce((s, r) => s + r.credit, 0);
    const closing = openingBalanceAPI + credit - debit;
    return { debit, credit, closing };
  }, [filteredRows, openingBalanceAPI]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Excel
  const handleExcelExport = () => {
    const sheetData = [];

    // Opening
    sheetData.push({
      "Serial No": "",
      "Transaction Date": "",
      Particulars: "Opening Balance",
      "Vch Types": "",
      "Debit (BDT)": 0,
      "Credit (BDT)": openingBalanceAPI,
    });

    // List
    filteredRows.forEach((r, idx) => {
      sheetData.push({
        "Serial No": idx + 1,
        "Transaction Date": r.date,
        Particulars: r.particulars,
        "Vch Types": r.vchType,
        "Debit (BDT)": r.debit,
        "Credit (BDT)": r.credit,
      });
    });

    // Current total
    sheetData.push({
      "Serial No": "",
      "Transaction Date": "",
      Particulars: "Current Total",
      "Vch Types": "",
      "Debit (BDT)": viewTotals.debit,
      "Credit (BDT)": viewTotals.credit,
    });

    // Closing
    sheetData.push({
      "Serial No": "",
      "Transaction Date": "",
      Particulars: "Closing Balance",
      "Vch Types": "",
      "Debit (BDT)": "",
      "Credit (BDT)": viewTotals.closing,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Book Summary");
    XLSX.writeFile(
      wb,
      `cash-book-summary-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <CashBookSummaryReportPDF
        rows={filteredRows}
        opening={openingBalanceAPI}
        totals={viewTotals}
        filters={appliedFilters}
        user={session?.user}
        payTypeName={selectedPayTypeName}
      />
    ).toBlob();
    saveAs(
      blob,
      `cash-book-summary-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Cash Book Summary Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #e8f5c8; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .link { color: #2563eb; text-decoration: underline; }
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
              Cash Book Summary Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Opening balance, current totals and closing balance by payment
              type
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold">
                {fmt2(viewTotals.closing)} BDT
              </p>
              <p className="text-sm font-medium">Closing Balance</p>
              <p className="text-xs opacity-90 mt-1">
                Debit: {fmt2(viewTotals.debit)} | Credit:{" "}
                {fmt2(viewTotals.credit)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
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
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <Label>Payment Type</Label>
                <Select
                  value={filters.payment_type_id}
                  onValueChange={(v) =>
                    handleFilterChange("payment_type_id", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select All</SelectItem>
                    {paymentTypes.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.type_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by Particulars / Type / Date"
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
              Loading summary...
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
                    <TableRow className="bg-lime-100">
                      <TableHead className="font-bold text-black">
                        Serial No
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Particulars
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Vch Types
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Debit (in BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Credit (in BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening Balance */}
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-medium">
                        Opening Balance
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">
                        {fmt2(openingBalanceAPI)}
                      </TableCell>
                    </TableRow>

                    {/* Data rows */}
                    {filteredRows.map((r, i) => (
                      <TableRow key={`${r.date}-${i}`}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.particulars || "-"}</TableCell>
                        <TableCell>{r.vchType}</TableCell>
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
                        <TableCell colSpan={6} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Current Total */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={4} className="text-right">
                        Current Total
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(viewTotals.debit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(viewTotals.credit)}
                      </TableCell>
                    </TableRow>

                    {/* Closing Balance */}
                    <TableRow>
                      <TableCell colSpan={5}>
                        <span className="text-blue-600 underline">
                          Closing Balance
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(viewTotals.closing)}
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
