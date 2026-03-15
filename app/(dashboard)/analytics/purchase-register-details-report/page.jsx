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
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
} from "lucide-react";

import { useGetPurchaseRegisterDetailsReportQuery } from "@/app/store/api/purchaseRegisterDetailsReportApi";
import PurchaseRegisterDetailsReportPDF from "./purchase-register-details-report-pdf";

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

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

export default function PurchaseRegisterDetailsReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters (default to today)
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: res,
    isLoading,
    error,
  } = useGetPurchaseRegisterDetailsReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const items = Array.isArray(res?.data) ? res.data : [];
  const apiGrandTotal = Number(res?.grand_net_total ?? 0);
  const apiStart = res?.start_date;
  const apiEnd = res?.end_date;

  // Flatten rows: one row per purchase_details item
  const rows = useMemo(() => {
    const out = [];
    items.forEach((inv) => {
      const date = inv?.created_at
        ? new Date(inv.created_at).toISOString().slice(0, 10)
        : "";
      const invoiceId = inv?.invoice_id || "";
      const vendorName = inv?.vendor_name || "";
      const details = Array.isArray(inv?.purchase_details)
        ? inv.purchase_details
        : [];

      details.forEach((d) => {
        const productName = d?.product_info?.name || "N/A";
        const qty = Number(d?.qty ?? 0);
        const amount =
          Number(d?.total_amount ?? 0) || Number(d?.price ?? 0) * qty || 0;
        out.push({
          date,
          invoiceId,
          vendorName,
          productName,
          qty,
          amount,
        });
      });
    });
    return out;
  }, [items]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.productName || "").toLowerCase().includes(q) ||
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.vendorName || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Totals for current view
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

  // Excel
  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      Date: r.date,
      Invoice: r.invoiceId,
      Vendor: r.vendorName,
      Product: r.productName,
      Quantity: r.qty,
      "Purchase Amount (BDT)": r.amount,
    }));
    sheetData.push({
      Date: "Grand Total",
      "Purchase Amount (BDT)": viewTotal,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Register Details");
    XLSX.writeFile(
      wb,
      `purchase-register-details-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF
  const handlePDFExport = async () => {
    const blob = await pdf(
      <PurchaseRegisterDetailsReportPDF
        rows={filteredRows}
        total={viewTotal}
        apiRange={{ start: apiStart, end: apiEnd }}
        filters={appliedFilters}
        user={session?.user}
        fallbackUserInfo={items?.[0]?.user_info}
      />
    ).toBlob();
    saveAs(
      blob,
      `purchase-register-details-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Purchase Register Details Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
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
              Purchase Register Details Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Item-wise purchase details within date range
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
                {fmt0(apiGrandTotal || viewTotal)} BDT
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
              <div className="flex justify-end">
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
            placeholder="Search product / invoice / vendor"
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
          <CardTitle>Purchase Register Details</CardTitle>
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
                        Invoice
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Vendor
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Product
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Quantity
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Purchase Amount
                        <div className="text-[10px] text-muted-foreground">
                          (In BDT)
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell>{r.vendorName}</TableCell>
                        <TableCell className="whitespace-pre-wrap">
                          {r.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt0(r.qty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt0(r.amount)}
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

                    {/* Grand Total */}
                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell className="text-right">
                          {fmt0(viewTotal)}
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
