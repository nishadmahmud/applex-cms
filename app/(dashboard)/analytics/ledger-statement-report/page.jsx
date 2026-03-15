/* eslint-disable react/react-in-jsx-scope */
"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
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

import LedgerStatementReportPDF from "./ledger-statement-report-pdf";
import { useGetCustomersQuery } from "@/app/store/api/customerSummaryReportApi";

import {
  useGetLedgerStatementReportQuery,
  useGetVendorsQuery,
  useSearchCustomerQuery,
  useSearchVendorQuery,
} from "@/app/store/api/ledgerStatementReport";

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

export default function LedgerStatementReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const rawLogoUrl = session?.user?.profile_pic || null;

  const logoUrlForPdf = rawLogoUrl
    ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
    : null;

  const [customerSearch, setCustomerSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
    vendor_id: "",
    customer_id: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customersData, isLoading: customersLoading } =
    useGetCustomersQuery(
      { page: 1, limit: 100 },
      { skip: status !== "authenticated" },
    );

  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery(
    { page: 1, limit: 100 },
    { skip: status !== "authenticated" },
  );
  console.log(vendorsData);
  const { data: searchedCustomers } = useSearchCustomerQuery(
    { keyword: customerSearch, page: 1, limit: 100 },
    { skip: !customerSearch || status !== "authenticated" },
  );

  const { data: searchedVendors } = useSearchVendorQuery(
    { keyword: vendorSearch, page: 1, limit: 100 },
    { skip: !vendorSearch || status !== "authenticated" },
  );

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetLedgerStatementReportQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      (!appliedFilters.customer_id && !appliedFilters.vendor_id),
  });

  const customerOptions = useMemo(() => {
    const list = customerSearch
      ? searchedCustomers?.data?.data || []
      : customersData?.data?.data || [];
    return Array.isArray(list)
      ? list.map((customer) => ({
        value: customer.id,
        label: customer.name || `Customer #${customer.id}`,
      }))
      : [];
  }, [customersData, searchedCustomers, customerSearch]);

  const vendorOptions = useMemo(() => {
    const list = vendorSearch
      ? searchedVendors?.data?.data || []
      : vendorsData?.data?.data || [];
    return Array.isArray(list)
      ? list.map((vendor) => ({
        value: vendor.id,
        label: vendor.name || `Vendor #${vendor.id}`,
      }))
      : [];
  }, [vendorsData, searchedVendors, vendorSearch]);

  console.log(vendorOptions);

  const extractSafeData = useCallback(() => {
    if (!res) {
      return {
        openingBalance: 0,
        ledgerEntries: [],
      };
    }

    return {
      openingBalance: Number(res.opening_balance) || 0,
      ledgerEntries: Array.isArray(res?.ledger) ? res.ledger : [],
    };
  }, [res]);

  const { openingBalance, ledgerEntries } = extractSafeData();

  // Calculate summary totals for ledger
  const summaryTotals = useMemo(() => {
    const defaultTotals = {
      opening_balance: openingBalance,
      total_debit: 0,
      total_credit: 0,
      closing_balance: openingBalance,
    };

    if (!Array.isArray(ledgerEntries) || ledgerEntries.length === 0) {
      return defaultTotals;
    }

    const totals = ledgerEntries.reduce(
      (acc, entry) => {
        const debit = Number(entry?.debit) || 0;
        const credit = Number(entry?.credit) || 0;

        return {
          opening_balance: acc.opening_balance,
          total_debit: acc.total_debit + debit,
          total_credit: acc.total_credit + credit,
        };
      },
      { ...defaultTotals },
    );

    totals.closing_balance = ledgerEntries[ledgerEntries.length - 1]?.balance ?? openingBalance;

    return totals;
  }, [ledgerEntries, openingBalance]);

  const filteredLedgerEntries = useMemo(() => {
    try {
      if (!searchTerm.trim() || !Array.isArray(ledgerEntries)) {
        return ledgerEntries;
      }

      const q = searchTerm.toLowerCase().trim();
      return ledgerEntries.filter((entry) => {
        const particulars = (entry?.particulars || "").toLowerCase();
        const remarks = (entry?.remarks || "").toLowerCase();
        return particulars.includes(q) || remarks.includes(q);
      });
    } catch (err) {
      console.error("[v0] Error filtering ledger entries:", err);
      return ledgerEntries;
    }
  }, [ledgerEntries, searchTerm]);

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const apply = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleExcelExport = useCallback(() => {
    try {
      const ledgerData = filteredLedgerEntries.map((entry) => ({
        Date: entry.date ? new Date(entry.date).toLocaleDateString() : "-",
        Particulars: entry.particulars || "-",
        Debit: fmt2(entry.debit),
        Credit: fmt2(entry.credit),
        Balance: fmt2(entry.balance),
        Remarks: entry.remarks || "-",
      }));

      // Add summary rows
      ledgerData.push({
        Date: "",
        Particulars: "TOTAL",
        Debit: fmt2(summaryTotals.total_debit),
        Credit: fmt2(summaryTotals.total_credit),
        Balance: fmt2(summaryTotals.closing_balance),
        Remarks: "",
      });

      const ws = XLSX.utils.json_to_sheet(ledgerData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ledger Statement");

      XLSX.writeFile(
        wb,
        `ledger-statement-report-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (err) {
      console.error("[v0] Error exporting to Excel:", err);
      alert("Error exporting to Excel. Please try again.");
    }
  }, [filteredLedgerEntries, summaryTotals]);

  const handlePDFExport = useCallback(async () => {
    try {
      const blob = await pdf(
        <LedgerStatementReportPDF
          openingBalance={openingBalance}
          ledgerEntries={filteredLedgerEntries}
          summaryTotals={summaryTotals}
          filters={appliedFilters}
          user={session?.user}
          logoUrl={logoUrlForPdf}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("[v0] Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    }
  }, [
    openingBalance,
    filteredLedgerEntries,
    summaryTotals,
    appliedFilters,
    session?.user,
  ]);

  // Print
  const tableRef = useRef(null);
  const handlePrintTable = useCallback(() => {
    try {
      if (!tableRef.current) return;
      const content = tableRef.current.innerHTML;
      const w = window.open("", "PRINT", "height=900,width=1200");
      if (!w) return;
      w.document.write(`
        <html>
          <head>
            <title>Ledger Statement Report</title>
            <style>
              * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              thead th { background: #f3f4f6; }
              th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
              .text-right { text-align: right; }
              .section-header { background: #e5e7eb; font-weight: bold; padding: 8px; margin-top: 10px; }
              .muted { color: #6b7280; font-size: 11px; }
            </style>
          </head>
          <body>${content}
            <script>window.onload = function(){ window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      w.document.close();
    } catch (err) {
      console.error("[v0] Error printing:", err);
      alert("Error printing table. Please try again.");
    }
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 poppins">
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
            <h1 className="text-xl font-semibold text-foreground">
              Ledger Statement Report
            </h1>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 h-screen bg-white flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-3">
              <p className="text-lg font-semibold text-gray-600">
                Loading Statement
              </p>
              <div className="flex justify-center items-center h-40">
                <div className="h-5 w-5 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Date Range and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange(
                      "start_date",
                      e.target.value ? `${e.target.value}T00:00:00.000Z` : "",
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
                      e.target.value ? `${e.target.value}T23:59:59.999Z` : "",
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select
                  id="customer"
                  isClearable
                  isSearchable
                  isLoading={customersLoading}
                  options={customerOptions}
                  value={
                    filters.customer_id
                      ? customerOptions.find(
                        (opt) => opt.value === filters.customer_id,
                      )
                      : null
                  }
                  onChange={(option) =>
                    handleFilterChange("customer_id", option?.value || "")
                  }
                  onInputChange={(value) => setCustomerSearch(value)}
                  placeholder="Select Customer"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#e5e7eb",
                      "&:hover": { borderColor: "#d1d5db" },
                    }),
                  }}
                />
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  id="vendor"
                  isClearable
                  isSearchable
                  isLoading={vendorsLoading}
                  options={vendorOptions}
                  value={
                    filters.vendor_id
                      ? vendorOptions.find(
                        (opt) => opt.value === filters.vendor_id,
                      )
                      : null
                  }
                  onChange={(option) =>
                    handleFilterChange("vendor_id", option?.value || "")
                  }
                  onInputChange={(value) => setVendorSearch(value)}
                  placeholder="Select Vendor"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#e5e7eb",
                      "&:hover": { borderColor: "#d1d5db" },
                    }),
                  }}
                />
              </div>

              <div className="flex items-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={apply}
                >
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search particulars"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 border-gray-200 bg-transparent"
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
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />{" "}
                    Download Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePDFExport}
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-500" /> Download
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePrintTable}
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <Printer className="h-4 w-4 mr-2 text-blue-500" /> Print
                    Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Container */}
      <div className="bg-white p-8 shadow-lg max-w-5xl mx-auto min-h-[297mm] print:shadow-none print:p-0 print:max-w-none">
        {/* Document Header */}
        <div className="flex border-b-2 border-gray-800 pb-4 mb-4">
          {/* Column 1: Logo */}
          <div className="w-[15%] pr-4 border-r-2 border-gray-300 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              {rawLogoUrl ? (
                <img src={rawLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-xs text-center">NO LOGO</span>
              )}
            </div>
          </div>

          {/* Column 2: Company Info */}
          <div className="w-[50%] px-4 border-r-2 border-gray-300 flex flex-col justify-center">
            <h2 className="text-3xl font-bold uppercase mb-1 print:text-2xl leading-none">{session?.user?.outlet_name || "BUSINESS NAME"}</h2>
            <p className="text-gray-700 whitespace-pre-line text-sm print:text-xs mt-2 leading-tight">{session?.user?.address || "Address Line 1"}</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-gray-700 text-sm print:text-xs">Mobile: {session?.user?.phone || "-"}</p>
              <p className="text-gray-700 text-sm print:text-xs">Email: {session?.user?.email || "-"}</p>
              <p className="text-gray-700 text-sm print:text-xs">Web: {session?.user?.web_address || "-"}</p>
            </div>
          </div>

          {/* Column 3: Ref & Date Info */}
          <div className="w-[35%] pl-4 text-right flex flex-col items-end justify-center">
            {/* Barcode Placeholder */}
            {session?.user?.barcode && (
              <div className="mb-2">
                <img src={session.user.barcode} alt="Barcode" className="h-12 opacity-80 print:h-10" />
              </div>
            )}

            <div className="text-sm space-y-1 print:text-xs">
              <p><span className="font-bold">Ref N°:</span> {session?.user?.ref_no || "REP000000"}</p>
              <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p><span className="font-bold">Start Date:</span> {new Date(filters.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p><span className="font-bold">End Date:</span> {new Date(filters.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p><span className="font-bold">Statement For:</span> {filters.customer_id ? (customerOptions.find(c => c.value === filters.customer_id)?.label || "Customer") : (filters.vendor_id ? (vendorOptions.find(v => v.value === filters.vendor_id)?.label || "Vendor") : "All")}</p>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide border-b border-black inline-block pb-1 print:text-xl">LEDGER STATEMENT</h1>
        </div>


        {/* Ledger Entries Table */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="text-center text-gray-500 h-32 flex items-center justify-center">
              <div>
                <p className="font-medium">Error loading data</p>
                <p className="text-sm mt-1">
                  Please try again or contact support if the issue persists
                </p>
              </div>
            </div>
          ) : (
            <div ref={tableRef}>
              {/* Custom Table Implementation for Exact Layout */}
              <table className="w-full border-collapse border border-gray-400 text-xs font-sans print:text-[10px]">
                <thead>
                  <tr className="bg-[#e5e5e5]">
                    <th rowSpan={2} className="border border-gray-400 p-2 text-left w-[12%] uppercase align-middle print:p-1">DATE</th>
                    <th rowSpan={2} className="border border-gray-400 p-2 text-left uppercase align-middle print:p-1">PARTICULARS</th>
                    <th colSpan={3} className="border border-gray-400 p-2 text-center uppercase border-b-0 print:p-1">TRANSACTION DETAILS</th>
                    <th rowSpan={2} className="border border-gray-400 p-2 text-left uppercase align-middle print:p-1">REMARKS</th>
                  </tr>
                  <tr className="bg-[#e5e5e5]">
                    <th className="border border-gray-400 p-2 text-right w-[12%] uppercase print:p-1">DEBIT</th>
                    <th className="border border-gray-400 p-2 text-right w-[12%] uppercase print:p-1">CREDIT</th>
                    <th className="border border-gray-400 p-2 text-right w-[18%] uppercase print:p-1">BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening Balance */}
                  <tr className="bg-[#e3f2fd]">
                    <td className="border border-gray-400 p-2 print:p-1"></td>
                    <td className="border border-gray-400 p-2 text-right font-bold print:p-1">Opening Balance</td>
                    <td className="border border-gray-400 p-2 print:p-1"></td>
                    <td className="border border-gray-400 p-2 text-right font-bold print:p-1">{fmt2(summaryTotals.opening_balance)}</td>
                    <td className="border border-gray-400 p-2 text-right font-bold whitespace-nowrap print:p-1">{fmt2(summaryTotals.opening_balance)} [ {Number(summaryTotals.opening_balance) >= 0 ? "+" : "-"} ]</td>
                    <td className="border border-gray-400 p-2 print:p-1"></td>
                  </tr>

                  {filteredLedgerEntries.map((entry, idx) => {
                    const getInvoiceLink = (invoiceId) => {
                      if (!invoiceId) return null;
                      if (filters?.customer_id) {
                        if (invoiceId.startsWith("RTN")) return `/sale/return/${invoiceId}`;
                        if (invoiceId.startsWith("INV")) return `/invoice/${invoiceId}`;
                      }
                      if (filters?.vendor_id) {
                        if (invoiceId.startsWith("RTN")) return `/purchase/return/${invoiceId}`;
                        if (invoiceId.startsWith("PUR")) return `/invoice/${invoiceId}`;
                      }
                      return null;
                    };
                    const link = getInvoiceLink(entry?.invoice_id);

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-400 p-2 print:p-1">
                          {entry.date ? new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="border border-gray-400 p-2 print:p-1">
                          {link ? (
                            <Link href={link} className="text-blue-600 hover:underline mr-1 block whitespace-normal break-words">
                              {entry.invoice_id} {entry?.particulars ? `> ${entry.particulars}` : ""}
                            </Link>
                          ) : (
                            <span className="block whitespace-normal break-words">{entry?.particulars || "-"}</span>
                          )}
                        </td>
                        <td className="border border-gray-400 p-2 text-right print:p-1">
                          {Number(entry?.debit) !== 0 ? fmt2(entry?.debit) : ""}
                        </td>
                        <td className="border border-gray-400 p-2 text-right print:p-1">
                          {Number(entry?.credit) !== 0 ? fmt2(entry?.credit) : ""}
                        </td>
                        <td className="border border-gray-400 p-2 text-right font-semibold whitespace-nowrap print:p-1">
                          {fmt2(Math.abs(entry?.balance))} [ {Number(entry?.balance) >= 0 ? "+" : "-"} ]
                        </td>
                        <td className="border border-gray-400 p-2 text-gray-600 truncate max-w-[150px] print:p-1">
                          {entry?.remarks || ""}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Totals */}
                  {filteredLedgerEntries.length > 0 && (
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-400 p-2 print:p-1">Total</td>
                      <td className="border border-gray-400 p-2 print:p-1"></td>
                      <td className="border border-gray-400 p-2 text-right print:p-1">{fmt2(summaryTotals.total_debit)}</td>
                      <td className="border border-gray-400 p-2 text-right print:p-1">{fmt2(summaryTotals.total_credit)}</td>
                      <td className="border border-gray-400 p-2 text-right whitespace-nowrap print:p-1">End Balance: {fmt2(summaryTotals.closing_balance)} [ {Number(summaryTotals.closing_balance) >= 0 ? "+" : "-"} ]</td>
                      <td className="border border-gray-400 p-2 print:p-1"></td>
                    </tr>
                  )}

                  {filteredLedgerEntries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-8 border border-gray-400">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-2 border-t border-gray-300 text-center text-[10px] text-gray-500">
          {session?.user?.outlet_name || "BUSINESS NAME"} © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
