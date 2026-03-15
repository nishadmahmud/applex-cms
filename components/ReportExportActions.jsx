"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { generatePDF } from "./pdfReport";

export default function ReportExportActions({
  data = [],
  columns = [],
  reportTitle = "Business Report",
  userInfo = null,
  totals = null,
  rawData = [], // Added rawData prop for individual transactions
}) {
  const [isExporting, setIsExporting] = useState(false);

  // Export to Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);

      const dataToExport = rawData.length > 0 ? rawData : data;

      // Prepare data for Excel
      const excelData = dataToExport.map((row, index) => {
        if (rawData.length > 0) {
          // Individual transaction format
          return {
            SL: index + 1,
            "Transaction Date": new Date(row.date).toLocaleDateString(),
            "Voucher Number": row.invoice_id || "N/A",
            "Customer Name": row.customer_name || "N/A",
            "Order Type": "Shop",
            "Product Name": row.product_name || "N/A",
            Qty: row.qty || 0,
            "Sales Amount": Number.parseFloat(row.price || 0).toFixed(2),
            "Purchase Amount": Number.parseFloat(
              row.purchase_price || 0
            ).toFixed(2),
            Profit: (
              Number.parseFloat(row.price || 0) -
              Number.parseFloat(row.purchase_price || 0)
            ).toFixed(2),
          };
        } else {
          // Aggregated format
          const formattedRow = {};
          columns.forEach((col) => {
            formattedRow[col.label] = row[col.key] || "";
          });
          return formattedRow;
        }
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-adjust column widths
      const colWidths = Object.keys(excelData[0] || {}).map(() => ({
        wch: 15,
      }));
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // Save file
      XLSX.writeFile(
        wb,
        `${reportTitle.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);

      const dataToExport = rawData.length > 0 ? rawData : data;
      await generatePDF(dataToExport, reportTitle, userInfo, totals);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      setIsExporting(true);

      const dataToExport = rawData.length > 0 ? rawData : data;

      // Create printable content matching the image design
      const printContent = `
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                font-size: 12px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
              }
              .header h1 { 
                margin: 0; 
                font-size: 18px; 
                font-weight: bold; 
              }
              .user-info { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 15px; 
                font-size: 11px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 20px;
                font-size: 10px;
              }
              th, td { 
                border: 1px solid #000; 
                padding: 6px 4px; 
                text-align: center; 
              }
              th { 
                background-color: #f0f0f0; 
                font-weight: bold; 
                font-size: 9px;
              }
              .summary-section {
                border-top: 2px solid #000;
                padding-top: 10px;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                background-color: #f5f5f5;
                margin-bottom: 2px;
                padding-left: 10px;
                padding-right: 10px;
                font-weight: bold;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportTitle}</h1>
              <div style="font-size: 12px; margin-top: 5px;">Generated on: ${new Date().toLocaleDateString()}</div>
              ${
                userInfo
                  ? `
                <div class="user-info">
                  <span>Outlet: ${userInfo.outlet_name}</span>
                  <span>User: ${userInfo.name || userInfo.outlet_name}</span>
                </div>
              `
                  : ""
              }
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Transaction Date</th>
                  <th>Voucher Number</th>
                  <th>Customer Name</th>
                  <th>Order Type</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Sales Amount</th>
                  <th>Purchase Amount</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                ${dataToExport
                  .map(
                    (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.invoice_id || "N/A"}</td>
                    <td>${item.customer_name || "N/A"}</td>
                    <td>Shop</td>
                    <td>${item.product_name || "N/A"}</td>
                    <td>${item.qty || 0}</td>
                    <td>৳${Number.parseFloat(item.price || 0).toFixed(2)}</td>
                    <td>৳${Number.parseFloat(item.purchase_price || 0).toFixed(
                      2
                    )}</td>
                    <td>৳${(
                      Number.parseFloat(item.price || 0) -
                      Number.parseFloat(item.purchase_price || 0)
                    ).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            ${
              totals
                ? `
              <div class="summary-section">
                <div class="summary-row">
                  <span>${totals.activeDays} Days</span>
                  <span>Grand Total</span>
                  <span>৳${totals.totalSales.toFixed(2)}</span>
                  <span>৳${totals.totalPurchase.toFixed(2)}</span>
                  <span>৳${totals.totalProfit.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Discount Total</span>
                  <span>৳0.00</span>
                </div>
                <div class="summary-row">
                  <span>Actual Grand Total</span>
                  <span>৳${totals.totalSales.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Profit Total</span>
                  <span>৳${totals.totalProfit.toFixed(2)}</span>
                </div>
              </div>
            `
                : ""
            }
          </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Export Options
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportToExcel}
            disabled={
              isExporting || (data.length === 0 && rawData.length === 0)
            }
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>

          <Button
            onClick={exportToPDF}
            disabled={
              isExporting || (data.length === 0 && rawData.length === 0)
            }
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>

          <Button
            onClick={handlePrint}
            disabled={
              isExporting || (data.length === 0 && rawData.length === 0)
            }
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {data.length === 0 && rawData.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          No data available for export
        </p>
      )}
    </Card>
  );
}
