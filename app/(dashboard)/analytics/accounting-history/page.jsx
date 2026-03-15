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

import { useGetAccountingHistoryQuery } from "@/app/store/api/accountingHistoryApi";
import AccountingHistoryPDF from "./accounting-history-pdf";

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPrettyDate = (isoDate) => {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const now = new Date();
  const t = new Date(iso);
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

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

export default function AccountingHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters
  const [filters, setFilters] = useState({
    from_date: todayStartISO(),
    to_date: todayEndISO(),
    page: 1,
    limit: 50,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetAccountingHistoryQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const raw = res?.data?.data || [];
  const totalTxAmount = Number(res?.total_transaction_amount ?? 0);

  // Flatten rows: one row per multiple_payments entry
  const flatRows = useMemo(() => {
    const rows = [];
    (raw || []).forEach((tx) => {
      const payments = Array.isArray(tx?.multiple_payments)
        ? tx.multiple_payments
        : [];
      if (payments.length === 0) {
        rows.push({
          id: tx.id,
          date: tx.transaction_date,
          created_at: tx.created_at,
          paymentType: "",
          paymentCategory: "",
          accountNumber: "",
          transCategory: tx.transaction_category || "",
          transType: "",
          refId: tx.transaction_description || "",
          transName: tx.transaction_name || "",
          amount: Number(tx.transaction_amount ?? 0),
        });
      } else {
        payments.forEach((p) => {
          rows.push({
            id: tx.id,
            date: tx.transaction_date,
            created_at: tx.created_at,
            paymentType: p?.payment_type?.type_name || "",
            paymentCategory:
              p?.payment_type_category?.payment_category_name || "",
            accountNumber: p?.payment_type_category?.account_number || "",
            transCategory: tx.transaction_category || "",
            transType: p?.type || "",
            refId: p?.invoice_id || tx.transaction_description || "",
            transName: tx.transaction_name || "",
            amount: Number(p?.payment_amount ?? 0),
          });
        });
      }
    });
    // Order by created_at desc by default (latest first) for viewing history feel
    rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return rows;
  }, [raw]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return flatRows;
    const q = searchTerm.toLowerCase();
    return flatRows.filter(
      (r) =>
        (r.paymentType || "").toLowerCase().includes(q) ||
        (r.paymentCategory || "").toLowerCase().includes(q) ||
        (r.accountNumber || "").toLowerCase().includes(q) ||
        (r.transCategory || "").toLowerCase().includes(q) ||
        (r.transType || "").toLowerCase().includes(q) ||
        (r.refId || "").toLowerCase().includes(q) ||
        (r.transName || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [flatRows, searchTerm]);

  // Totals for the view
  const viewTotal = useMemo(
    () =>
      filteredRows.reduce(
        (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
        0
      ),
    [filteredRows]
  );

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Export Excel
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      "Date/Time": `${formatPrettyDate(r.date)} ${new Date(r.created_at)
        .toTimeString()
        .slice(0, 8)}`,
      "Payment Type": r.paymentType,
      "Payment Category": r.paymentCategory,
      "Account Number": r.accountNumber,
      "Transaction Category": r.transCategory,
      "Transaction Type": r.transType,
      "Ref ID": r.refId,
      "Transaction Name": r.transName,
      Amount: r.amount,
    }));
    sheetData.push({
      "Date/Time": "Total",
      Amount: viewTotal,
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounting History");
    XLSX.writeFile(
      wb,
      `accounting-history-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <AccountingHistoryPDF
        rows={filteredRows.map((r) => ({
          ...r,
          prettyDate: formatPrettyDate(r.date),
          relative: relativeTime(r.created_at),
          time: new Date(r.created_at).toTimeString().slice(0, 8),
        }))}
        totals={{ viewTotal, totalTxAmount }}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `accounting-history-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Accounting History</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #eef2ff; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .muted { color: #6b7280; font-size: 11px; }
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
              Accounting History
            </h1>
            <p className="text-sm text-muted-foreground">
              Detailed transaction list with account breakdown
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold">{fmt2(viewTotal)} BDT</p>
              <p className="text-sm font-medium">
                Accounting History (Current List)
              </p>
              <p className="text-xs opacity-90 mt-1">
                API Total: {fmt2(totalTxAmount)} BDT
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="from_date">Start Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={filters.from_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "from_date",
                      e.target.value ? `${e.target.value}T00:00:00.000Z` : ""
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="to_date">End Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={filters.to_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "to_date",
                      e.target.value ? `${e.target.value}T23:59:59.999Z` : ""
                    )
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Limit</Label>
                <Select
                  value={String(filters.limit)}
                  onValueChange={(v) => handleFilterChange("limit", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
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
            placeholder="Search transactions"
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
          <CardTitle>Accounting History</CardTitle>
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
                    <TableRow className="bg-indigo-50">
                      <TableHead className="font-bold text-black">
                        Date/Time
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        AC/Number
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Category
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Type
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Ref ID
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Name
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.id}-${idx}`}>
                        <TableCell>
                          <div>{formatPrettyDate(r.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {relativeTime(r.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {r.paymentType || "-"}
                          </div>
                          <div className="text-xs">
                            {r.paymentCategory || "-"}
                          </div>
                          <div className="text-xs">
                            {r.accountNumber || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{r.transCategory}</TableCell>
                        <TableCell>{r.transType}</TableCell>
                        <TableCell>{r.refId}</TableCell>
                        <TableCell>{r.transName}</TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.amount)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={6} className="text-right">
                          Total
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotal)}
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
