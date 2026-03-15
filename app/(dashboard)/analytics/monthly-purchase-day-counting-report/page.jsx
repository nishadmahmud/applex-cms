"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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
  Search,
  ArrowLeft,
  FileText,
  Printer,
  FileSpreadsheet,
} from "lucide-react";

import { useGetPurchaseSummaryReportQuery } from "@/app/store/api/monthlyPurchaseDayCountingReportApi";
import PurchaseReportPDF from "./monthly-purchase-day-counting-report-pdf";

export default function MonthlyPurchaseDayCountingReport() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters state (UI)
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  });

  // Applied filters (on Report click)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data only when authenticated and filters applied
  const {
    data: purchaseData,
    isLoading,
    error,
  } = useGetPurchaseSummaryReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const reportData = purchaseData?.data || [];

  // Normalize data for table
  const transactionData = useMemo(() => {
    return reportData.map((item, index) => ({
      sl: index + 1,
      transactionDate: item?.date || "",
      voucherNumber: item?.invoice_id || "",
      vendorName: item?.vendor_name || "N/A",
      productName: item?.product_name || "N/A",
      imei: item?.imei ?? "N/A",
      purchaseAmount: Number(item?.price ?? 0),
    }));
  }, [reportData]);

  // Filtered view
  const filteredData = useMemo(() => {
    if (!searchTerm) return transactionData;
    const q = searchTerm.toLowerCase();
    return transactionData.filter(
      (item) =>
        item.vendorName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.voucherNumber.toLowerCase().includes(q) ||
        String(item.imei).toLowerCase().includes(q)
    );
  }, [transactionData, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const totalPurchase = filteredData.reduce(
      (sum, item) =>
        sum + (Number.isFinite(item.purchaseAmount) ? item.purchaseAmount : 0),
      0
    );
    const totalDays = new Set(filteredData.map((item) => item.transactionDate))
      .size;

    return {
      totalPurchase,
      totalDays,
    };
  }, [filteredData]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGetReport = () => {
    setAppliedFilters(filters);
  };

  const handlePDFExport = async () => {
    const blob = await pdf(
      <PurchaseReportPDF
        data={filteredData}
        totals={totals}
        filters={filters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `purchase-day-counting-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        SL: item.sl,
        "Transaction Date": item.transactionDate,
        "Voucher Number": item.voucherNumber,
        "Vendor Name": item.vendorName,
        "Product Name": item.productName,
        IMEI: item.imei ?? "",
        "Purchase Amount": item.purchaseAmount,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Report");
    XLSX.writeFile(
      workbook,
      `purchase-day-counting-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const tableRef = useRef(null);
  const handlePrintTable = () => {
    if (!tableRef.current) return;
    const content = tableRef.current.innerHTML;
    const printWindow = window.open("", "PRINT", "height=800,width=1200");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Day Counting Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-row { background: #e5e7eb; font-weight: 700; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function () {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
              Purchase Day Counting Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Daily purchase transaction details and summary
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white flex justify-center items-center">
          <CardContent className="p-3 ">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.round(totals.totalPurchase).toLocaleString()} BDT
              </p>
              <p className="text-sm font-medium">
                Purchase Day Counting Report
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
                      e.target.value + "T10:25:07.000Z"
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
                      e.target.value + "T10:25:07.654Z"
                    )
                  }
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleGetReport}
                >
                  Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end items-center w-full space-x-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search By Particulars"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

          <DropdownMenuContent
            align="end"
            className="w-56 shadow-lg border border-gray-100 rounded-lg"
          >
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
          <CardTitle>Monthly Purchase Day Counting Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading purchase data...
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
                      <TableHead className="font-bold text-black">SL</TableHead>
                      <TableHead className="font-bold text-black">
                        Transaction Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Voucher Number
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Vendor Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Product Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        IMEI
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Purchase Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.sl}>
                        <TableCell>{item.sl}</TableCell>
                        <TableCell>{item.transactionDate}</TableCell>
                        <TableCell>{item.voucherNumber}</TableCell>
                        <TableCell>{item.vendorName}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.imei ?? "N/A"}</TableCell>
                        <TableCell>
                          {Number(item.purchaseAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>{totals.totalDays} Days</TableCell>
                      <TableCell>Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        {Number(totals.totalPurchase).toFixed(2)}
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
