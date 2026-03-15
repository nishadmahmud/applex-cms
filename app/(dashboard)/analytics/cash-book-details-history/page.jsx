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
  useGetCashBookReportQuery,
  useGetPaymentTypesQuery,
} from "@/app/store/api/cashBookReportApi";
import CashBookDetailsHistoryPDF from "./cash-book-details-history-pdf";

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

export default function CashBookDetailsHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default to today, ascending, all payment types)
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    view_order: "asc",
    payment_type_id: "all", // use "all" to avoid empty string issue in shadcn Select
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const {
    data: reportRes,
    isLoading,
    error,
  } = useGetCashBookReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const { data: payTypesRes } = useGetPaymentTypesQuery(
    { page: 1, limit: 100 },
    { skip: status !== "authenticated" }
  );

  const paymentTypes = payTypesRes?.data?.data || [];
  const selectedPayTypeName =
    filters.payment_type_id === "all"
      ? "All"
      : paymentTypes.find(
          (p) => String(p.id) === String(filters.payment_type_id)
        )?.type_name || "All";

  const rawRows = reportRes?.data || [];
  const openingBalance = Number(reportRes?.opening_balance ?? 0);
  const closingBalance = Number(reportRes?.closing_balance ?? 0);
  const totalCreditAPI = Number(reportRes?.current_total_credit ?? 0);
  const totalDebitAPI = Number(reportRes?.current_total_debit ?? 0);

  const baseRows = useMemo(() => {
    // Normalize rows and compute debit/credit fields
    return (rawRows || []).map((r) => {
      const status = (r?.status || "").toLowerCase();
      const amount = Number(r?.payment_amount ?? 0);
      const debit = status === "debit" || status === "out" ? amount : 0;
      const credit = status === "credit" ? amount : 0;
      return {
        date: r?.date || "",
        particulars: r?.particulars || "",
        paymentType: r?.type_name || "",
        vchType: r?.type || "",
        vchNumber: r?.invoice_id || "",
        debit,
        credit,
      };
    });
  }, [rawRows]);

  // Sort ascending by date for computing running balance
  const ascRows = useMemo(() => {
    return [...baseRows].sort((a, b) => a.date.localeCompare(b.date));
  }, [baseRows]);

  // Running balance computed on ascending order
  const ascWithBalance = useMemo(() => {
    let running = openingBalance;
    return ascRows.map((r, idx) => {
      running = running + r.credit - r.debit;
      return { ...r, balance: running, _ascIndex: idx + 1 };
    });
  }, [ascRows, openingBalance]);

  // Opening row (serial 0)
  const openingRow = useMemo(
    () => ({
      serial: 0,
      date: (appliedFilters?.start_date || "").slice(0, 10),
      particulars: "",
      paymentType: "",
      vchType: "Opening Balance",
      vchNumber: "",
      debit: 0,
      credit: 0,
      balance: openingBalance,
      isOpening: true,
    }),
    [appliedFilters?.start_date, openingBalance]
  );

  // Merge rows in the requested order for display
  const displayRows = useMemo(() => {
    const order = appliedFilters.view_order || "asc";
    const data =
      order === "desc" ? [...ascWithBalance].reverse() : ascWithBalance;
    // attach serial numbers after the opening row
    return data.map((r, i) => ({
      serial: i + 1,
      ...r,
    }));
  }, [ascWithBalance, appliedFilters.view_order]);

  // Search filter (by particulars, vch number, payment type, vch type)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredRows = useMemo(() => {
    if (!searchTerm) return displayRows;
    const q = searchTerm.toLowerCase();
    return displayRows.filter((r) => {
      return (
        (r.particulars || "").toLowerCase().includes(q) ||
        (r.vchNumber || "").toLowerCase().includes(q) ||
        (r.paymentType || "").toLowerCase().includes(q) ||
        (r.vchType || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
      );
    });
  }, [displayRows, searchTerm]);

  // Totals for view (use API totals when no search to stay consistent; recompute on search)
  const totals = useMemo(() => {
    if (!searchTerm) {
      return {
        debit: totalDebitAPI,
        credit: totalCreditAPI,
        closing: closingBalance,
      };
    }
    const debit = filteredRows.reduce((s, r) => s + r.debit, 0);
    const credit = filteredRows.reduce((s, r) => s + r.credit, 0);
    const closing = openingBalance + credit - debit;
    return { debit, credit, closing };
  }, [
    searchTerm,
    filteredRows,
    totalDebitAPI,
    totalCreditAPI,
    closingBalance,
    openingBalance,
  ]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Export Excel
  const handleExcelExport = () => {
    const rowsToExport = [openingRow, ...filteredRows];
    const sheetData = rowsToExport.map((r) => ({
      "Serial No": r.serial,
      "Transaction Date": r.date,
      Particulars: r.particulars,
      "Payment Types": r.paymentType,
      "Vch Types": r.vchType,
      "Vch Number": r.vchNumber,
      "Debit (BDT)": r.debit,
      "Credit (BDT)": r.credit,
      "Balance (BDT)": r.balance,
    }));
    // Totals row
    sheetData.push({
      "Serial No": "",
      "Transaction Date": "",
      Particulars: "Totals",
      "Payment Types": "",
      "Vch Types": "",
      "Vch Number": "",
      "Debit (BDT)": totals.debit,
      "Credit (BDT)": totals.credit,
      "Balance (BDT)": totals.closing,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Book");
    XLSX.writeFile(
      wb,
      `cash-book-details-history-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <CashBookDetailsHistoryPDF
        openingRow={openingRow}
        rows={filteredRows}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
        payTypeName={selectedPayTypeName}
      />
    ).toBlob();
    saveAs(
      blob,
      `cash-book-details-history-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Cash Book Details History</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #e8f5c8; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
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
              Cash Book Details History
            </h1>
            <p className="text-sm text-muted-foreground">
              Ledger of cash movement with running balance
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
                {fmt2(totals.closing)} BDT
              </p>
              <p className="text-sm font-medium">Cash Book Report</p>
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
                    <SelectValue placeholder="Select All" />
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

              <div className="flex items-center gap-4">
                <div>
                  <Label>Order</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="view_order"
                        value="asc"
                        checked={filters.view_order === "asc"}
                        onChange={(e) =>
                          handleFilterChange("view_order", e.target.value)
                        }
                      />
                      Asc
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="view_order"
                        value="desc"
                        checked={filters.view_order === "desc"}
                        onChange={(e) =>
                          handleFilterChange("view_order", e.target.value)
                        }
                      />
                      Desc
                    </label>
                  </div>
                </div>

                <div className="ml-auto">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={apply}
                  >
                    Report
                  </Button>
                </div>
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
            placeholder="Search (Particulars / Vch No / Type)"
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
          <CardTitle>Cash Book</CardTitle>
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
                        Payment Types
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Vch Types
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Vch Number
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Debit (in BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Credit (in BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Balance (in BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening row */}
                    <TableRow>
                      <TableCell>-</TableCell>
                      <TableCell>{openingRow.date}</TableCell>
                      <TableCell>{openingRow.particulars}</TableCell>
                      <TableCell></TableCell>
                      <TableCell>Opening Balance</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">0.00</TableCell>
                      <TableCell className="text-right">0.00</TableCell>
                      <TableCell className="text-right">
                        {fmt2(openingRow.balance)}
                      </TableCell>
                    </TableRow>

                    {/* Data rows */}
                    {filteredRows.map((r, index) => (
                      <TableRow key={`${r.serial}-${r.vchNumber}-${r.date}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.particulars}</TableCell>
                        <TableCell>{r.paymentType}</TableCell>
                        <TableCell>{r.vchType}</TableCell>
                        <TableCell>{r.vchNumber}</TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.debit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.credit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.balance)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Totals */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={6} className="text-right">
                        Totals
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(totals.debit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(totals.credit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(totals.closing)}
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
