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

import { useGetProductSaleReportQuery } from "@/app/store/api/productSaleReportApi";
import ProductSaleReportPDF from "./product-sale-report-pdf";

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

// Safely pick first non-empty product image
function pickProductImage(p) {
  if (!p) return null;
  if (p.image_path) return p.image_path;
  if (Array.isArray(p.image_paths) && p.image_paths.length) {
    return p.image_paths.find((u) => !!u) || null;
  }
  return null;
}

// Prefetch remote images to data URLs (fixes PDF image issues/CORS)
async function fetchAsDataURL(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("img fetch failed");
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function ProductSaleReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 500,
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetProductSaleReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const apiRows = res?.data?.data || [];
  const totalProduct = Number(res?.total_product ?? 0);
  const totalSold = Number(res?.total_sold ?? 0);
  const totalSoldAmountAPI = Number(res?.total_sold_amount ?? 0);
  const totalPurchaseAmountAPI = Number(res?.total_purchase_amount ?? 0);

  // Calculate total discount and total due from all invoices
  const totalDiscount = apiRows.reduce((sum, it) => {
    const discount = Number(it?.sales?.discount ?? 0);
    return sum + discount;
  }, 0);

  const totalDue = apiRows.reduce((sum, it) => {
    const sales = it?.sales || {};
    const subTotal = Number(sales?.sub_total ?? 0);
    const vat = Number(sales?.vat ?? 0);
    const tax = Number(sales?.tax ?? 0);
    const deliveryFee = Number(sales?.delivery_fee ?? 0);
    const discount = Number(sales?.discount ?? 0);
    const paidAmount = Number(sales?.paid_amount ?? 0);

    // Calculate invoice total
    const invoiceTotal = subTotal + vat + tax + deliveryFee - discount;
    // Calculate due for this invoice
    const invoiceDue = Math.max(invoiceTotal - paidAmount, 0);

    return sum + invoiceDue;
  }, 0);

  // Calculate total sale amount from actual rows (sum of qty × unitSale for all products)
  const totalSaleAmountFromRows = apiRows.reduce((sum, it) => {
    const qty = Number(it?.qty ?? 0);
    const unitSale = Number(it?.price ?? 0);
    const saleAmount = qty * unitSale;
    return sum + saleAmount;
  }, 0);

  // Calculate total purchase amount from actual rows (sum of qty × purchase_price for all products)
  const totalPurchaseAmountFromRows = apiRows.reduce((sum, it) => {
    const qty = Number(it?.qty ?? 0);
    const unitCost = Number(it?.purchase_price ?? 0);
    const purchaseAmount = qty * unitCost;
    return sum + purchaseAmount;
  }, 0);

  // Corrected Total Sold Amount = total_sale_amount - total_due
  const correctedSoldAmount = totalSaleAmountFromRows - totalDue;

  // Corrected Profit = total_sale_amount - total_purchase_amount - total_due
  const profitAPI = totalSaleAmountFromRows - totalPurchaseAmountFromRows - totalDue;

  // Normalized rows
  const rows = useMemo(() => {
    return (apiRows || []).map((it) => {
      const p = it?.product_info || {};
      const category = p?.category?.name || "";
      const name = p?.name || "N/A";
      const sku = p?.sku || "";
      const barcode = p?.barcode || "";
      const serial = p?.serial || "";
      const qty = Number(it?.qty ?? 0);
      const unitSale = Number(it?.price ?? 0);
      const unitCost = Number(it?.purchase_price ?? 0);
      const saleAmount = qty * unitSale;
      const purchaseAmount = qty * unitCost;
      const profit = saleAmount - purchaseAmount;
      const customer = it?.sales?.customer_name || "";
      const payMode = it?.sales?.pay_mode || "";
      const date = it?.created_at
        ? new Date(it.created_at).toISOString().slice(0, 10)
        : "";
      const imageUrl = pickProductImage(p);

      return {
        date,
        productName: name,
        sku,
        barcode,
        serial,
        category,
        qty,
        unitSale,
        unitCost,
        saleAmount,
        purchaseAmount,
        profit,
        invoiceId: it?.invoice_id || "",
        customer,
        payMode,
        imageUrl,
      };
    });
  }, [apiRows]);

  // Search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.productName || "").toLowerCase().includes(q) ||
        (r.sku || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (r.invoiceId || "").toLowerCase().includes(q) ||
        (r.customer || "").toLowerCase().includes(q) ||
        (r.payMode || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // View totals (computed for current list)
  const viewTotals = useMemo(() => {
    const soldQty = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.qty) ? r.qty : 0),
      0
    );
    const soldAmount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.saleAmount) ? r.saleAmount : 0),
      0
    );
    const purchaseAmount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.purchaseAmount) ? r.purchaseAmount : 0),
      0
    );
    const profit = soldAmount - purchaseAmount;
    return { soldQty, soldAmount, purchaseAmount, profit };
  }, [filteredRows]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const apply = () => setAppliedFilters(filters);

  const handleExcelExport = () => {
    const sheetData = filteredRows.map((r) => ({
      Date: r.date,
      "Product Name": r.productName,
      SKU: r.sku,
      "Serial/Barcode": r.serial || r.barcode || "-",
      Category: r.category,
      Qty: r.qty,
      "Unit Price": r.unitSale,
      "Unit Cost": r.unitCost,
      "Sales Amount (BDT)": r.saleAmount,
      "Purchase Amount (BDT)": r.purchaseAmount,
      "Profit (BDT)": r.profit,
      "Invoice ID": r.invoiceId,
      Customer: r.customer,
      "Pay Mode": r.payMode,
    }));
    sheetData.push({
      Date: "Totals",
      Qty: viewTotals.soldQty,
      "Sales Amount (BDT)": viewTotals.soldAmount,
      "Purchase Amount (BDT)": viewTotals.purchaseAmount,
      "Profit (BDT)": viewTotals.profit,
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Sales");
    XLSX.writeFile(
      wb,
      `product-sale-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Prefetch images to DataURL before PDF
  const handlePDFExport = async () => {
    const rowsForPdf = filteredRows.map((r) => ({ ...r }));
    await Promise.all(
      rowsForPdf.map(async (r, idx) => {
        if (!r.imageUrl) return (r.imageData = null);
        // To keep memory reasonable, still try to convert all; if needed, cap by idx < 300
        r.imageData = await fetchAsDataURL(r.imageUrl);
      })
    );
    const blob = await pdf(
      <ProductSaleReportPDF
        rows={rowsForPdf}
        totals={viewTotals}
        apiTotals={{
          totalProduct,
          totalSold,
          totalSoldAmount: correctedSoldAmount,
          totalPurchaseAmount: totalPurchaseAmountAPI,
          apiProfit: profitAPI,
          totalDiscount,
          totalDue,
        }}
        filters={appliedFilters}
        user={session?.user}
      />
    ).toBlob();
    saveAs(
      blob,
      `product-sale-report-${new Date().toISOString().split("T")[0]}.pdf`
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
          <title>Product Sale Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #f3f4f6; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; margin-right: 6px; }
            .prod { display: flex; align-items: center; gap: 6px; }
            .muted { color: #6b7280; font-size: 11px; }
          </style>
        </head>
        <body>${content}
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
              Product Sale Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Date-wise sold products with amounts and profit
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-extrabold">
                {fmt2(correctedSoldAmount)} BDT
              </p>
              <p className="text-sm font-medium">Total Sold Amount</p>
              <p className="text-xs opacity-90">
                Sold Qty: {fmt2(totalSold)} | Products: {fmt2(totalProduct)} |
                Profit: {fmt2(profitAPI)}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Discount: {fmt2(totalDiscount)} | Due: {fmt2(totalDue)}
              </p>
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
            placeholder="Search product / invoice / customer"
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
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />{" "}
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePDFExport}
              className="hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePrintTable}
              className="hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2 text-blue-500" /> Print Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sale Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading sales...
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
                        Product
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        SKU
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Serial/Barcode
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Category
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Unit Price
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Unit Cost
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Sales Amount
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Purchase Amount
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Profit
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Invoice ID
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Customer
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Pay Mode
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={`${r.invoiceId}-${idx}`}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {r.imageUrl ? (
                              <img
                                src={r.imageUrl}
                                alt={r.productName}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded" />
                            )}
                            <div>
                              <div className="font-medium">{r.productName}</div>
                              <div className="text-xs text-muted-foreground">
                                {r.barcode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{r.sku}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {r.serial || r.barcode || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.qty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.unitSale)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.unitCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.saleAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.purchaseAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.profit)}
                        </TableCell>
                        <TableCell>{r.invoiceId}</TableCell>
                        <TableCell>{r.customer}</TableCell>
                        <TableCell>{r.payMode}</TableCell>
                      </TableRow>
                    ))}
                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={5} className="text-right">
                          Totals
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.soldQty)}
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-right">
                          {fmt2(viewTotals.soldAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.purchaseAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(viewTotals.profit)}
                        </TableCell>
                        <TableCell colSpan={3} />
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
