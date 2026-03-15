"use client";

import { React, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useSearchPurchaseInvoicesMutation } from "@/app/store/api/allPurchaseInvoicesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function AllPurchaseInvoicesPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const { data: features, isLoading: permLoading } = useRolePermissions();

  const isEmployee = !!session?.isEmployee;

  const canAccessPurchaseInvoice =
    !isEmployee || canAccess(features, "Purchase", "Purchase Invoice");

  const permissionsReady = status === "authenticated" && !permLoading;

  const [searchPurchaseInvoices, { isLoading }] =
    useSearchPurchaseInvoicesMutation();
  const [showFilters, setShowFilters] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    nameId: false,
    emailId: false,
    phoneId: false,
    imei: false,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(
        localStorage.getItem("purchaseInvoicePerPage") || "50"
      );
    }
    return 50;
  });
  const [invoicesData, setInvoicesData] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  useEffect(() => {
    if (!permissionsReady) return;
    if (!canAccessPurchaseInvoice) return;

    fetchInvoices();
  }, [currentPage, perPage, permissionsReady, canAccessPurchaseInvoice]);

  const fetchInvoices = async () => {
    try {
      const payload = {
        keyword,
        nameId: filters.nameId,
        emailId: filters.emailId,
        phoneId: filters.phoneId,
        imei: filters.imei,
        startDate: startDate ? new Date(startDate).getTime() : 0,
        endDate: endDate
          ? new Date(endDate).toISOString()
          : new Date().toISOString(),
      };

      const response = await searchPurchaseInvoices({
        page: currentPage,
        limit: perPage,
        payload,
      }).unwrap();

      if (response.success) {
        setInvoicesData(response.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices();
  };

  const handlePerPageChange = (value) => {
    const newPerPage = Number.parseInt(value);
    setPerPage(newPerPage);
    localStorage.setItem("purchaseInvoicePerPage", newPerPage.toString());
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const renderPagination = () => {
    if (!invoicesData) return null;

    const { current_page, last_page } = invoicesData;
    const pages = [];

    pages.push(1);

    const startPage = Math.max(2, current_page - 1);
    const endPage = Math.min(last_page - 1, current_page + 1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < last_page - 1) {
      pages.push("...");
    }

    if (last_page > 1) {
      pages.push(last_page);
    }

    return (
      <div className="flex items-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={current_page === 1}
          className="px-4"
        >
          Prev
        </Button>

        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={current_page === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(last_page, prev + 1))
          }
          disabled={current_page === last_page}
          className="px-4"
        >
          Next
        </Button>
      </div>
    );
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please sign in to view purchase invoices.</div>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Purchase" optionName="Purchase Invoice">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">All Purchase Invoice</h1>

          <div className="relative">
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Invoice"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-12 bg-blue-50"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFilters}
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-blue-100"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-[400px] bg-blue-50 rounded-lg p-4 space-y-4 shadow-lg z-10">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vendorName"
                      checked={filters.nameId}
                      onCheckedChange={() => handleFilterChange("nameId")}
                    />
                    <Label htmlFor="vendorName" className="cursor-pointer">
                      Vendor Name
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vendorEmail"
                      checked={filters.emailId}
                      onCheckedChange={() => handleFilterChange("emailId")}
                    />
                    <Label htmlFor="vendorEmail" className="cursor-pointer">
                      Vendor Email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vendorNumber"
                      checked={filters.phoneId}
                      onCheckedChange={() => handleFilterChange("phoneId")}
                    />
                    <Label htmlFor="vendorNumber" className="cursor-pointer">
                      Vendor Number
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="imei"
                      checked={filters.imei}
                      onCheckedChange={() => handleFilterChange("imei")}
                    />
                    <Label htmlFor="imei" className="cursor-pointer">
                      IMEI
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-medium">Date</div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Search
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-[2fr,1.5fr,1fr,1.5fr,1fr,1.5fr] gap-4 p-4 border-b font-semibold">
            <div>Name</div>
            <div>Total Amount</div>
            <div>Due</div>
            <div>Date/Time</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : invoicesData?.data?.length > 0 ? (
            invoicesData.data.map((invoice) => (
              <div
                key={invoice.id}
                className="grid grid-cols-[2fr,1.5fr,1fr,1.5fr,1fr,1.5fr] gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-blue-900">
                    {invoice.invoice_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.vendor_name}
                  </div>
                </div>

                <div>{formatAmount(invoice.sub_total)}</div>

                <div>
                  {formatAmount(invoice.sub_total - invoice.paid_amount)}
                </div>

                <div>
                  <div>{formatDate(invoice.created_at)}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(invoice.created_at)}
                  </div>
                </div>

                <div>
                  <span
                    className={`font-medium ${invoice.status === 1 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {invoice.status === 1 ? "Completed" : "Hold"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/invoice/${invoice.invoice_id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 bg-transparent"
                    >
                      VIEW
                    </Button>
                  </Link>

                  <Link href={`/invoice/edit/${invoice.invoice_id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      EDIT
                    </Button>
                  </Link>

                  {invoice.image && (
                    <a href={invoice.image} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 bg-transparent"
                      >
                        ATTACHMENT
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No invoices found
            </div>
          )}
        </div>

        {renderPagination()}

        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm font-medium">Per Page:</span>
          <Select
            value={perPage.toString()}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ProtectedRoute>
  );
}
