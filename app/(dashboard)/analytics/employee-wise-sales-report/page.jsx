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
  useGetEmployeeWiseSalesQuery,
  useGetEmployeesQuery,
  useLazySearchEmployeesQuery,
} from "@/app/store/api/employeeWiseSalesReportApi";
import EmployeeWiseSalesReportPDF from "./employee-wise-sales-report-pdf";

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

function defaultRange(days = 365) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}
const toISOStartOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T00:00:00.000Z` : "";
const toISOEndOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T23:59:59.999Z` : "";

export default function EmployeeWiseSalesReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { start, end } = defaultRange(365);

  // Filters
  const [filters, setFilters] = useState({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    employee_id: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Commission inputs
  const [percent, setPercent] = useState(0);
  const [fixed, setFixed] = useState(0);

  // Selected employee
  const [selEmployee, setSelEmployee] = useState(null);

  // Search term
  const [searchTerm, setSearchTerm] = useState("");

  // Employees default list
  const { data: empRes } = useGetEmployeesQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const [triggerSearchEmployees] = useLazySearchEmployeesQuery();

  const defaultEmpOptions = useMemo(() => {
    const list = Array.isArray(empRes?.data)
      ? empRes.data
      : empRes?.data?.data || [];
    return list.map((e) => ({
      label: e?.name || e?.employee_id || `#${e?.id}`,
      value: e?.id,
      meta: e,
    }));
  }, [empRes]);

  const loadEmployeeOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultEmpOptions;
      try {
        const resp = await triggerSearchEmployees({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data?.data || [];
        return list.map((e) => ({
          label: e?.name || e?.employee_id || `#${e?.id}`,
          value: e?.id,
          meta: e,
        }));
      } catch {
        return defaultEmpOptions;
      }
    },
    [triggerSearchEmployees, defaultEmpOptions]
  );

  // API fetch
  const {
    data: salesRes,
    isLoading,
    error,
  } = useGetEmployeeWiseSalesQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters?.employee_id ||
      !appliedFilters?.start_date ||
      !appliedFilters?.end_date,
  });

  const apiRows = Array.isArray(salesRes?.data) ? salesRes.data : [];
  const apiGrandTotal = Number(salesRes?.grand_total ?? 0);

  // Normalize rows
  const rows = useMemo(() => {
    return apiRows.map((r) => ({
      date: r?.date || "",
      invoiceId: r?.invoice_id || "",
      products: r?.product_names || "",
      amount: Number(r?.paid_amount ?? 0),
    }));
  }, [apiRows]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.products || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Totals
  const grandTotalView = useMemo(
    () =>
      filteredRows.reduce(
        (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
        0
      ),
    [filteredRows]
  );

  const grandTotal = apiGrandTotal || grandTotalView;
  const percentAmt = (grandTotal * Number(percent || 0)) / 100;
  const payable = percentAmt + Number(fixed || 0);

  // Apply filters
  const apply = () => setAppliedFilters(filters);

  // Table ref and handlers
  const tableRef = useRef(null);

  const handlePrint = () => {
    if (!tableRef.current) return;
    const content = tableRef.current.innerHTML;
    const w = window.open("", "PRINT", "height=900,width=1200");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Employee Wise Sales</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .muted { color: #6b7280; font-size: 11px; }
            .total-row { background: #eef2ff; font-weight: 700; }
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

  // Excel export
  const handleExcel = () => {
    const sheetData = filteredRows.map((r, i) => ({
      SL: i + 1,
      "Transaction Date": r.date,
      "Voucher Number": r.invoiceId,
      Products: r.products,
      "Sales Amount (BDT)": r.amount,
    }));

    sheetData.push({
      SL: "",
      "Transaction Date": "Grand Total",
      "Sales Amount (BDT)": grandTotal,
    });
    sheetData.push({
      "Transaction Date": "Percentage",
      "Sales Amount (BDT)": `${percent}%`,
    });
    sheetData.push({
      "Transaction Date": "Fixed",
      "Sales Amount (BDT)": fixed,
    });
    sheetData.push({
      "Transaction Date": "Payable",
      "Sales Amount (BDT)": payable,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Wise Sales");
    XLSX.writeFile(
      wb,
      `employee-wise-sales-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF export
  const handlePDF = async () => {
    const blob = await pdf(
      <EmployeeWiseSalesReportPDF
        rows={filteredRows}
        totals={{
          grandTotal,
          percent: Number(percent || 0),
          fixed: Number(fixed || 0),
          payable,
        }}
        user={session?.user}
        filters={{
          start_date: appliedFilters?.start_date,
          end_date: appliedFilters?.end_date,
        }}
        employeeLabel={selEmployee?.label || ""}
      />
    ).toBlob();
    saveAs(
      blob,
      `employee-wise-sales-${new Date().toISOString().split("T")[0]}.pdf`
    );
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
              Employee Wise Sales
            </h1>
            <p className="text-sm text-muted-foreground">
              Sales list for a selected employee within date range
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-5">
            <div className="space-y-1">
              <div className="text-2xl font-extrabold">
                {fmt2(grandTotal)}{" "}
                <span className="text-xs align-top">BDT</span>
              </div>
              <div className="text-sm opacity-90">Employee Wise Sales</div>
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
              <div>
                <Label>Employee</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultEmpOptions}
                  loadOptions={loadEmployeeOptions}
                  styles={rsStyles}
                  value={selEmployee}
                  onChange={(opt) => {
                    setSelEmployee(opt);
                    setFilters((prev) => ({
                      ...prev,
                      employee_id: opt?.value || null,
                    }));
                  }}
                  placeholder="Search / Select employee"
                  isClearable
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={
                    !filters.employee_id ||
                    !filters.start_date ||
                    !filters.end_date
                  }
                  title={
                    !filters.employee_id
                      ? "Select an employee first"
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

      {/* Commission inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex gap-4 items-end">
            <div className="flex-1">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <Label>Fixed (BDT)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <Label>Payable (BDT)</Label>
              <Input value={fmt2(payable)} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end items-center w-full space-x-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by invoice, products, or date"
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
              <DropdownMenuItem
                onClick={handlePDF}
                className="hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handlePrint}
                className="hover:bg-blue-50"
              >
                <Printer className="h-4 w-4 mr-2 text-blue-500" />
                Print Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales List</CardTitle>
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
                      <TableHead className="font-bold text-black text-center w-16">
                        SL
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Voucher Number
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Products
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sales Amount (BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell className="text-center">{idx + 1}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell className="whitespace-pre-wrap">
                          {r.products}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.amount)}
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

                    {/* Summary rows */}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell colSpan={4}>Grand Total</TableCell>
                      <TableCell className="text-right">
                        {fmt2(grandTotal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>Percentage</TableCell>
                      <TableCell className="text-right">
                        {fmt2(percent)} %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>Fixed</TableCell>
                      <TableCell className="text-right">
                        {fmt2(fixed)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>Payable</TableCell>
                      <TableCell className="text-right">
                        {fmt2(payable)}
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
