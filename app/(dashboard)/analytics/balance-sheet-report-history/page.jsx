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

import { ArrowLeft, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { useGetBalanceSheetReportHistoryQuery } from "@/app/store/api/balanceSheetReportHistoryApi";
import BalanceSheetReportHistoryPDF from "./balance-sheet-report-history-pdf";

const fmtBDT = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });

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

export default function BalanceSheetReportHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default to today)
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetBalanceSheetReportHistoryQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const totalClosingStock = Number(res?.total_closing_stock_value ?? 0);
  const availableBalances = Array.isArray(res?.available_balance)
    ? res.available_balance
    : [];
  const totalCustomerDue = Number(res?.total_customer_due ?? 0);
  const totalVendor = Number(res?.total_vendor_ ?? 0);

  const availableBalanceTotal = useMemo(
    () =>
      availableBalances.reduce(
        (sum, a) => sum + Number(a?.available_balance ?? 0),
        0
      ),
    [availableBalances]
  );

  // Assets (right side)
  const assetsRows = useMemo(() => {
    const balanceRows = availableBalances.map((a) => ({
      label: a?.type_name || "Unknown",
      amount: Number(a?.available_balance ?? 0),
    }));

    const receivableRow = totalCustomerDue
      ? [{ label: "Customer Due", amount: totalCustomerDue }]
      : [];

    const inventoryRow = totalClosingStock
      ? [{ label: "Inventory (Closing Stock)", amount: totalClosingStock }]
      : [];

    return [
      { label: "Current Assets", isGroup: true },
      ...balanceRows,
      ...receivableRow,
      ...inventoryRow,
    ];
  }, [availableBalances, totalCustomerDue, totalClosingStock]);

  const assetsTotal = useMemo(
    () => availableBalanceTotal + totalCustomerDue + totalClosingStock,
    [availableBalanceTotal, totalCustomerDue, totalClosingStock]
  );

  // Liabilities & Equity (left side)
  const liabilitiesRows = useMemo(() => {
    const paidUpCapital = assetsTotal - totalVendor;
    const vendorRow =
      typeof totalVendor === "number"
        ? [{ label: "Vendor Payable", amount: totalVendor }]
        : [];
    return [{ label: "Paid up Capital", amount: paidUpCapital }, ...vendorRow];
  }, [assetsTotal, totalVendor]);

  const liabilitiesTotal = useMemo(
    () => liabilitiesRows.reduce((sum, r) => sum + Number(r?.amount ?? 0), 0),
    [liabilitiesRows]
  );

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Export: Excel (flattened)
  const handleExcelExport = () => {
    const left = [
      { Section: "Liabilities & Equity" },
      ...liabilitiesRows.map((r) => ({
        Name: r.label,
        "Amount (BDT)": r.amount,
      })),
      { Name: "Total Liabilities & Equity", "Amount (BDT)": liabilitiesTotal },
    ];

    const right = [
      { Section: "Assets" },
      ...assetsRows.map((r) =>
        r.isGroup
          ? { Name: r.label, "Amount (BDT)": "" }
          : { Name: r.label, "Amount (BDT)": r.amount }
      ),
      { Name: "Total Assets", "Amount (BDT)": assetsTotal },
    ];

    const ws1 = XLSX.utils.json_to_sheet([...left, {}, ...right]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Balance Sheet");
    XLSX.writeFile(
      wb,
      `balance-sheet-report-history-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <BalanceSheetReportHistoryPDF
        filters={appliedFilters}
        user={session?.user}
        data={{
          assetsRows,
          assetsTotal,
          liabilitiesRows,
          liabilitiesTotal,
        }}
      />
    ).toBlob();
    saveAs(
      blob,
      `balance-sheet-report-history-${
        new Date().toISOString().split("T")[0]
      }.pdf`
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
          <title>Balance Sheet Report History</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .group { font-weight: 600; }
          </style>
        </head>
        <body>
          ${content}
          <script>window.onload = function(){ window.print(); window.close(); }</script>
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
              Balance Sheet Report History
            </h1>
            <p className="text-sm text-muted-foreground">
              Snapshot of Liabilities and Assets for the selected period
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters (compact layout as requested) */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        {/* Orange KPI card (left) */}
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold">
                {fmtBDT(assetsTotal)} BDT
              </p>
              <p className="text-sm font-medium">Assets Total (Computed)</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
              <p>
                Available Balance:{" "}
                <span className="font-semibold">
                  {fmtBDT(availableBalanceTotal)} BDT
                </span>
              </p>
              <p>
                Customer Due:{" "}
                <span className="font-semibold">
                  {fmtBDT(totalCustomerDue)} BDT
                </span>
              </p>
              <p>
                Vendor Payable:{" "}
                <span className="font-semibold">{fmtBDT(totalVendor)} BDT</span>
              </p>
              <p>
                Closing Stock:{" "}
                <span className="font-semibold">
                  {fmtBDT(totalClosingStock)} BDT
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Filters in one compact card */}
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

      {/* Table (no empty spacer cols; 4 columns only) */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading balance sheet...
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
                        Liabilities & Equity
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (In BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Assets
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (In BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {Array.from(
                      {
                        length: Math.max(
                          liabilitiesRows.length,
                          assetsRows.length
                        ),
                      },
                      (_, i) => {
                        const L = liabilitiesRows[i];
                        const A = assetsRows[i];
                        return (
                          <TableRow key={i}>
                            <TableCell
                              className={L?.isGroup ? "font-semibold" : ""}
                            >
                              {L ? L.label : ""}
                            </TableCell>
                            <TableCell className="text-right">
                              {L && !L.isGroup ? fmtBDT(L.amount) : ""}
                            </TableCell>

                            <TableCell
                              className={A?.isGroup ? "font-semibold" : ""}
                            >
                              {A ? A.label : ""}
                            </TableCell>
                            <TableCell className="text-right">
                              {A && !A.isGroup ? fmtBDT(A.amount) : ""}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}

                    {/* Totals row */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Total:</TableCell>
                      <TableCell className="text-right">
                        {fmtBDT(liabilitiesTotal)}
                      </TableCell>
                      <TableCell>Total:</TableCell>
                      <TableCell className="text-right">
                        {fmtBDT(assetsTotal)}
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
