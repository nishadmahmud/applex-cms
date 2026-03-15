"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AsyncSelect from "react-select/async";
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

import {
  useGetCustomerWiseDueListQuery,
  useGetCustomersQuery,
  useLazySearchCustomersQuery,
} from "@/app/store/api/customerWiseDueReportApi";
import CustomerWiseDueReportPDF from "./customer-wise-due-report-pdf";

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const rsStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderColor: state.isFocused ? "#93c5fd" : "#e5e7eb",
    boxShadow: "none",
    ":hover": { borderColor: "#93c5fd" },
    fontSize: 14,
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  option: (base) => ({ ...base, fontSize: 14 }),
};

export default function CustomerWiseDueReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Selected customer via React-Select
  const [selCustomer, setSelCustomer] = useState(null);
  const [filters, setFilters] = useState({
    customer_id: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");

  // Initial customers for defaultOptions
  const { data: customersRes } = useGetCustomersQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const [triggerSearch] = useLazySearchCustomersQuery();

  const defaultOptions = useMemo(() => {
    const list = customersRes?.data?.data || [];
    return list.map((c) => ({
      label: c?.name || `#${c?.id}`,
      value: c?.id,
      meta: c,
    }));
  }, [customersRes]);

  const loadCustomerOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultOptions;
      try {
        const resp = await triggerSearch({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = resp?.data?.data || [];
        return list.map((c) => ({
          label: c?.name || `#${c?.id}`,
          value: c?.id,
          meta: c,
        }));
      } catch {
        return defaultOptions;
      }
    },
    [triggerSearch, defaultOptions]
  );

  // Fetch due list only when customer selected and applied
  const {
    data: dueRes,
    isLoading,
    error,
  } = useGetCustomerWiseDueListQuery(appliedFilters, {
    skip: status !== "authenticated" || !appliedFilters.customer_id,
  });

  const dueRows = Array.isArray(dueRes?.data) ? dueRes.data : [];
  const totalDueAPI = Number(dueRes?.total_due ?? 0);

  // Normalized rows
  const rows = useMemo(() => {
    return dueRows.map((r) => ({
      invoiceId: r?.invoice_id || "",
      customerName: r?.name || "",
      totalAmount: Number(r?.total_amount ?? 0),
      afterDiscount: Number(r?.after_discount ?? 0),
      paidAmount: Number(r?.paid_amount ?? 0),
      remaining: Number(r?.remaining ?? 0),
    }));
  }, [dueRows]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // View totals
  const viewTotals = useMemo(() => {
    const total = filteredRows.reduce((s, r) => s + (Number.isFinite(r.remaining) ? r.remaining : 0), 0);
    const totalPaid = filteredRows.reduce((s, r) => s + (Number.isFinite(r.paidAmount) ? r.paidAmount : 0), 0);
    const totalAfterDisc = filteredRows.reduce((s, r) => s + (Number.isFinite(r.afterDiscount) ? r.afterDiscount : 0), 0);
    return { totalRemaining: total, totalPaid, totalAfterDisc };
  }, [filteredRows]);

  // Handlers
  const apply = () => setAppliedFilters(filters);

  // Export Excel
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      "Invoice ID": r.invoiceId,
      "Customer": r.customerName,
      "Total Amount (BDT)": r.totalAmount,
      "After Discount (BDT)": r.afterDiscount,
      "Paid Amount (BDT)": r.paidAmount,
      "Remaining (BDT)": r.remaining,
    }));
    sheetData.push({
      "Invoice ID": "Total Due",
      "Remaining (BDT)": viewTotals.totalRemaining,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Due");
    XLSX.writeFile(wb, `customer-wise-due-report-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Export PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <CustomerWiseDueReportPDF
        rows={filteredRows}
        totals={viewTotals}
        apiTotalDue={totalDueAPI}
        user={session?.user}
        customerLabel={selCustomer?.label || ""}
      />
    ).toBlob();
    saveAs(blob, `customer-wise-due-report-${new Date().toISOString().split("T")[0]}.pdf`);
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
          <title>Customer Wise Due Report</title>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Customer Wise Due Report</h1>
            <p className="text-sm text-muted-foreground">Outstanding by invoice for a selected customer</p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-extrabold">{fmt2(totalDueAPI || viewTotals.totalRemaining)} BDT</p>
              <p className="text-sm font-medium">Total Due (API/view)</p>
              {selCustomer?.label && (
                <p className="text-xs opacity-90">Customer: {selCustomer.label}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Label>Customer</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultOptions}
                  loadOptions={loadCustomerOptions}
                  styles={rsStyles}
                  value={selCustomer}
                  onChange={(opt) => {
                    setSelCustomer(opt);
                    setFilters((prev) => ({ ...prev, customer_id: opt?.value || null }));
                  }}
                  placeholder="Search / Select customer"
                  isClearable
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={!filters.customer_id}
                  title={!filters.customer_id ? "Select a customer first" : "Get Report"}
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
            placeholder="Search by invoice or customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 border-gray-200">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-gray-600 font-semibold text-sm">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExcelExport} className="hover:bg-blue-50">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePDFExport} className="hover:bg-blue-50">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrintTable} className="hover:bg-blue-50">
              <Printer className="h-4 w-4 mr-2 text-blue-500" />
              Print Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices and Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">Error loading data</div>
          ) : (
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">Invoice</TableHead>
                      <TableHead className="font-bold text-black">Customer</TableHead>
                      <TableHead className="font-bold text-black text-right">Total Amount (BDT)</TableHead>
                      <TableHead className="font-bold text-black text-right">After Discount (BDT)</TableHead>
                      <TableHead className="font-bold text-black text-right">Paid Amount (BDT)</TableHead>
                      <TableHead className="font-bold text-black text-right">Remaining (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell>{r.customerName}</TableCell>
                        <TableCell className="text-right">{fmt2(r.totalAmount)}</TableCell>
                        <TableCell className="text-right">{fmt2(r.afterDiscount)}</TableCell>
                        <TableCell className="text-right">{fmt2(r.paidAmount)}</TableCell>
                        <TableCell className={`text-right ${r.remaining < 0 ? "text-red-600" : ""}`}>
                          {fmt2(r.remaining)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No data found</TableCell>
                      </TableRow>
                    )}

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Total Due</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-right">{fmt2(viewTotals.totalAfterDisc)}</TableCell>
                        <TableCell className="text-right">{fmt2(viewTotals.totalPaid)}</TableCell>
                        <TableCell className={`text-right ${viewTotals.totalRemaining < 0 ? "text-red-600" : ""}`}>
                          {fmt2(viewTotals.totalRemaining)}
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