"use client";

import React, { useMemo, useRef, useState } from "react";
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

import { useGetDateWiseDueListQuery } from "@/app/store/api/dueReportHistoryApi";
import DueReportHistoryPDF from "./due-report-history-pdf";

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

export default function DueReportHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { start, end } = defaultRange(90);

  const [filters, setFilters] = useState({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    due: "customer",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch date-wise due list only when filters applied
  const {
    data: dueRes,
    isLoading,
    error,
  } = useGetDateWiseDueListQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters?.start_date ||
      !appliedFilters?.end_date ||
      !appliedFilters?.due,
  });

  const dueRows = Array.isArray(dueRes?.data) ? dueRes.data : [];
  const apiTotalDue = Number(dueRes?.total_due ?? 0);

  // Normalize rows
  const rows = useMemo(() => {
    return dueRows.map((r) => ({
      invoiceId: r?.invoice_id || "",
      name: r?.name || "",
      totalAmount: clampNearZero(r?.total_amount),
      paidAmount: clampNearZero(r?.paid_amount),
      due: clampNearZero(r?.due),
    }));
  }, [dueRows]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // View totals
  const viewTotals = useMemo(() => {
    const totalAmount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.totalAmount) ? r.totalAmount : 0),
      0
    );
    const totalPaid = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.paidAmount) ? r.paidAmount : 0),
      0
    );
    const totalDue = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.due) ? r.due : 0),
      0
    );
    return { totalAmount, totalPaid, totalDue };
  }, [filteredRows]);

  // Handlers
  const apply = () => setAppliedFilters(filters);

  // Export Excel
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      "Invoice ID": r.invoiceId,
      Name: r.name,
      "Total Amount (BDT)": r.totalAmount,
      "Paid Amount (BDT)": r.paidAmount,
      "Due (BDT)": r.due,
    }));
    sheetData.push({
      "Invoice ID": "Totals",
      "Total Amount (BDT)": viewTotals.totalAmount,
      "Paid Amount (BDT)": viewTotals.totalPaid,
      "Due (BDT)": viewTotals.totalDue,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Due History");
    XLSX.writeFile(
      wb,
      `due-report-history-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <DueReportHistoryPDF
        rows={filteredRows}
        totals={viewTotals}
        apiTotalDue={apiTotalDue}
        user={session?.user}
        meta={{
          start_date: appliedFilters?.start_date,
          end_date: appliedFilters?.end_date,
          due: appliedFilters?.due,
        }}
      />
    ).toBlob();
    saveAs(
      blob,
      `due-report-history-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Due Report History</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .neg { color: #dc2626; }
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

  const dueTypeOptions = [
    { value: "customer", label: "Customer" },
    { value: "vendor", label: "Vendor" },
    { value: "wholesaler", label: "Wholesaler" },
    { value: "exporter", label: "Exporter" },
    { value: "carrier", label: "Carrier" },
  ];
  const dueTypeLabel =
    dueTypeOptions.find((o) => o.value === appliedFilters?.due)?.label ||
    appliedFilters?.due ||
    "-";

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
              Due Report History
            </h1>
            <p className="text-sm text-muted-foreground">
              Date-wise dues grouped by invoice for the selected type
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-violet-600 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-extrabold">
                {fmt2(apiTotalDue || viewTotals.totalDue)} BDT
              </p>
              <p className="text-sm font-medium">Total Due </p>
              <p className="text-xs opacity-90">
                Type: {dueTypeLabel} | Period:{" "}
                {new Date(appliedFilters.start_date).toLocaleDateString()} -{" "}
                {new Date(appliedFilters.end_date).toLocaleDateString()}
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
                    setFilters((prev) => ({
                      ...prev,
                      start_date: e.target.value
                        ? `${e.target.value}T00:00:00.000Z`
                        : prev.start_date,
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
                      end_date: e.target.value
                        ? `${e.target.value}T23:59:59.999Z`
                        : prev.end_date,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Due Type</Label>
                <select
                  className="w-full h-[38px] rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.due}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, due: e.target.value }))
                  }
                >
                  {dueTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={
                    !filters.start_date || !filters.end_date || !filters.due
                  }
                  title={
                    !filters.start_date || !filters.end_date || !filters.due
                      ? "Set date range and type"
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
            placeholder="Search by invoice or name"
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
          <CardTitle>Invoices and Due</CardTitle>
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
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">
                        Invoice
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Name
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Total Amount (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Paid Amount (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Due (BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.paidAmount)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            r.due < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {fmt2(r.due)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Totals</TableCell>
                        <TableCell />
                        <TableCell className="text-right">
                          {fmt2(viewTotals.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.totalPaid)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            viewTotals.totalDue < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {fmt2(viewTotals.totalDue)}
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
