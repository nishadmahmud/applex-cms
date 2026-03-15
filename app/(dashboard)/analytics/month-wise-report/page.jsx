"use client";

import React, { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

import { useGetMonthWiseReportQuery } from "@/app/store/api/monthWiseReportApi";
import SummaryPDF from "./month-wise-report-summary-pdf";
import DetailsPDF from "./month-wise-report-details-pdf";

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const monthNames = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function MonthWiseReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const now = new Date();
  const [filters, setFilters] = useState({
    selected_month: now.getMonth() + 1,
    selected_year: now.getFullYear(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: res,
    isLoading,
    error,
  } = useGetMonthWiseReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const report = res?.data || {};
  const salesArr = Array.isArray(report?.sales) ? report.sales : [];
  const purchasesArr = Array.isArray(report?.purchases) ? report.purchases : [];
  const paymentsArr = Array.isArray(report?.payments) ? report.payments : [];

  // Summary numbers (fallback to compute if API totals missing)
  const totalSales = Number(
    report?.total_sales ??
      salesArr.reduce((s, c) => s + Number(c?.total_credit_amount ?? 0), 0)
  );
  const totalPurchase = Number(
    report?.total_purchase ??
      purchasesArr.reduce((s, v) => s + Number(v?.total_debit_amount ?? 0), 0)
  );
  const totalPaymentDebit = Number(
    report?.total_payment_debit ??
      paymentsArr.reduce((s, p) => s + Number(p?.payment_debit ?? 0), 0)
  );
  const totalPaymentCredit = Number(
    report?.total_payment_credit ??
      paymentsArr.reduce((s, p) => s + Number(p?.payment_credit ?? 0), 0)
  );
  const netMovement = totalSales - totalPurchase;

  // Sales summary rows
  const salesSummary = useMemo(
    () =>
      salesArr.map((c) => ({
        customerName: c?.customer_name ?? "N/A",
        invoicesCount: Array.isArray(c?.invoices) ? c.invoices.length : 0,
        amount: Number(c?.total_credit_amount ?? 0),
      })),
    [salesArr]
  );

  // Purchase summary rows
  const purchaseSummary = useMemo(
    () =>
      purchasesArr.map((v) => ({
        vendorName: v?.vendor_name ?? "N/A",
        invoicesCount: Array.isArray(v?.invoices) ? v.invoices.length : 0,
        amount: Number(v?.total_debit_amount ?? 0),
      })),
    [purchasesArr]
  );

  // Payment summary rows
  const paymentSummary = useMemo(
    () =>
      paymentsArr.map((p) => ({
        paymentType: p?.payment_type_name ?? "Others",
        debit: Number(p?.payment_debit ?? 0),
        credit: Number(p?.payment_credit ?? 0),
        net: Number(p?.payment_credit ?? 0) - Number(p?.payment_debit ?? 0),
      })),
    [paymentsArr]
  );

  // Details: flatten
  const salesInvoices = useMemo(() => {
    const out = [];
    salesArr.forEach((c) => {
      (c?.invoices || []).forEach((iv) => {
        out.push({
          invoiceId: iv?.invoice_id ?? "",
          party: c?.customer_name ?? "N/A",
          amount: Number(iv?.credit_amount ?? 0),
        });
      });
    });
    return out;
  }, [salesArr]);

  const purchaseInvoices = useMemo(() => {
    const out = [];
    purchasesArr.forEach((v) => {
      (v?.invoices || []).forEach((iv) => {
        out.push({
          invoiceId: iv?.invoice_id ?? "",
          party: v?.vendor_name ?? "N/A",
          amount: Number(iv?.debit_amount ?? 0),
        });
      });
    });
    return out;
  }, [purchasesArr]);

  const paymentTransactions = useMemo(() => {
    const out = [];
    paymentsArr.forEach((p) => {
      (p?.transactions || []).forEach((t) => {
        out.push({
          paymentType: p?.payment_type_name ?? "Others",
          invoiceId: t?.invoice_id ?? "",
          amount: Number(t?.payment_amount ?? 0),
          status: t?.transaction_status ?? "",
        });
      });
    });
    return out;
  }, [paymentsArr]);

  // Search filter on details
  const q = searchTerm.toLowerCase();
  const filteredSalesInvoices = useMemo(
    () =>
      salesInvoices.filter(
        (r) =>
          r.invoiceId.toLowerCase().includes(q) ||
          (r.party || "").toLowerCase().includes(q)
      ),
    [salesInvoices, q]
  );
  const filteredPurchaseInvoices = useMemo(
    () =>
      purchaseInvoices.filter(
        (r) =>
          r.invoiceId.toLowerCase().includes(q) ||
          (r.party || "").toLowerCase().includes(q)
      ),
    [purchaseInvoices, q]
  );
  const filteredPaymentTransactions = useMemo(
    () =>
      paymentTransactions.filter(
        (r) =>
          r.invoiceId.toLowerCase().includes(q) ||
          (r.paymentType || "").toLowerCase().includes(q) ||
          (r.status || "").toLowerCase().includes(q)
      ),
    [paymentTransactions, q]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  // Excel export (multi-sheet)
  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new();

    // Sales Summary
    const wsSalesSummary = XLSX.utils.json_to_sheet(
      salesSummary.map((r) => ({
        Customer: r.customerName,
        "Invoices Count": r.invoicesCount,
        "Amount (BDT)": r.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsSalesSummary, "Sales Summary");

    // Purchase Summary
    const wsPurchaseSummary = XLSX.utils.json_to_sheet(
      purchaseSummary.map((r) => ({
        Vendor: r.vendorName,
        "Invoices Count": r.invoicesCount,
        "Amount (BDT)": r.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsPurchaseSummary, "Purchase Summary");

    // Payment Summary
    const wsPaySummary = XLSX.utils.json_to_sheet(
      paymentSummary.map((r) => ({
        "Payment Type": r.paymentType,
        "Debit (BDT)": r.debit,
        "Credit (BDT)": r.credit,
        "Net (BDT)": r.net,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsPaySummary, "Payments");

    // Details
    const wsSalesInv = XLSX.utils.json_to_sheet(
      filteredSalesInvoices.map((r) => ({
        "Invoice ID": r.invoiceId,
        Customer: r.party,
        "Amount (BDT)": r.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsSalesInv, "Sales Invoices");

    const wsPurchaseInv = XLSX.utils.json_to_sheet(
      filteredPurchaseInvoices.map((r) => ({
        "Invoice ID": r.invoiceId,
        Vendor: r.party,
        "Amount (BDT)": r.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsPurchaseInv, "Purchase Invoices");

    const wsPayTx = XLSX.utils.json_to_sheet(
      filteredPaymentTransactions.map((r) => ({
        "Payment Type": r.paymentType,
        "Invoice ID": r.invoiceId,
        Status: r.status,
        "Amount (BDT)": r.amount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsPayTx, "Payment Tx");

    XLSX.writeFile(
      wb,
      `month-wise-report-${appliedFilters.selected_year}-${String(
        appliedFilters.selected_month
      ).padStart(2, "0")}.xlsx`
    );
  };

  // PDF exports
  const handlePDFSummary = async () => {
    const blob = await pdf(
      <SummaryPDF
        user={session?.user}
        monthName={
          monthNames.find((m) => m.value === appliedFilters.selected_month)
            ?.label
        }
        year={appliedFilters.selected_year}
        summary={{
          totalSales,
          totalPurchase,
          totalPaymentDebit,
          totalPaymentCredit,
          netMovement,
        }}
        salesSummary={salesSummary}
        purchaseSummary={purchaseSummary}
        paymentSummary={paymentSummary}
      />
    ).toBlob();
    saveAs(
      blob,
      `month-wise-summary-${appliedFilters.selected_year}-${String(
        appliedFilters.selected_month
      ).padStart(2, "0")}.pdf`
    );
  };

  const handlePDFDetails = async () => {
    const blob = await pdf(
      <DetailsPDF
        user={session?.user}
        monthName={
          monthNames.find((m) => m.value === appliedFilters.selected_month)
            ?.label
        }
        year={appliedFilters.selected_year}
        salesInvoices={filteredSalesInvoices}
        purchaseInvoices={filteredPurchaseInvoices}
        paymentTransactions={filteredPaymentTransactions}
      />
    ).toBlob();
    saveAs(
      blob,
      `month-wise-details-${appliedFilters.selected_year}-${String(
        appliedFilters.selected_month
      ).padStart(2, "0")}.pdf`
    );
  };

  // Print
  const printRef = useRef(null);
  const handlePrintTable = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const w = window.open("", "PRINT", "height=900,width=1200");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Month-wise Financial Summary</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            h2 { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .right { text-align: right; }
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
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Month-wise Financial Summary
            </h1>
            <p className="text-sm text-muted-foreground">
              Sales, Purchases and Payments overview for a month
            </p>
          </div>
        </div>
      </div>

      {/* KPIs + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%,60%] gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs opacity-90">Total Sales</div>
                <div className="text-2xl font-extrabold">
                  {fmt0(totalSales)} BDT
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs opacity-70">Total Purchases</div>
                <div className="text-xl font-bold">
                  {fmt0(totalPurchase)} BDT
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs opacity-70">Payments (Debit)</div>
                <div className="text-xl font-bold">
                  {fmt0(totalPaymentDebit)} BDT
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-xs opacity-70">
                  Net Movement (Sales - Purchases)
                </div>
                <div className="text-xl font-bold">{fmt0(netMovement)} BDT</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Label>Month</Label>
                <select
                  className="w-full border rounded-md h-10 px-3"
                  value={filters.selected_month}
                  onChange={(e) =>
                    handleFilterChange("selected_month", Number(e.target.value))
                  }
                >
                  {monthNames.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  value={filters.selected_year}
                  onChange={(e) =>
                    handleFilterChange("selected_year", Number(e.target.value))
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
            placeholder="Search invoices/payments"
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
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" /> Export
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
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />{" "}
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFSummary}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" /> Summary PDF
              (Portrait)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFDetails}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" /> Details PDF
              (Landscape)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePrintTable}
              className="hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2 text-blue-500" /> Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Tables */}
      <div ref={printRef} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Summary (by Customer)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 flex items-center justify-center">
                Loading...
              </div>
            ) : error ? (
              <div className="text-red-500">Error loading data</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Amount (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesSummary.map((r, i) => (
                      <TableRow key={`s-${i}`}>
                        <TableCell>{r.customerName}</TableCell>
                        <TableCell className="text-right">
                          {fmt0(r.invoicesCount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt0(r.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {salesSummary.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                    {salesSummary.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          {fmt0(
                            salesArr.reduce(
                              (s, c) => s + (c?.invoices || []).length,
                              0
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt0(totalSales)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary (by Vendor)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseSummary.map((r, i) => (
                    <TableRow key={`p-${i}`}>
                      <TableCell>{r.vendorName}</TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.invoicesCount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {purchaseSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                  {purchaseSummary.length > 0 && (
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {fmt0(
                          purchasesArr.reduce(
                            (s, v) => s + (v?.invoices || []).length,
                            0
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(totalPurchase)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Payment Type</TableHead>
                    <TableHead className="text-right">Debit (BDT)</TableHead>
                    <TableHead className="text-right">Credit (BDT)</TableHead>
                    <TableHead className="text-right">
                      Net (Credit - Debit)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentSummary.map((r, i) => (
                    <TableRow key={`pm-${i}`}>
                      <TableCell>{r.paymentType}</TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.debit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.credit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                  {paymentSummary.length > 0 && (
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {fmt0(totalPaymentDebit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(totalPaymentCredit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(totalPaymentCredit - totalPaymentDebit)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Details (searchable) */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Invoices (Details)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesInvoices.map((r, i) => (
                    <TableRow key={`sd-${i}`}>
                      <TableCell>{r.invoiceId}</TableCell>
                      <TableCell>{r.party}</TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSalesInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Invoices (Details)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseInvoices.map((r, i) => (
                    <TableRow key={`pd-${i}`}>
                      <TableCell>{r.invoiceId}</TableCell>
                      <TableCell>{r.party}</TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPurchaseInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions (Details)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaymentTransactions.map((r, i) => (
                    <TableRow key={`pt-${i}`}>
                      <TableCell>{r.paymentType}</TableCell>
                      <TableCell>{r.invoiceId}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell className="text-right">
                        {fmt0(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPaymentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
