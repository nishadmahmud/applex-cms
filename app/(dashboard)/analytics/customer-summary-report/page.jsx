"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AsyncSelect from "react-select/async";
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
  useGetCustomerSummaryReportQuery,
  useGetCustomersQuery,
  useLazySearchCustomersQuery,
} from "@/app/store/api/customerSummaryReportApi";
import CustomerSummaryReportPDF from "./customer-summary-report-pdf";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

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

export default function CustomerSummaryReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters and selection
  const [selCustomer, setSelCustomer] = useState(null);
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    customer_id: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Default customers
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
        const res = await triggerSearch({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
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

  // Fetch report only when a customer is selected and applied
  const {
    data: res,
    isLoading,
    error,
  } = useGetCustomerSummaryReportQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters.customer_id ||
      !appliedFilters.start_date ||
      !appliedFilters.end_date,
  });

  const invoices = useMemo(
    () => (Array.isArray(res?.data?.invoice_list) ? res.data.invoice_list : []),
    [res]
  );

  // Normalize rows
  const rows = useMemo(() => {
    return invoices.map((inv) => {
      const date = inv?.created_at
        ? new Date(inv.created_at).toISOString().slice(0, 10)
        : "";
      const qty = Number(inv?.sub_total_quantity ?? 0);
      const subTotal = Number(inv?.sub_total ?? 0);
      const paid = Number(inv?.paid_amount ?? 0);
      const due = subTotal - paid;
      return {
        date,
        invoiceId: inv?.invoice_id || "",
        qty,
        subTotal,
        paid,
        due,
      };
    });
  }, [invoices]);

  // Search by invoice or date
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Totals for view
  const totals = useMemo(() => {
    const totalQty = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.qty) ? r.qty : 0),
      0
    );
    const totalSub = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.subTotal) ? r.subTotal : 0),
      0
    );
    const totalPaid = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.paid) ? r.paid : 0),
      0
    );
    const totalDue = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.due) ? r.due : 0),
      0
    );
    return { totalQty, totalSub, totalPaid, totalDue };
  }, [filteredRows]);

  // Handlers
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const apply = () => setAppliedFilters(filters);

  // Excel export
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      Date: r.date,
      "Invoice ID": r.invoiceId,
      Qty: r.qty,
      "Sub Total (BDT)": r.subTotal,
      "Paid (BDT)": r.paid,
      "Due (BDT)": r.due,
    }));
    sheetData.push({
      Date: "Totals",
      Qty: totals.totalQty,
      "Sub Total (BDT)": totals.totalSub,
      "Paid (BDT)": totals.totalPaid,
      "Due (BDT)": totals.totalDue,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Summary");
    XLSX.writeFile(
      wb,
      `customer-summary-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <CustomerSummaryReportPDF
        rows={filteredRows}
        totals={totals}
        filters={appliedFilters}
        user={session?.user}
        customerLabel={selCustomer?.label || ""}
      />
    ).toBlob();
    saveAs(
      blob,
      `customer-summary-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Customer Summary Report</title>
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
              Customer Summary Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Invoice summary for selected customer within date range
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        {/* KPI */}
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-extrabold">
                {fmt(totals.totalDue)} BDT
              </p>
              <p className="text-sm font-medium">Total Due (Current View)</p>
              {selCustomer?.label && (
                <p className="text-xs opacity-90">
                  Customer: {selCustomer.label}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Customer</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultOptions}
                  loadOptions={loadCustomerOptions}
                  styles={rsStyles}
                  value={selCustomer}
                  onChange={(opt) => {
                    setSelCustomer(opt);
                    handleFilterChange("customer_id", opt?.value || null);
                  }}
                  isClearable
                  placeholder="Search / Select customer"
                />
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={
                    filters.start_date ? filters.start_date.slice(0, 10) : ""
                  }
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
                  value={filters.end_date ? filters.end_date.slice(0, 10) : ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "end_date",
                      e.target.value ? `${e.target.value}T23:59:59.999Z` : ""
                    )
                  }
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={!filters.customer_id}
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
            placeholder="Search by invoice/date"
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
          <CardTitle>Customer Summary</CardTitle>
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
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Invoice
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sub Total (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Paid (BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Due (BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell className="text-right">
                          {fmt(r.qty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.subTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(r.paid)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            r.due < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {fmt(r.due)}
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

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Totals</TableCell>
                        <TableCell />
                        <TableCell className="text-right">
                          {fmt(totals.totalQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(totals.totalSub)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(totals.totalPaid)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            totals.totalDue < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {fmt(totals.totalDue)}
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
