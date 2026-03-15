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
  useGetExpenseTypeWiseReportQuery,
  useGetExpenseTypesAllQuery,
  useLazySearchExpenseTypesQuery,
} from "@/app/store/api/expenseTypeWiseReportApi";
import ExpenseTypeWiseReportPDF from "./expense-type-wise-report-pdf";

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

export default function ExpenseTypeWiseReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    expense_type_id: "all", // "all" keeps shadcn-free and omits from API
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // React-Select selected object
  const [selExpenseType, setSelExpenseType] = useState({
    label: "All Expense Types",
    value: "all",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Data queries
  const { data: typesRes } = useGetExpenseTypesAllQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const [triggerSearchExpense] = useLazySearchExpenseTypesQuery();

  const defaultTypeOptions = useMemo(() => {
    const list = typesRes?.data?.data || [];
    const mapped = list.map((t) => ({
      label: t?.expense_name || `#${t?.id}`,
      value: String(t?.id),
    }));
    return [{ label: "All Expense Types", value: "all" }, ...mapped];
  }, [typesRes]);

  const loadExpenseOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultTypeOptions;
      try {
        const res = await triggerSearchExpense({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = res?.data?.data || [];
        const mapped = list.map((t) => ({
          label: t?.expense_name || `#${t?.id}`,
          value: String(t?.id),
        }));
        return [{ label: "All Expense Types", value: "all" }, ...mapped];
      } catch {
        return defaultTypeOptions;
      }
    },
    [triggerSearchExpense, defaultTypeOptions]
  );

  const {
    data: reportRes,
    isLoading,
    error,
  } = useGetExpenseTypeWiseReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const apiRows = Array.isArray(reportRes?.data) ? reportRes.data : [];
  const apiGrandTotal = Number(reportRes?.grand_total ?? 0);

  // Normalize rows
  const rows = useMemo(() => {
    return apiRows.map((r) => ({
      date: r?.transaction_date || "",
      expenseId: r?.expense_id || "",
      categoryName: r?.catogory_name || r?.category_name || "", // handle misspelling
      transCategory: r?.transaction_category || "",
      amount: Number(r?.total_amount ?? 0),
    }));
  }, [apiRows]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.expenseId || "").toLowerCase().includes(q) ||
        (r.categoryName || "").toLowerCase().includes(q) ||
        (r.transCategory || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // View totals
  const viewTotal = useMemo(
    () =>
      filteredRows.reduce(
        (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
        0
      ),
    [filteredRows]
  );

  // Handlers
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const apply = () => setAppliedFilters(filters);

  // Excel
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      Date: r.date,
      "Expense ID": r.expenseId,
      Category: r.categoryName,
      "Transaction Category": r.transCategory,
      "Amount (BDT)": r.amount,
    }));
    sheetData.push({ Date: "Grand Total", "Amount (BDT)": viewTotal });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense Type Wise");
    XLSX.writeFile(
      wb,
      `expense-type-wise-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <ExpenseTypeWiseReportPDF
        rows={filteredRows}
        total={viewTotal}
        filters={appliedFilters}
        user={session?.user}
        expenseTypeLabel={selExpenseType?.label || "All Expense Types"}
      />
    ).toBlob();
    saveAs(
      blob,
      `expense-type-wise-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Expense Type Wise Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
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
              Expense Type Wise Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Expenses by category within date range
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
                {fmt2(apiGrandTotal || viewTotal)} BDT
              </p>
              <p className="text-sm font-medium">Grand Total (API/view)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              <div>
                <Label>Expense Type</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultTypeOptions}
                  loadOptions={loadExpenseOptions}
                  styles={rsStyles}
                  value={selExpenseType}
                  onChange={(opt) => {
                    setSelExpenseType(opt);
                    handleFilterChange("expense_type_id", opt?.value ?? "all");
                  }}
                  isClearable
                  placeholder="Select Expense Type"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
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
            placeholder="Search (Expense ID / Category / Type / Date)"
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
          <CardTitle>Expense Type Wise Report</CardTitle>
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
                      <TableHead className="font-bold text-black">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Expense ID
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Category
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Category
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.expenseId}-${idx}`}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.expenseId}</TableCell>
                        <TableCell>{r.categoryName}</TableCell>
                        <TableCell>{r.transCategory}</TableCell>
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

                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell colSpan={3} />
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
