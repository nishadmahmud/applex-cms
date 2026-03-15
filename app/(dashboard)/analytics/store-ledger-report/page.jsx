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
  Printer,
  Search,
  FileText,
} from "lucide-react";

import {
  useGetStoreLedgerReportQuery,
  useGetProductsQuery,
  useLazySearchProductsQuery,
} from "@/app/store/api/storeLedgerReportApi";
import StoreLedgerReportPDF from "./store-ledger-report-pdf";

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
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

function defaultRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

const toRefNo = (inv = "") => {
  if (!inv) return "";
  const parts = String(inv).split("-");
  return parts[parts.length - 1] || inv;
};
const formatHumanDate = (d) => {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d || "";
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d || "";
  }
};
const toISOStartOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T00:00:00.000Z` : "";
const toISOEndOfDay = (yyyyMmDd) =>
  yyyyMmDd ? `${yyyyMmDd}T23:59:59.999Z` : "";

const num = (v) => Number(v ?? 0);

export default function StoreLedgerReportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { start, end } = defaultRange();

  const [filters, setFilters] = useState({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    product_id: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [selProduct, setSelProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Product dropdown data
  const { data: productsRes } = useGetProductsQuery(
    { page: 1, limit: 10 },
    { skip: status !== "authenticated" }
  );
  const [triggerSearchProducts] = useLazySearchProductsQuery();

  const defaultProductOptions = useMemo(() => {
    const list = productsRes?.data?.data || [];
    return list.map((p) => ({
      label: p?.name || `#${p?.id}`,
      value: p?.id,
      meta: p,
    }));
  }, [productsRes]);

  const loadProductOptions = useCallback(
    async (inputValue) => {
      if (!inputValue) return defaultProductOptions;
      try {
        const resp = await triggerSearchProducts({
          keyword: inputValue,
          page: 1,
          limit: 10,
        }).unwrap();
        const list = resp?.data?.data || [];
        return list.map((p) => ({
          label: p?.name || `#${p?.id}`,
          value: p?.id,
          meta: p,
        }));
      } catch {
        return defaultProductOptions;
      }
    },
    [triggerSearchProducts, defaultProductOptions]
  );

  // Fetch ledger only when product selected and applied
  const {
    data: ledgerRes,
    isLoading,
    error,
  } = useGetStoreLedgerReportQuery(appliedFilters, {
    skip:
      status !== "authenticated" ||
      !appliedFilters?.product_id ||
      !appliedFilters?.start_date ||
      !appliedFilters?.end_date,
  });

  const apiRows = Array.isArray(ledgerRes?.data) ? ledgerRes.data : [];
  const opening_qty = num(ledgerRes?.opening_balance_qty);
  const opening_rate = num(ledgerRes?.opening_balance_rate);
  const opening_amount = num(ledgerRes?.opening_balance_amount);

  const closing_qty = num(ledgerRes?.closing_balance_qty);
  const closing_rate = num(ledgerRes?.closing_balance_rate);
  const closing_amount = num(ledgerRes?.closing_balance_amount);

  // Normalize rows
  const rows = useMemo(() => {
    return apiRows
      .map((r, idx) => ({
        id: `${r?.invoice_id || "row"}-${idx}`,
        date: r?.created_date,
        ledgerName: r?.payment_type_name || r?.payment_category_name || "",
        refNo: toRefNo(r?.invoice_id || ""),
        voucherType: r?.type || "",
        inQty: num(r?.in_qty),
        inRate: num(r?.in_rate),
        inAmount: num(r?.in_amount),
        outQty: num(r?.out_qty),
        outRate: num(r?.out_rate),
        outAmount: num(r?.out_amount),
        balQty: num(r?.balance_qty),
        balRate: num(r?.balance_rate),
        balAmount: num(r?.balance_amount),
      }))
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (isNaN(da) || isNaN(db)) return 0;
        return da - db;
      });
  }, [apiRows]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.refNo || "").toLowerCase().includes(q) ||
        (r.ledgerName || "").toLowerCase().includes(q) ||
        (r.voucherType || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const inQty = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.inQty) ? r.inQty : 0),
      0
    );
    const inAmount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.inAmount) ? r.inAmount : 0),
      0
    );
    const outQty = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.outQty) ? r.outQty : 0),
      0
    );
    const outAmount = filteredRows.reduce(
      (s, r) => s + (Number.isFinite(r.outAmount) ? r.outAmount : 0),
      0
    );
    return { inQty, inAmount, outQty, outAmount };
  }, [filteredRows]);

  // Handlers
  const apply = () => setAppliedFilters(filters);

  // Excel Export
  const handleExcelExport = () => {
    const sheetData = [];

    // Opening
    sheetData.push({
      Date: "",
      "Ledger Name": "",
      "Ref. No.": "",
      "Voucher Type": "Opening Balance",
      "In Qty": 0,
      "In Rate": 0,
      "In Amount (BDT)": 0,
      "Out Qty": 0,
      "Out Rate": 0,
      "Out Amount (BDT)": 0,
      "Bal Qty": opening_qty,
      "Bal Rate": opening_rate,
      "Bal Amount (BDT)": opening_amount,
    });

    // Rows
    filteredRows.forEach((r) =>
      sheetData.push({
        Date: r.date,
        "Ledger Name": r.ledgerName,
        "Ref. No.": r.refNo,
        "Voucher Type": r.voucherType,
        "In Qty": r.inQty,
        "In Rate": r.inRate,
        "In Amount (BDT)": r.inAmount,
        "Out Qty": r.outQty,
        "Out Rate": r.outRate,
        "Out Amount (BDT)": r.outAmount,
        "Bal Qty": r.balQty,
        "Bal Rate": r.balRate,
        "Bal Amount (BDT)": r.balAmount,
      })
    );

    // Totals
    sheetData.push({
      Date: "",
      "Ledger Name": "",
      "Ref. No.": "",
      "Voucher Type": "Total",
      "In Qty": totals.inQty,
      "In Rate": "",
      "In Amount (BDT)": totals.inAmount,
      "Out Qty": totals.outQty,
      "Out Rate": "",
      "Out Amount (BDT)": totals.outAmount,
      "Bal Qty": "",
      "Bal Rate": "",
      "Bal Amount (BDT)": "",
    });

    // Closing
    sheetData.push({
      Date: "",
      "Ledger Name": "",
      "Ref. No.": "",
      "Voucher Type": "Closing Balance",
      "In Qty": "",
      "In Rate": "",
      "In Amount (BDT)": "",
      "Out Qty": "",
      "Out Rate": "",
      "Out Amount (BDT)": "",
      "Bal Qty": closing_qty,
      "Bal Rate": closing_rate,
      "Bal Amount (BDT)": closing_amount,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Ledger");
    XLSX.writeFile(
      wb,
      `store-ledger-report-${new Date().toISOString().split("T")[0]}.xlsx`
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
          <title>Store Ledger Report</title>
          <style>
            * { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            thead tr:first-child th { background: #c7f48b; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; }
            .text-right { text-align: right; }
            .muted { color: #6b7280; font-size: 11px; }
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

  // PDF Export
  const handlePDFExport = async () => {
    const blob = await pdf(
      <StoreLedgerReportPDF
        rows={filteredRows}
        totals={totals}
        opening={{
          qty: opening_qty,
          rate: opening_rate,
          amount: opening_amount,
        }}
        closing={{
          qty: closing_qty,
          rate: closing_rate,
          amount: closing_amount,
        }}
        user={session?.user}
        filters={{
          start_date: appliedFilters?.start_date,
          end_date: appliedFilters?.end_date,
        }}
        productLabel={selProduct?.label || ""}
      />
    ).toBlob();
    saveAs(
      blob,
      `store-ledger-report-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const productCreatedAt = selProduct?.meta?.created_at
    ? formatHumanDate(selProduct.meta.created_at)
    : "-";

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
              Store Ledger Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Item-wise stock movement and running balance within a period
            </p>
          </div>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white">
          <CardContent className="p-5">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide opacity-90">
                BDT
              </div>
              <div className="text-lg font-semibold">Store Ledger Report</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr),auto] gap-4 items-end mt-4">
              <div>
                <Label>Product</Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultProductOptions}
                  loadOptions={loadProductOptions}
                  styles={rsStyles}
                  value={selProduct}
                  onChange={(opt) => {
                    setSelProduct(opt);
                    setFilters((prev) => ({
                      ...prev,
                      product_id: opt?.value || null,
                    }));
                  }}
                  placeholder="Search / Select product"
                  isClearable
                />
              </div>

              <div className="flex items-end gap-3">
                <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">
                  <span className="opacity-70">Created At:</span>{" "}
                  <span className="font-medium">{productCreatedAt}</span>
                </div>

                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={apply}
                  disabled={
                    !filters.product_id ||
                    !filters.start_date ||
                    !filters.end_date
                  }
                  title={
                    !filters.product_id
                      ? "Select a product first"
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

      {/* Actions */}
      <div className="flex justify-end items-center w-full space-x-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by ref no / ledger / type / date"
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
          <CardTitle>Ledger Details</CardTitle>
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
                    <TableRow className="bg-[#c7f48b]">
                      <TableHead colSpan={4} className="font-bold text-black">
                        Particulars
                      </TableHead>
                      <TableHead
                        colSpan={3}
                        className="font-bold text-black text-center"
                      >
                        Inwards
                      </TableHead>
                      <TableHead
                        colSpan={3}
                        className="font-bold text-black text-center"
                      >
                        Outward
                      </TableHead>
                      <TableHead
                        colSpan={3}
                        className="font-bold text-black text-center"
                      >
                        Balance
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-[#c7f48b]">
                      <TableHead className="font-bold text-black">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Ledger Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Ref. No.
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Voucher Type
                      </TableHead>

                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Rate
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount BDT
                      </TableHead>

                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Rate
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount BDT
                      </TableHead>

                      <TableHead className="font-bold text-black text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Rate
                      </TableHead>
                      <TableHead className="font-bold text-black text-right">
                        Amount BDT
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {/* Opening Balance */}
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium">
                        Opening Balance
                      </TableCell>

                      {/* Inwards */}
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">0</TableCell>

                      {/* Outward */}
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">0</TableCell>
                      <TableCell className="text-right">0</TableCell>

                      {/* Balance */}
                      <TableCell className="text-right">
                        {fmt0(opening_qty)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(opening_rate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(opening_amount)}
                      </TableCell>
                    </TableRow>

                    {/* Rows */}
                    {filteredRows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatHumanDate(r.date)}</TableCell>
                        <TableCell>{r.ledgerName}</TableCell>
                        <TableCell>{r.refNo}</TableCell>
                        <TableCell>{r.voucherType}</TableCell>

                        <TableCell className="text-right">
                          {fmt0(r.inQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.inRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.inAmount)}
                        </TableCell>

                        <TableCell className="text-right">
                          {fmt0(r.outQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.outRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.outAmount)}
                        </TableCell>

                        <TableCell className="text-right">
                          {fmt0(r.balQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.balRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt2(r.balAmount)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Totals */}
                    {filteredRows.length > 0 && (
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={4}>Total</TableCell>

                        <TableCell className="text-right">
                          {fmt0(totals.inQty)}
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-right">
                          {fmt2(totals.inAmount)}
                        </TableCell>

                        <TableCell className="text-right">
                          {fmt0(totals.outQty)}
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-right">
                          {fmt2(totals.outAmount)}
                        </TableCell>

                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}

                    {/* Closing Balance */}
                    <TableRow>
                      <TableCell colSpan={10} className="font-semibold">
                        Closing Balance
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt0(closing_qty)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(closing_rate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt2(closing_amount)}
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
