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
import {
  useGetCustomerListQuery,
  useSearchCustomerQuery,
} from "@/app/store/api/saleCustomerApi";
import CustomerListSkeleton from "./CustomerListSkeleton";
import CustomPagination from "@/app/utils/CustomPagination";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import Modal from "@/app/utils/Modal";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import CustomerListPDF from "./CustomerListPDF";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CustomerList() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const formRef = useRef(null);
  const tableRef = useRef(null);
  const debounceRef = useRef();

  const [exporting, setExporting] = useState(false); // 👈 added

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    nid: "",
    address: "",
    is_member: 0,
  });

  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, dispatch, session]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();
  const canAccessCustomerList =
    !isEmployee || canAccess(features, "Sale", "Customer List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessCustomerList;

  const { data: customerList, isFetching: customerFetching } =
    useGetCustomerListQuery(
      { page: currentPage, limit },
      { skip: status !== "authenticated" || !shouldFetch }
    );

  const { data: searchedData, isFetching } = useSearchCustomerQuery(keyword, {
    skip: !keyword.trim() || status !== "authenticated",
  });

  const handleChange = (e) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setKeyword(e.target.value), 700);
  };

  const customers = keyword.length
    ? searchedData?.data?.data
    : customerList?.data?.data || [];

  const totalPage = Math.ceil(
    (keyword ? searchedData?.data?.total : customerList?.data?.total || 0) /
      limit
  );

  /* ------------------------------------------------------------------
     Helper: fetch all customers (called only when user clicks export)
  ------------------------------------------------------------------ */
  const getAllCustomers = async () => {
    if (!shouldFetch) return [];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/customer-lists?per_page=1000000&page=1`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      const json = await res.json();
      return json?.data?.data || [];
    } catch (error) {
      console.error("Error fetching all customers:", error);
      return [];
    }
  };

  /* === Export Handlers === */

  const handleExcelExport = async () => {
    setExporting(true);
    try {
      const exportData = await getAllCustomers();
      if (!exportData.length) {
        alert("No customer data found for export.");
        return;
      }
      const sheetData = exportData.map((c) => ({
        Name: c.name,
        "Mobile Number": c.mobile_number,
        "Due Amount (BDT)": c.total_due_amount,
        "Purchase Number": c.invoice_list_count,
        "Total Amount (BDT)": c.total_purchase_amount,
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customer List");
      XLSX.writeFile(
        wb,
        `customer-list-${new Date().toISOString().split("T")[0]}.xlsx`
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
      const exportData = await getAllCustomers();
      if (!exportData.length) {
        alert("No customer data found for export.");
        return;
      }
      const blob = await pdf(
        <CustomerListPDF
          data={exportData}
          user={session?.user}
          logoUrlForPdf={logoUrlForPdf}
        />
      ).toBlob();
      saveAs(
        blob,
        `customer-list-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } finally {
      setExporting(false);
    }
  };

  const handlePrintTable = async () => {
    setExporting(true);
    try {
      const exportData = await getAllCustomers();
      if (!exportData.length) {
        alert("No customer data found for export.");
        return;
      }
      const rowsHtml = exportData
        .map(
          (c, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${c.mobile_number}</td>
            <td>${c.total_due_amount?.toLocaleString("en-IN")} BDT</td>
            <td class="text-center">${c.invoice_list_count}</td>
            <td class="text-right">${Number(
              c.total_purchase_amount || 0
            ).toLocaleString("en-IN")} BDT</td>
          </tr>`
        )
        .join("");
      const win = window.open("", "PRINT", "height=900,width=1200");
      win.document.write(`
        <html>
          <head><title>Customer List</title>
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
            <h2>Customer List Report</h2>
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Due Amount</th>
                  <th>Purchase Count</th>
                  <th>Total Purchase (BDT)</th>
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

  // UI intact
  return (
    <ProtectedRoute featureName="Sale" optionName="Customer List">
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Customer List
              </CardTitle>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={exporting}>
                    <Button variant="outline">
                      {exporting ? (
                        <>
                          <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin text-gray-400" />
                          Exporting…
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
                  onClick={() => setCustomerModalOpen(true)}
                  disabled={exporting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>
            {exporting && (
              <p className="text-sm text-gray-500 mt-1 italic">
                Preparing export file, please wait…
              </p>
            )}
          </CardHeader>

          {/* existing table and pagination stay unchanged */}
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search Customer"
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="rounded-md border overflow-x-auto" ref={tableRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    {/* <TableHead>Membership Status</TableHead> */}
                    <TableHead>Due Amount</TableHead>
                    <TableHead className="text-center">
                      Purchase Number
                    </TableHead>
                    <TableHead className="text-right">
                      Purchase Amount
                    </TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customerFetching || isFetching ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <CustomerListSkeleton key={i} />
                    ))
                  ) : customers.length ? (
                    customers.map((c) => (
                      <TableRow key={c?.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{c?.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {c?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {c?.mobile_number ? c?.mobile_number : "-"}
                        </TableCell>
                        {/* <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${
                              c.is_member
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.is_member ? "Premium" : "Regular"}
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          {c.total_due_amount?.toLocaleString("en-IN")} BDT
                        </TableCell>
                        <TableCell className="text-center">
                          {c.invoice_list_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {c.total_purchase_amount?.toLocaleString("en-IN")} BDT
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`customers/customer/${c.id}?interval=daily`}
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
                ""
              )}
            </div>
          </CardContent>
        </Card>

        <Modal
          open={customerModalOpen}
          onClose={() => setCustomerModalOpen(false)}
          title="Add New Customer"
          content={
            <CustomerInfoForm
              formData={formData}
              setFormData={setFormData}
              formRef={formRef}
              setCustomerModal={setCustomerModalOpen}
              setPaymentModal={() => {}}
              setExistingCustomerData={() => {}}
            />
          }
        />
      </div>
    </ProtectedRoute>
  );
}
