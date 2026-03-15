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
  useGetCustomerDueAgingReportQuery,
  useGetCustomersQuery,
  useLazySearchCustomersQuery,
} from "@/app/store/api/customer-due-aging-report-api";
import CustomerDueAgingReportPDF from "./customer-due-aging-report-pdf";

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

export default function CustomerDueAgingReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters & state
  const savedLimit =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("customerDueLimit")) || 50
      : 50;

  const [selCustomer, setSelCustomer] = useState(null);
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    customer_id: null,
    limit: savedLimit,
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

  // Report query
  const {
    data: res,
    isLoading,
    error,
  } = useGetCustomerDueAgingReportQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters.start_date ||
      !appliedFilters.end_date,
  });

  const rows = useMemo(() => (Array.isArray(res?.data) ? res.data : []), [res]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.invoice_id || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const totalSales = filteredRows.reduce(
      (s, r) => s + (Number(r.last_sales_amount) || 0),
      0
    );
    const totalReceipt = filteredRows.reduce(
      (s, r) => s + (Number(r.last_receipt_amount) || 0),
      0
    );
    const totalDue = filteredRows.reduce(
      (s, r) => s + (Number(r.current_due) || 0),
      0
    );
    return { totalSales, totalReceipt, totalDue };
  }, [filteredRows]);

  const handleFilterChange = (k, v) =>
    setFilters((prev) => ({ ...prev, [k]: v }));
  const apply = () => {
    setAppliedFilters(filters);
    localStorage.setItem("customerDueLimit", filters.limit);
  };

  // --- Export handlers ---
  const handleExcel = () => {
    const sheet = filteredRows.map((r, i) => ({
      SN: i + 1,
      Customer: r.name,
      "Last Sales Date": r.last_sales_date?.slice(0, 10),
      "Last Sales Amount": r.last_sales_amount,
      "Sales Days": r.sales_days,
      "Last Receipt Date": r.last_receipt_date?.slice(0, 10),
      "Last Receipt Amount": r.last_receipt_amount,
      "Receipt Days": r.receipt_days,
      "Current Due": r.current_due,
    }));
    sheet.push({
      Customer: "Totals",
      "Last Sales Amount": totals.totalSales,
      "Last Receipt Amount": totals.totalReceipt,
      "Current Due": totals.totalDue,
    });
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Due Aging");
    XLSX.writeFile(
      wb,
      `customer-due-aging-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDF = async () => {
    try {
      const user = session?.user;
      const inv = user?.invoice_settings || {};
      const rawLogoUrl = inv?.shop_logo || user?.logo || null;

      let logoUrlForPdf = null;
      if (rawLogoUrl) {
        // Use a same-origin proxy route to bypass CORS restrictions
        logoUrlForPdf = `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`;
      }

      const blob = await pdf(
        <CustomerDueAgingReportPDF
          rows={filteredRows}
          totals={totals}
          filters={appliedFilters}
          user={user}
          customerLabel={selCustomer?.label || ""}
          logoUrl={logoUrlForPdf}
        />
      ).toBlob();

      saveAs(
        blob,
        `customer-due-aging-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const tableRef = useRef(null);
  const handlePrint = () => {
    if (!tableRef.current) return;
    const content = tableRef.current.innerHTML;
    const w = window.open("", "PRINT", "height=900,width=1200");
    w.document.write(`
    <html><head><title>Customer Due Aging</title>
    <style>
      table{width:100%;border-collapse:collapse;}
      th,td{border:1px solid #000;padding:4px;font-size:12px;}
      thead th{background:#f3f4f6;}
      .text-right{text-align:right;}
    </style></head>
    <body>${content}<script>window.onload=()=>{window.print();window.close();}</script></body></html>
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
              Customer Due with Aging
            </h1>
            <p className="text-sm text-muted-foreground">
              Dues and last transaction aging for selected period
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters (refreshed styling) */}
      <div className="space-y-3">
        {/* KPI */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md rounded-lg">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* optional icon (uncomment if you have an icon component) */}
              {/* <Sparkles className="h-8 w-8" /> */}
              <div>
                <p className="text-2xl md:text-3xl font-extrabold leading-tight">
                  {fmt(totals.totalDue)}{" "}
                  <span className="text-sm font-medium">BDT</span>
                </p>
                <p className="text-sm font-semibold opacity-90">
                  Total Current Due
                </p>
              </div>
            </div>

            {/* selected customer label */}
            <div className="text-sm text-white/90 text-right">
              {selCustomer?.label ? (
                <>
                  <p className="text-xs opacity-90">Customer</p>
                  <p className="text-sm font-semibold truncate max-w-xs">
                    {selCustomer.label}
                  </p>
                </>
              ) : (
                <p className="text-xs opacity-80">All customers</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters card */}
        <Card className="shadow-sm rounded-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              {/* Customer */}
              <div className="w-full">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Customer
                </Label>
                <div className="mt-1">
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
                    placeholder="Search / Select"
                    className="w-full"
                    classNamePrefix="react-select"
                    // ensure the control is full height like other inputs
                    theme={(theme) => ({
                      ...theme,
                      spacing: { ...theme.spacing, controlHeight: 44 },
                    })}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="w-full">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.start_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "start_date",
                      `${e.target.value}T00:00:00.000Z`
                    )
                  }
                  className="w-full mt-1 h-11 rounded-md border-gray-200 bg-white"
                />
              </div>

              {/* End Date */}
              <div className="w-full">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={filters.end_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "end_date",
                      `${e.target.value}T23:59:59.999Z`
                    )
                  }
                  className="w-full mt-1 h-11 rounded-md border-gray-200 bg-white"
                />
              </div>

              {/* Limit */}
              <div className="w-full">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Limit
                </Label>
                <Input
                  type="number"
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", Number(e.target.value))
                  }
                  className="w-full mt-1 h-11 rounded-md border-gray-200 bg-white"
                  min={1}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2">
                {/* <Button
                  variant="ghost"
                  onClick={() => {
                    // optional: reset filters logic if you have it
                    // resetFilters && resetFilters();
                  }}
                  className="hidden sm:inline-flex h-10 px-3 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Reset
                </Button> */}

                <Button
                  className="h-10 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={apply}
                >
                  Report
                </Button>
              </div>
            </div>

            {/* small helper / hint row */}
            <div className="mt-3 text-xs text-gray-500">
              Showing up to <span className="font-medium">{filters.limit}</span>{" "}
              results. Use dates to narrow the range.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center space-x-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer/invoice"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-medium">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePDF}>
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2 text-gray-600" />
              Print Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Due with Aging</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              Loading...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32 text-red-500">
              Error loading report
            </div>
          ) : (
            <div className="overflow-x-auto" ref={tableRef}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 text-black font-bold">
                    <TableHead>SN</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Last Sales Date</TableHead>
                    <TableHead className="text-right">
                      Last Sales Amount
                    </TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Last Receipt Date</TableHead>
                    <TableHead className="text-right">
                      Last Receipt Amount
                    </TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead className="text-right">Current Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>
                        {r.last_sales_date?.slice(0, 10) || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(r.last_sales_amount)}
                      </TableCell>
                      <TableCell>{r.sales_days || "-"}</TableCell>
                      <TableCell>
                        {r.last_receipt_date?.slice(0, 10) || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(r.last_receipt_amount)}
                      </TableCell>
                      <TableCell>{r.receipt_days || "-"}</TableCell>
                      <TableCell className="text-right">
                        {fmt(r.current_due)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRows.length > 0 && (
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={3}>Totals</TableCell>
                      <TableCell className="text-right">
                        {fmt(totals.totalSales)}
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right">
                        {fmt(totals.totalReceipt)}
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        {fmt(totals.totalDue)}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
