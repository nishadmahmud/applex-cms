/* eslint-disable react/react-in-jsx-scope */
"use client"

import { useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import * as XLSX from "xlsx"
import { pdf } from "@react-pdf/renderer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, FileSpreadsheet, FileText, Printer, Search } from "lucide-react"
import { useGetCashStatementReportQuery } from "@/app/store/api/cashStatementReportApi"
import CashStatementReportPDF from "./cash-statement-report-pdf"

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

function todayStartISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function todayEndISO() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export default function CashStatementReportPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
 const rawLogoUrl =
   session?.user?.profile_pic || null;

  const logoUrlForPdf = rawLogoUrl
    ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
    : null;

  // Filters
  const [filters, setFilters] = useState({
    start_date: todayStartISO(),
    end_date: todayEndISO(),
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [searchTerm, setSearchTerm] = useState("")

  // Query
  const {
    data: res,
    isLoading,
    error,
  } = useGetCashStatementReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  })

  const extractSafeData = useCallback(() => {
    if (!res) {
      return {
        openingBalance: [],
        inflowData: { sales: [], purchase_return: [], expense_credit: [] },
        outflowData: { purchase: [], sales_return: [], expense_debit: [] },
        transactionSummary: [],
      }
    }

    return {
      openingBalance: Array.isArray(res.opening_balance) ? res.opening_balance : [],
      inflowData: {
        sales: Array.isArray(res?.inflow_of_fund?.sales) ? res.inflow_of_fund.sales : [],
        purchase_return: Array.isArray(res?.inflow_of_fund?.purchase_return) ? res.inflow_of_fund.purchase_return : [],
        expense_credit: Array.isArray(res?.inflow_of_fund?.expense_credit) ? res.inflow_of_fund.expense_credit : [],
      },
      outflowData: {
        purchase: Array.isArray(res?.outflow_of_fund?.purchase) ? res.outflow_of_fund.purchase : [],
        sales_return: Array.isArray(res?.outflow_of_fund?.sales_return) ? res.outflow_of_fund.sales_return : [],
        expense_debit: Array.isArray(res?.outflow_of_fund?.expense_debit) ? res.outflow_of_fund.expense_debit : [],
      },
      transactionSummary: Array.isArray(res.transaction_summary) ? res.transaction_summary : [],
    }
  }, [res])

  const { openingBalance, inflowData, outflowData, transactionSummary } = extractSafeData()

  const summaryTotals = useMemo(() => {
    const defaultTotals = {
      total_opening_balance: 0,
      total_received: 0,
      total_payment: 0,
      total_balance: 0,
      total_closing_balance: 0,
    }

    try {
      if (!Array.isArray(transactionSummary) || transactionSummary.length === 0) {
        return defaultTotals
      }

      const totals = transactionSummary.reduce((acc, row) => {
        // Safely convert each field to number with fallback to 0
        const opening = Number(row?.opening_balance) || 0
        const received = Number(row?.received) || 0
        const payment = Number(row?.payment) || 0
        const balance = Number(row?.balance) || 0
        const closing = Number(row?.closing_balance) || 0

        return {
          total_opening_balance: acc.total_opening_balance + opening,
          total_received: acc.total_received + received,
          total_payment: acc.total_payment + payment,
          total_balance: acc.total_balance + balance,
          total_closing_balance: acc.total_closing_balance + closing,
        }
      }, defaultTotals)

      return totals
    } catch (err) {
      console.error("[v0] Error calculating summary totals:", err)
      return defaultTotals
    }
  }, [transactionSummary])

  const groupedInflowData = useMemo(() => {
    try {
      const grouped = {}
      const sales = inflowData.sales || []
      const purchaseReturn = inflowData.purchase_return || []
      const expenseCredit = inflowData.expense_credit || []

      sales.forEach((s) => {
        const key = "Sales"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: s.invoice_id || "-",
          customer: s.customer_name || "-",
          paymentType: s.payment_type_name || "-",
          category: s.payment_type_category_name || "-",
          amount: Number(s.amount) || 0,
        })
      })

      purchaseReturn.forEach((pr) => {
        const key = "Purchase Return"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: pr.reference || "-",
          customer: pr.customer_name || "-",
          paymentType: pr.payment_type_name || "-",
          category: pr.payment_type_category_name || "-",
          amount: Number(pr.amount) || 0,
        })
      })

      expenseCredit.forEach((ec) => {
        const key = "Expense Credit"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: ec.reference || "-",
          customer: ec.customer_name || "-",
          paymentType: ec.payment_type_name || "-",
          category: ec.payment_type_category_name || "-",
          amount: Number(ec.amount) || 0,
        })
      })

      return Object.entries(grouped).map(([type, items]) => ({
        type,
        items,
        total: items.reduce((sum, item) => sum + (item.amount || 0), 0),
      }))
    } catch (err) {
      console.error("[v0] Error grouping inflow data:", err)
      return []
    }
  }, [inflowData])

  console.log(inflowData);

  const groupedOutflowData = useMemo(() => {
    try {
      const grouped = {}
      const purchase = outflowData.purchase || []
      const salesReturn = outflowData.sales_return || []
      const expenseDebit = outflowData.expense_debit || []

      purchase.forEach((p) => {
        const key = "Purchase"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: p.invoice_id || p.reference || "-",
          supplier: p.supplier_name || "-",
          paymentType: p.payment_type_name || "-",
          category: p.payment_type_category_name || "-",
          amount: Number(p.amount) || 0,
        })
      })

      salesReturn.forEach((sr) => {
        const key = "Sales Return"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: sr.invoice_id || "-",
          supplier: sr.customer_name || "-",
          paymentType: sr.payment_type_name || "-",
          category: sr.payment_type_category_name || "-",
          amount: Number(sr.amount) || 0,
        })
      })

      expenseDebit.forEach((ed) => {
        const key = "Expense Debit"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          reference: ed.reference || "-",
          supplier: ed.supplier_name || "-",
          paymentType: ed.payment_type_name || "-",
          category: ed.payment_type_category_name || "-",
          amount: Number(ed.amount) || 0,
        })
      })

      return Object.entries(grouped).map(([type, items]) => ({
        type,
        items,
        total: items.reduce((sum, item) => sum + (item.amount || 0), 0),
      }))
    } catch (err) {
      console.error("[v0] Error grouping outflow data:", err)
      return []
    }
  }, [outflowData])

  const filteredTransactionSummary = useMemo(() => {
    try {
      if (!searchTerm.trim() || !Array.isArray(transactionSummary)) {
        return transactionSummary
      }

      const q = searchTerm.toLowerCase().trim()
      return transactionSummary.filter((t) => {
        const paymentType = (t?.payment_type_name || "").toLowerCase()
        const category = (t?.payment_type_category_name || "").toLowerCase()
        return paymentType.includes(q) || category.includes(q)
      })
    } catch (err) {
      console.error("[v0] Error filtering transaction summary:", err)
      return transactionSummary
    }
  }, [transactionSummary, searchTerm])

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const apply = useCallback(() => {
    setAppliedFilters(filters)
  }, [filters])

  const handleExcelExport = useCallback(() => {
    try {
      // Transaction Summary Sheet
      const transactionData = filteredTransactionSummary.map((t) => ({
        "Payment Type": t.payment_type_name || "-",
        Category: t.payment_type_category_name || "-",
        "Opening Balance": fmt2(t.opening_balance),
        Received: fmt2(t.received),
        Payment: fmt2(t.payment),
        Balance: fmt2(t.balance),
        "Closing Balance": fmt2(t.closing_balance),
      }))

      transactionData.push({
        "Payment Type": "TOTAL",
        Category: "",
        "Opening Balance": fmt2(summaryTotals.total_opening_balance),
        Received: fmt2(summaryTotals.total_received),
        Payment: fmt2(summaryTotals.total_payment),
        Balance: fmt2(summaryTotals.total_balance),
        "Closing Balance": fmt2(summaryTotals.total_closing_balance),
      })

      const ws = XLSX.utils.json_to_sheet(transactionData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Transaction Summary")

      // Inflow Sheet
      if (groupedInflowData.length > 0) {
        const inflowExportData = []
        groupedInflowData.forEach((group) => {
          group.items.forEach((item) => {
            inflowExportData.push({
              Type: group.type,
              Reference: item.reference,
              Customer: item.customer,
              "Payment Type": item.paymentType,
              Category: item.category,
              Amount: fmt2(item.amount),
            })
          })
          inflowExportData.push({
            Type: `${group.type} Subtotal`,
            Reference: "",
            Customer: "",
            "Payment Type": "",
            Category: "",
            Amount: fmt2(group.total),
          })
        })
        const wsInflow = XLSX.utils.json_to_sheet(inflowExportData)
        XLSX.utils.book_append_sheet(wb, wsInflow, "Inflow of Fund")
      }

      // Outflow Sheet
      if (groupedOutflowData.length > 0) {
        const outflowExportData = []
        groupedOutflowData.forEach((group) => {
          group.items.forEach((item) => {
            outflowExportData.push({
              Type: group.type,
              Reference: item.reference,
              Supplier: item.supplier,
              "Payment Type": item.paymentType,
              Category: item.category,
              Amount: fmt2(item.amount),
            })
          })
          outflowExportData.push({
            Type: `${group.type} Subtotal`,
            Reference: "",
            Supplier: "",
            "Payment Type": "",
            Category: "",
            Amount: fmt2(group.total),
          })
        })
        const wsOutflow = XLSX.utils.json_to_sheet(outflowExportData)
        XLSX.utils.book_append_sheet(wb, wsOutflow, "Outflow of Fund")
      }

      XLSX.writeFile(wb, `cash-statement-report-${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (err) {
      console.error("[v0] Error exporting to Excel:", err)
      alert("Error exporting to Excel. Please try again.")
    }
  }, [filteredTransactionSummary, summaryTotals, groupedInflowData, groupedOutflowData])

  const handlePDFExport = useCallback(async () => {
    try {
      const blob = await pdf(
        <CashStatementReportPDF
          openingBalance={openingBalance}
          transactionSummary={filteredTransactionSummary}
          summaryTotals={summaryTotals}
          inflowRows={inflowData}
          outflowRows={outflowData}
          filters={appliedFilters}
          logoUrl={logoUrlForPdf}
          user={session?.user}
        />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (err) {
      console.error("[v0] Error generating PDF:", err)
      alert("Error generating PDF. Please try again.")
    }
  }, [
    openingBalance,
    filteredTransactionSummary,
    summaryTotals,
    inflowData,
    outflowData,
    appliedFilters,
    session?.user,
  ])

  // Print
  const tableRef = useRef(null)
  const handlePrintTable = useCallback(() => {
    try {
      if (!tableRef.current) return
      const content = tableRef.current.innerHTML
      const w = window.open("", "PRINT", "height=900,width=1200")
      if (!w) return
      w.document.write(`
        <html>
          <head>
            <title>Cash Statement Report</title>
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
      `)
      w.document.close()
    } catch (err) {
      console.error("[v0] Error printing:", err)
      alert("Error printing table. Please try again.")
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6 poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Cash Statement Report</h1>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 h-screen bg-white flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-3">
              <p className="text-lg font-semibold text-gray-600">Loading Statement</p>
              <div className="flex justify-center items-center h-40">
  <div className="h-5 w-5 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
</div>

            </div>
          </div>
        </div>
      )}

      {/* Summary KPI */}
      <Card className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
        <Card className="bg-[#708d8f] text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{fmt2(summaryTotals.total_opening_balance)} BDT</p>
              <p className="text-sm font-medium">Opening Balance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#588157] text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{fmt2(summaryTotals.total_received)} BDT</p>
              <p className="text-sm font-medium">Total Received</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a9396] text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{fmt2(summaryTotals.total_payment)} BDT</p>
              <p className="text-sm font-medium">Total Payment</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#9b6a6c] text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{fmt2(summaryTotals.total_closing_balance)} BDT</p>
              <p className="text-sm font-medium">Closing Balance</p>
            </div>
          </CardContent>
        </Card>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="col-span-3 flex items-center gap-5">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date.slice(0, 10)}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value ? `${e.target.value}T00:00:00.000Z` : "")
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
                    handleFilterChange("end_date", e.target.value ? `${e.target.value}T23:59:59.999Z` : "")
                  }
                />
              </div>
              <div className="flex justify-center items-center mt-5">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={apply}>
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex col-span-2 justify-end items-center w-full space-x-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payment type / category"
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
                  <DropdownMenuLabel className="text-gray-600 font-semibold text-sm">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExcelExport} className="hover:bg-blue-50">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" /> Download Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePDFExport} className="hover:bg-blue-50">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" /> Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrintTable} className="hover:bg-blue-50">
                    <Printer className="h-4 w-4 mr-2 text-blue-500" /> Print Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Balance Card */}
      <Card>
        <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="border-b border-gray-400 bg-slate-100/80 hover:bg-slate-100/80">
                <TableHead className="w-1/3 p-3 text-left font-semibold text-black">Particulars</TableHead>
                <TableHead className="w-1/3 p-3 text-left font-semibold text-black">Type</TableHead>
                <TableHead className="w-1/3 p-3 text-right font-semibold text-black">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              <TableRow className="border-b border-gray-400 align-top bg-white">
                <TableCell className="px-3 font-semibold align-top bg-white">Opening Balance</TableCell>
                <TableCell className="pl-3 py-3 align-top bg-white">
                  <Table className="w-full border-0">
                    <TableBody>
                      {openingBalance.map((row, idx) => {
                        const displayType = row.payment_type_category_name || "-";

                        return (
                          <TableRow key={idx} className="border-b border-gray-300 last:border-none">
                            <TableCell className="py-2">{displayType || "-"}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableCell>
                <TableCell className="pr-3 py-3 align-top bg-white">
                  <Table className="w-full border-0">
                    <TableBody>
                      {openingBalance.map((row, idx) => (
                        <TableRow key={idx} className="border-b border-gray-300 last:border-none">
                          <TableCell className="py-2 text-right">{fmt2(row?.opening_balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {groupedInflowData.length > 0 && (
        <Card>
          <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-black">Inflow of Fund</h3>
            <Table className="w-full table-fixed border-collapse">
              <TableHeader>
                <TableRow className="border-b border-gray-400 bg-blue-50">
                  <TableHead className="w-1/4 p-3 text-left font-semibold text-black">Particular</TableHead>
                  <TableHead className="w-1/2 p-3 text-left font-semibold text-black">Invoice ID</TableHead>
                  <TableHead className="w-1/6 p-3 text-left font-semibold text-black">Type</TableHead>
                  <TableHead className="w-1/6 p-3 text-right font-semibold text-black">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-white">
                {groupedInflowData.map((group, groupIdx) => (
                  <TableRow key={groupIdx} className="border-b border-gray-400 align-top bg-white">
                    <TableCell className="px-3 py-3 font-semibold align-top bg-blue-50 w-1/4">{group.type}</TableCell>

                    <TableCell className="pl-3 py-3 align-top bg-white w-1/2">
                      <div className="w-full">
                        {group.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex flex-col border-b border-gray-200 last:border-b-0 py-2">
                            <span className="font-medium text-sm">{item?.reference}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="pl-3 py-3 align-top bg-white w-1/6">
                      {group.items.map((item, idx) => (
                        <div key={idx} className="border-b border-gray-200 last:border-b-0 py-2 text-sm">
                          {item.paymentType}
                        </div>
                      ))}
                    </TableCell>

                    <TableCell className="pr-3 py-3 align-top bg-white w-1/6">
                      <div className="w-full">
                        {group.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="border-b border-gray-200 last:border-b-0 py-2 text-right text-sm"
                          >
                            {fmt2(item.amount)}
                          </div>
                        ))}

                        <div className="border-t-2 border-gray-400 bg-blue-50 py-2 text-right font-semibold text-sm">
                          {fmt2(group.total)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {groupedOutflowData.length > 0 && (
        <Card>
          <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-black">Outflow of Fund</h3>
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-gray-400 bg-red-50 hover:bg-red-50">
                  <TableHead className="w-1/4 p-3 text-left font-semibold text-black">Particular</TableHead>
                  <TableHead className="w-1/2 p-3 text-left font-semibold text-black">Invoice ID</TableHead>
                  <TableHead className="w-1/6 p-3 text-left font-semibold text-black">Type</TableHead>
                  <TableHead className="w-1/6 p-3 text-right font-semibold text-black">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {groupedOutflowData.map((group, groupIdx) => (
                  <TableRow key={groupIdx} className="border-b border-gray-400 align-top bg-white">
                    <TableCell className="px-3 py-3 font-semibold align-top bg-red-50 w-1/4">{group.type}</TableCell>

                    <TableCell className="pl-3 py-3 align-top bg-white w-1/2">
                      <div className="w-full">
                        {group.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex flex-col border-b border-gray-200 last:border-b-0 py-2">
                            <span className="font-medium text-sm">{item.reference}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="pl-3 py-3 align-top bg-white w-1/6">
                      {group.items.map((item, idx) => (
                        <div key={idx} className="border-b border-gray-200 last:border-b-0 py-2 text-sm">
                          {item.paymentType}
                        </div>
                      ))}
                    </TableCell>

                    <TableCell className="pr-3 py-3 align-top bg-white w-1/6">
                      <div className="w-full">
                        {group.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="border-b border-gray-200 last:border-b-0 py-2 text-right text-sm"
                          >
                            {fmt2(item.amount)}
                          </div>
                        ))}

                        <div className="border-t-2 border-gray-400 bg-red-50 py-2 text-right font-semibold text-sm">
                          {fmt2(group.total)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Transaction Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center text-gray-500 h-32 flex items-center justify-center">
              <div>
                <p className="font-medium">Error loading data</p>
                <p className="text-sm mt-1">Please try again or contact support if the issue persists</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">Payment Type</TableHead>
                      <TableHead className="font-bold text-black">Category</TableHead>
                      <TableHead className="font-bold text-black text-right">Opening Balance</TableHead>
                      <TableHead className="font-bold text-black text-right">Received</TableHead>
                      <TableHead className="font-bold text-black text-right">Payment</TableHead>
                      <TableHead className="font-bold text-black text-right">Balance</TableHead>
                      <TableHead className="font-bold text-black text-right">Closing Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactionSummary.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row?.payment_type_name || "-"}</TableCell>
                        <TableCell>{row?.payment_type_category_name || "-"}</TableCell>
                        <TableCell className="text-right">{fmt2(row?.opening_balance)}</TableCell>
                        <TableCell className="text-right">{fmt2(row?.received)}</TableCell>
                        <TableCell className="text-right">{fmt2(row?.payment)}</TableCell>
                        <TableCell className="text-right">{fmt2(row?.balance)}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt2(row?.closing_balance)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredTransactionSummary.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredTransactionSummary.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={2}>TOTAL</TableCell>
                        <TableCell className="text-right">{fmt2(summaryTotals.total_opening_balance)}</TableCell>
                        <TableCell className="text-right">{fmt2(summaryTotals.total_received)}</TableCell>
                        <TableCell className="text-right">{fmt2(summaryTotals.total_payment)}</TableCell>
                        <TableCell className="text-right">{fmt2(summaryTotals.total_balance)}</TableCell>
                        <TableCell className="text-right">{fmt2(summaryTotals.total_closing_balance)}</TableCell>
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
  )
}
