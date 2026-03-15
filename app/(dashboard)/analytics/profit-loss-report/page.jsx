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

import { useGetProfitLossReportQuery } from "@/app/store/api/profitLossReportApi";
import ProfitLossReportPDF from "./profit-loss-report-pdf";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

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

export default function ProfitLossReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters default to today
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const {
    data: res,
    isLoading,
    error,
  } = useGetProfitLossReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const grossProfit = Number(res?.data?.gross_profit ?? 0);
  const netProfit = Number(res?.data?.net_profit ?? 0);
  const expensesObj = res?.data?.expenses || {};
  const totalExpenses =
    typeof res?.data?.total_expenses === "number"
      ? Number(res.data.total_expenses)
      : Object.values(expensesObj).reduce((s, v) => s + Number(v ?? 0), 0);

  // Left side (Expenses)
  const expensesRows = useMemo(() => {
    return Object.entries(expensesObj).map(([name, amount]) => ({
      label: name,
      amount: Number(amount ?? 0),
    }));
  }, [expensesObj]);

  // Right side (Profit summary)
  const profitRows = useMemo(
    () => [
      { label: "Gross Profit b/d", amount: grossProfit },
      { label: "Net Profit", amount: netProfit },
    ],
    [grossProfit, netProfit]
  );
  const rightTotal = useMemo(
    () =>
      profitRows.reduce(
        (s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0),
        0
      ),
    [profitRows]
  );

  const maxRows = Math.max(expensesRows.length, profitRows.length);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  const handleExcelExport = () => {
    // Two-column layout in Excel like the page
    const sheet = [];
    sheet.push({
      "Expenses - Particulars": "Particulars",
      "Expenses - Amount (BDT)": "Amount (In BDT)",
      "Profit - Particulars": "Particulars",
      "Profit - Amount (BDT)": "Amount (In BDT)",
    });
    for (let i = 0; i < maxRows; i++) {
      const L = expensesRows[i];
      const R = profitRows[i];
      sheet.push({
        "Expenses - Particulars": L?.label ?? "",
        "Expenses - Amount (BDT)": L ? L.amount : "",
        "Profit - Particulars": R?.label ?? "",
        "Profit - Amount (BDT)": R ? R.amount : "",
      });
    }
    sheet.push({
      "Expenses - Particulars": "Total Expenses (In BDT):",
      "Expenses - Amount (BDT)": totalExpenses,
      "Profit - Particulars": "Total (In BDT):",
      "Profit - Amount (BDT)": rightTotal,
    });

    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
    XLSX.writeFile(
      wb,
      `profit-and-loss-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <ProfitLossReportPDF
        leftRows={expensesRows}
        rightRows={profitRows}
        totals={{ left: totalExpenses, right: rightTotal }}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `profit-and-loss-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Profit and Loss Account</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .summary-row { background: #e5e7eb; font-weight: 700; }
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
              Profit and Loss Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Two-column layout: Expenses vs Profit
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters (compact) */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold">{fmt(netProfit)} BDT</p>
              <p className="text-sm font-medium">Net Profit</p>
              <p className="text-xs opacity-90 mt-1">
                Gross Profit: {fmt(grossProfit)} | Total Expenses:{" "}
                {fmt(totalExpenses)}
              </p>
            </div>
          </CardContent>
        </Card>

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

      {/* Two-column table like your screenshot */}
      <Card>
        <CardHeader>
          <CardTitle>Profit and Loss Account</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading report...
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
                        Particulars
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (In BDT)
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Particulars
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount (In BDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: maxRows }).map((_, i) => {
                      const L = expensesRows[i];
                      const R = profitRows[i];
                      return (
                        <TableRow key={i}>
                          <TableCell>{L?.label ?? ""}</TableCell>
                          <TableCell className="text-right">
                            {L ? fmt(L.amount) : ""}
                          </TableCell>
                          <TableCell>{R?.label ?? ""}</TableCell>
                          <TableCell className="text-right">
                            {R ? fmt(R.amount) : ""}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Total Expenses (In BDT):</TableCell>
                      <TableCell className="text-right">
                        {fmt(totalExpenses)}
                      </TableCell>
                      <TableCell>Total (In BDT):</TableCell>
                      <TableCell className="text-right">
                        {fmt(rightTotal)}
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
