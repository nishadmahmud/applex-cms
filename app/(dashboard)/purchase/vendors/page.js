"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef as useVendorRef } from "react";
import CustomPagination from "@/app/utils/CustomPagination";
import Link from "next/link";
import {
  useGetVendorListQuery,
  useSearchVendorQuery,
} from "@/app/store/api/purchaseVendorApi";
import CustomerListSkeleton from "../../sale/customers/CustomerListSkeleton";
import Modal from "@/app/utils/Modal";
import AddVendor from "../billing/AddVendor";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import VendorListPDF from "./VendorListPDF";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VendorList() {
  const { data: session, status } = useSession();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderSchema, setOrderSchema] = useState({
    vendor_id: "",
    vendor_name: "",
  });

  const [exporting, setExporting] = useState(false); // 👈 added state
  const debounceRef = useRef();

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessVendorList =
    !isEmployee || canAccess(features, "Purchase", "Vendor List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessVendorList;

  const { data: vendorList, isFetching: vendorFetching } =
    useGetVendorListQuery(
      { page: currentPage, limit: limit },
      { skip: !shouldFetch }
    );

  const { data: searchedData, isFetching } = useSearchVendorQuery(keyword, {
    skip: !keyword.trim(),
  });

  const handleChange = (e) => {
    if (debounceRef.current) {
      clearInterval(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setKeyword(e.target.value);
    }, 700);
  };

  const vendors = keyword.length
    ? searchedData?.data?.data
    : vendorList?.data?.data?.length
    ? vendorList.data.data
    : [];

  const totalPage =
    !vendorFetching || !isFetching
      ? Math.ceil(
          (keyword ? searchedData?.data?.total : vendorList?.data?.total) /
            limit
        )
      : 0;

  /* ------------------------------------------------------------------
     Helper: fetch all vendors (called only when user clicks export)
  ------------------------------------------------------------------ */
  const getAllVendors = async () => {
    if (!shouldFetch) return [];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/vendor-lists?limit=1000000&page=1`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      const json = await res.json();
      return json?.data?.data || [];
    } catch (error) {
      console.error("Error fetching all vendors:", error);
      return [];
    }
  };

  /* === Export Handlers === */

  const handleExcelExport = async () => {
    setExporting(true);
    try {
      const exportData = await getAllVendors();
      if (!exportData.length) {
        alert("No vendor data found for export.");
        return;
      }
      const sheetData = exportData.map((v) => ({
        Name: v.name,
        "Mobile Number": v.mobile_number,
        // "Membership Status": v.is_member ? "Premium" : "Regular",
        "Due Amount (BDT)": v.total_due_amount,
        "Purchase Count": v.invoice_list_count,
        "Total Amount (BDT)": v.total_purchase_amount,
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vendor List");
      XLSX.writeFile(
        wb,
        `vendor-list-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } finally {
      setExporting(false);
    }
  };

  const logoUrlForPdf = session?.user?.profile_pic
    ? `/api/logo-proxy?url=${encodeURIComponent(session.user.profile_pic)}`
    : null;

  const handlePDFExport = async () => {
    setExporting(true);
    try {
      const exportData = await getAllVendors();
      if (!exportData.length) {
        alert("No vendor data found for export.");
        return;
      }
      const blob = await pdf(
        <VendorListPDF
          data={exportData}
          user={session?.user}
          logoUrlForPdf={logoUrlForPdf}
        />
      ).toBlob();
      saveAs(blob, `vendor-list-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintTable = async () => {
    setExporting(true);
    try {
      const exportData = await getAllVendors();
      if (!exportData.length) {
        alert("No vendor data found for export.");
        return;
      }
      const rowsHtml = exportData
        .map(
          (v, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${v.name}</td>
            <td>${v.mobile_number}</td>
            <td>${v.total_due_amount?.toLocaleString("en-IN")} BDT</td>
            <td class="text-center">${v.invoice_list_count}</td>
            <td class="text-right">${Number(
              v.total_purchase_amount || 0
            ).toLocaleString("en-IN")} BDT</td>
          </tr>`
        )
        .join("");
      const win = window.open("", "PRINT", "height=900,width=1200");
      win.document.write(`
        <html>
          <head><title>Vendor List</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 5px; font-size: 12px; }
              thead th { background: #f3f4f6; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
            </style>
          </head>
          <body>
            <h2>Vendor List Report</h2>
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Due Amount</th>
                  <th>Purchase Count</th>
                  <th>Total Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <script>window.onload = () => {window.print(); window.close();}</script>
          </body>
        </html>
      `);
      win.document.close();
    } finally {
      setExporting(false);
    }
  };

  // --- Existing UI intact ---
  return (
    <ProtectedRoute featureName="Purchase" optionName="Vendor List">
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Vendor List</CardTitle>

              {/* --- EXPORT DROPDOWN + ADD --- */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={exporting}>
                    <Button variant="outline">
                      {exporting ? (
                        <>
                          <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin text-gray-400" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                          Export
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  {!exporting && (
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExcelExport}>
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-500" />
                        Download Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePDFExport}>
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePrintTable}>
                        <Printer className="w-4 h-4 mr-2 text-blue-500" />
                        Print Table
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>

                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setVendorModalOpen(true)}
                  disabled={exporting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </div>
            {exporting && (
              <p className="text-sm text-gray-500 mt-1 italic">
                Preparing export file, please wait...
              </p>
            )}
          </CardHeader>

          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search Vendor"
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    {/* <TableHead className="font-semibold">
                      Membership Status
                    </TableHead> */}
                    <TableHead className="font-semibold">Due Amount</TableHead>
                    <TableHead className="font-semibold text-center">
                      Purchase Number
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Purchase Amount
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorFetching || isFetching || !vendorList?.data?.data ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <CustomerListSkeleton key={i} />
                    ))
                  ) : vendors.length ? (
                    vendors.map((vendor) => (
                      <TableRow key={vendor?.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor?.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {vendor?.mobile_number || "N/A"}
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 hover:bg-orange-100"
                          >
                            Premium
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          <span className="font-medium">
                            {vendor?.total_due_amount?.toLocaleString("en-IN")}{" "}
                            BDT
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {vendor?.invoice_list_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {vendor?.total_purchase_amount?.toLocaleString(
                              "en-IN"
                            )}{" "}
                            BDT
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`vendors/vendor/${vendor.id}?interval=daily`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              VIEW
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell>No Data</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3">
              {totalPage ? (
                <CustomPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPage={totalPage}
                />
              ) : (
                " "
              )}
            </div>
          </CardContent>
        </Card>
        <Modal
          open={vendorModalOpen}
          onClose={() => setVendorModalOpen(false)}
          title="Add New Vendor"
          content={
            <AddVendor
              setVendorModal={setVendorModalOpen}
              setSelectedVendor={setSelectedVendor}
              setOrderSchema={setOrderSchema}
            />
          }
        />
      </div>
    </ProtectedRoute>
  );
}
