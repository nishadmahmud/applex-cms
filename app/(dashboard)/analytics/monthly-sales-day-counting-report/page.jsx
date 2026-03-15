"use client";
import React, { useRef, useState, useMemo } from "react";
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
  Search,
  ArrowLeft,
  FileText,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetSalesSummaryBrandsQuery,
  useGetSalesSummaryReportQuery,
} from "@/app/store/api/salesSummaryApi";
import { useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import SalesReportPDF from "./sales-report-pdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Select from "react-select";

export default function MonthlySalesDayCountingReport() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Filters state (for UI)
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString(), // current date
    end_date: new Date().toISOString(), // current date
    filter: "All",
    brand_id: "0",
    status: "",
  });

  // ✅ State for final applied filters (only used when "Get Report" is clicked)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [searchTerm, setSearchTerm] = useState("");
  const [radioFilter, setRadioFilter] = useState("All");

  // ✅ Fetch data only when user clicks "Get Report"
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = useGetSalesSummaryReportQuery(appliedFilters, {
    skip: status !== "authenticated",
  });

  const { data: brandsData, isLoading: brandsLoading } = useGetSalesSummaryBrandsQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      skip: status !== "authenticated",
    },
  );

  const reportData = salesData?.data || [];
  const brands = brandsData?.data?.data || [];

  // ✅ Prepare transaction data directly from API response (no fake data)
  // ✅ Prepare transaction data from API response
  const transactionData = useMemo(() => {
    return reportData.map((item, index) => {
      const salePrice = Number(item.price) || 0;
      const purchasePrice = Number(item.purchase_price) || 0;
      const qty = Number(item.qty) || 0;
      const profit = (salePrice - purchasePrice) * qty;

      return {
        sl: index + 1,
        transactionDate: item.date
          ? new Date(item.date).toLocaleDateString()
          : "",
        voucherNumber: item.invoice_id || "",
        customerName: item.customer_name || "",
        orderType: item.order_type || "",
        productName: item.product_name || "",
        qty,
        salesAmount: salePrice,
        purchaseAmount: purchasePrice,
        profit, // ✅ corrected calculation
        paymentType: item.payment_type || "",
        imei: item.imei || "",
      };
    });
  }, [reportData]);

  const filteredData = useMemo(() => {
    let filtered = transactionData;

    if (radioFilter !== "All") {
      filtered = transactionData;
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [transactionData, radioFilter, searchTerm]);

  // ✅ Compute totals precisely using API response data and fallbacks
  const totals = useMemo(() => {
    const totalSales = filteredData.reduce(
      (sum, item) => sum + item.salesAmount,
      0,
    );
    const totalPurchase = filteredData.reduce(
      (sum, item) => sum + item.purchaseAmount,
      0,
    );
    const totalProfit = filteredData.reduce(
      (sum, item) => sum + item.profit,
      0,
    );
    const totalDays = salesData?.days_count || 0;
    const discountTotal = salesData?.discount_total || 0;
    const deliveryFeeTotal = salesData?.delivery_fee_total || 0;
    const actualGrandTotal = salesData?.grand_total || 0;

    return {
      totalSales,
      totalPurchase,
      totalProfit,
      totalDays,
      discountTotal,
      deliveryFeeTotal,
      actualGrandTotal,
    };
  }, [filteredData, salesData]);

  const handlePDFExport = async () => {
    const blob = await pdf(
      <SalesReportPDF data={filteredData} totals={totals} filters={filters} />,
    ).toBlob();
    saveAs(
      blob,
      `sales-day-counting-report-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        SL: item.sl,
        "Transaction Date": item.transactionDate,
        "Voucher Number": item.voucherNumber,
        "Customer Name": item.customerName,
        "Order Type": item.orderType,
        "Product Name": item.productName,
        Qty: item.qty,
        "Sales Amount": item.salesAmount,
        "Purchase Amount": item.purchaseAmount,
        Profit: item.profit,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(
      workbook,
      `sales-day-counting-report-${new Date().toISOString().split("T")[0]}.xlsx`,
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
          <title>Sales Day Counting Report</title>
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Apply filters manually
  const handleGetReport = () => {
    setAppliedFilters(filters);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with User Info */}
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
              Sales Day Counting Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Daily transaction details and summary
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[30%,70%] gap-4">
        <Card className="bg-orange-500 text-white flex justify-center items-center">
          <CardContent className="p-3 ">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {totals.totalSales.toFixed(0)} BDT
              </p>
              <p className="text-sm font-medium">Sales Day Counting Report</p>
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
                      e.target.value + "T10:25:07.000Z",
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
                      e.target.value + "T10:25:07.344Z",
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Brand"
                  options={[
                    { value: "0", label: "All Brands" },
                    ...brands.map((brand) => ({
                      value: brand.id.toString(),
                      label: brand.name,
                    })),
                  ]}
                  value={[
                    { value: "0", label: "All Brands" },
                    ...brands.map((brand) => ({
                      value: brand.id.toString(),
                      label: brand.name,
                    })),
                  ].find((opt) => opt.value === filters.brand_id)}
                  onChange={(opt) =>
                    handleFilterChange("brand_id", opt?.value ?? "0")
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Status"
                  options={[
                    { value: "", label: "All" },
                    { value: "0", label: "Hold" },
                    { value: "1", label: "Completed" },
                    { value: "2", label: "Pending" },
                    { value: "3", label: "Return" },
                  ]}
                  value={[
                    { value: "", label: "All" },
                    { value: "0", label: "Hold" },
                    { value: "1", label: "Completed" },
                    { value: "2", label: "Pending" },
                    { value: "3", label: "Return" },
                  ].find((opt) => opt.value === filters.status)}
                  onChange={(opt) =>
                    handleFilterChange("status", opt?.value ?? "")
                  }
                />
              </div>

              <div>
                <Label>Filter Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="radioFilter"
                      value="All"
                      checked={filters.filter === "All"}
                      onChange={(e) =>
                        handleFilterChange("filter", e.target.value)
                      }
                      className="text-blue-600"
                    />
                    All
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="radioFilter"
                      value="IMEI"
                      checked={filters.filter === "IMEI"}
                      onChange={(e) =>
                        handleFilterChange("filter", e.target.value)
                      }
                      className="text-blue-600"
                    />
                    IMEI
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="radioFilter"
                      value="Normal"
                      checked={filters.filter === "Normal"}
                      onChange={(e) =>
                        handleFilterChange("filter", e.target.value)
                      }
                      className="text-blue-600"
                    />
                    Normal
                  </label>
                </div>
              </div>

              {/* ✅ Get Report Button */}
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleGetReport}
                >
                  Get Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions Bar */}
      <div className="flex justify-end items-center w-full space-x-3">
        {/* Search Box */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by Particulars"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Export Dropdown */}
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
          <CardTitle>Monthly Sales Day Counting Report</CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="flex items-center justify-center h-32">
              Loading sales data...
            </div>
          ) : salesError ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">
              Error loading data: {salesError.message}
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
                        Customer Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Order Type
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Product Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Qty
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Sales Amount
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Purchase Amount
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Profit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.sl}>
                        <TableCell>{item.sl}</TableCell>
                        <TableCell>{item.transactionDate}</TableCell>
                        <TableCell>{item.voucherNumber}</TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{item.orderType}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.salesAmount.toFixed(2)}</TableCell>
                        <TableCell>{item.purchaseAmount.toFixed(2)}</TableCell>
                        <TableCell>{item.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell>{totals.totalDays} Days</TableCell>
                      <TableCell>Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{totals.totalSales.toFixed(2)}</TableCell>
                      <TableCell>{totals.totalPurchase.toFixed(2)}</TableCell>
                      <TableCell>{totals.totalProfit.toFixed(2)}</TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell>Discount Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{totals.discountTotal}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell>Delivery Fee Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{totals.deliveryFeeTotal}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell>Actual Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{totals.actualGrandTotal}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell>Profit Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>{totals.totalProfit.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
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
