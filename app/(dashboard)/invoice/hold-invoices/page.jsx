"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  SquareX,
  Trash2,
  Truck,
  Loader2,
  CheckSquare,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast, Toaster } from "sonner";
import { setToken } from "@/app/store/authSlice";
import {
  useGetHoldInvoiceListQuery,
  useDeleteHoldInvoiceMutation,
  useCancelHoldInvoiceMutation,
  useSearchHoldInvoicesMutation,
} from "@/app/store/api/holdInvoicesApi";
import { useGetDeliveryListQuery } from "@/app/store/api/deliveryApi";
import api from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import Select from "react-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HoldInvoiceFilters from "./HoldInvoiceFilters";
import HoldInvoicePrintSheet from "./holdinvoicePrint/HoldInvoicePrintSheet";

export default function HoldInvoiceListPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeActionInvoice, setActiveActionInvoice] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    nameId: false,
    emailId: false,
    phoneId: false,
    product: false,
    startDate: 0,
    endDate: new Date().toISOString(),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 50;

  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const hasActive =
      searchFilters.keyword ||
      searchFilters.nameId ||
      searchFilters.emailId ||
      searchFilters.phoneId ||
      searchFilters.product ||
      searchFilters.startDate !== 0;

    if (hasActive) {
      (async () => {
        try {
          const res = await searchHoldInvoices({
            ...searchFilters,
            page: currentPage,
            limit,
          }).unwrap();
          if (res?.data?.data) {
            setSearchResults(res.data.data);
          }
        } catch (err) {
          console.error(err);
          toast.error("Search failed");
        }
      })();
    } else {
      setSearchResults(null);
    }
  }, [searchFilters, currentPage]);

  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, dispatch, session]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();
  const canAccessHoldInvoiceList =
    !isEmployee || canAccess(features, "Sale", "Hold Invoice List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessHoldInvoiceList;

  const {
    data: invoiceData,
    isLoading,
    error,
    refetch,
  } = useGetHoldInvoiceListQuery(
    { page: currentPage, limit },
    { skip: status !== "authenticated" || !shouldFetch },
  );

  const [searchHoldInvoices, { isLoading: isSearching }] =
    useSearchHoldInvoicesMutation();

  const { data: deliveryMethodsData } = useGetDeliveryListQuery(
    {
      page: 1,
      limit: 20,
    },
    { skip: status !== "authenticated" },
  );

  const [deleteHoldInvoice, { isLoading: isDeleting }] =
    useDeleteHoldInvoiceMutation();

  const [cancelHoldInvoice, { isLoading: isCanceling }] =
    useCancelHoldInvoiceMutation();

  const invoices = searchResults || invoiceData?.data?.data || [];
  const totalPages = invoiceData?.data?.last_page || 1;

  const deliveryOptions =
    deliveryMethodsData?.data?.data?.map((m) => ({
      value: m.type_name.toLowerCase(),
      label: m.type_name,
      id: m.id,
    })) || [];

  const toggleRow = (invoiceId) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(invoiceId)
      ? newExpanded.delete(invoiceId)
      : newExpanded.add(invoiceId);
    setExpandedRows(newExpanded);
  };

  const toggleInvoiceSelect = (invoice) => {
    setSelectedInvoices((prev) =>
      prev.find((p) => p.id === invoice.id)
        ? prev.filter((p) => p.id !== invoice.id)
        : [...prev, invoice],
    );
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleCancelClick = (invoice) => {
    setInvoiceToCancel(invoice);
    setCancelDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteHoldInvoice({ id: invoiceToDelete.id }).unwrap();
      toast.success("Invoice deleted successfully");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete invoice");
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!invoiceToCancel) return;
    try {
      await cancelHoldInvoice({ invoice_id: invoiceToCancel.id, status: 4 }).unwrap();
      toast.success("Invoice canceled successfully");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel invoice");
    } finally {
      setCancelDialogOpen(false);
      setInvoiceToCancel(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const display = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    });
    return { display, time };
  };

  const formatAmount = (a) => `${Number(a).toFixed(2)} /-`;

  const handlePageChange = (p) =>
    p >= 1 && p <= totalPages && setCurrentPage(p);

  const handleAssignToDelivery = async () => {
    if (!selectedMethod) return toast.error("Select delivery method first.");
    if (!selectedInvoices.length)
      return toast.error("Select at least one invoice.");

    try {
      setIsAssigning(true);
      toast.info("Assigning invoices…");

      for (const inv of selectedInvoices) {
        const name = inv.delivery_customer_name || inv.customer_name || "";
        const phone = inv.delivery_customer_phone || inv.customer_phone || "";
        const address = inv.delivery_customer_address || "No address";
        const subTotal = Number(inv.sub_total) || 0;
        const totalWithFee = subTotal + Number(deliveryFee || 0);
        const sale_id = inv.id;
        const invoiceId = inv.invoice_id;

        if (selectedMethod.value === "pathao") {
          const orderPayload = {
            store_id: 1,
            merchant_order_id: invoiceId,
            recipient_name: name,
            recipient_phone: phone,
            recipient_address: address,
            recipient_city: 1,
            recipient_zone: 1,
            amount_to_collect: totalWithFee,
            item_quantity: inv.sales_details?.length || 1,
            item_description: inv.sales_details
              ?.map((d) => d.product_info?.name)
              .join(", "),
          };

          const orderRes = await api.post("/pathao/create-order", orderPayload);

          // ✅ Check if server returned an error block
          if (
            orderRes?.data?.data?.status === 400 &&
            orderRes.data.data.errors
          ) {
            const errors = orderRes.data.data.errors;
            // extract the first meaningful message
            const firstError =
              Object.values(errors)[0]?.[0] || "Unknown error.";
            toast.error(`Pathao failed for ${invoiceId}: ${firstError}`);
          } else if (orderRes?.data?.code === 200) {
            const c = orderRes.data.data;
            const logPayload = {
              consignment_id: String(c.consignment_id),
              invoice: c.merchant_order_id,
              sale_id,
              recipient_name: name,
              recipient_phone: phone,
              recipient_address: address,
              cod_amount: String(totalWithFee.toFixed(2)),
              delivery_status: "pending",
              note: "",
            };
            await api.post("steadfast-couriers", logPayload);
            toast.success(`Invoice ${invoiceId} → Pathao ✔️`);
          } else {
            const msg =
              orderRes?.data?.message ||
              "Order creation failed for unknown reason.";
            toast.error(`Pathao failed for ${invoiceId}: ${msg}`);
          }
        } else if (selectedMethod.value === "steadfast") {
          const createPayload = {
            invoice: invoiceId,
            recipient_name: name,
            recipient_phone: phone,
            recipient_address: address,
            delivery_type: 0,
            cod_amount: totalWithFee.toFixed(2),
            note: "",
          };

          const res = await api.post("courier/create-order", createPayload);

          // ✅ Handle server validation errors gracefully
          if (res?.data?.data?.status === 400 && res.data.data.errors) {
            const errors = res.data.data.errors;
            const firstError =
              Object.values(errors)[0]?.[0] || "Unknown error.";
            toast.error(`Steadfast failed for ${invoiceId}: ${firstError}`);
          } else if (
            res?.data?.status === "success" &&
            res?.data?.data?.consignment
          ) {
            const c = res.data.data.consignment;
            const logPayload = {
              consignment_id: c.consignment_id,
              invoice: c.invoice,
              sale_id,
              tracking_code: c.tracking_code,
              recipient_name: c.recipient_name,
              recipient_phone: c.recipient_phone,
              recipient_address: c.recipient_address,
              cod_amount: String(totalWithFee.toFixed(2)),
              note: c.note || "",
            };
            await api.post("steadfast-couriers", logPayload);
            toast.success(`Invoice ${invoiceId} → Steadfast 🚀`);
          } else {
            const msg =
              res?.data?.message || "Order creation failed for unknown reason.";
            toast.error(`Steadfast failed for ${invoiceId}: ${msg}`);
          }
        }
      }
      // ✅ NEW: Bulk-update delivery fees after all API calls
      try {
        const deliveryPayload = selectedInvoices.map((inv) => ({
          sales_id: inv.id,
          delivery_fee: Number(deliveryFee || 0),
        }));

        if (deliveryPayload.length > 0) {
          const updateRes = await api.post("/update-multiple-delivery-charge", {
            payload: deliveryPayload,
          });

          if (updateRes?.data?.success) {
            toast.success("Delivery charges updated successfully ✅");
          } else {
            toast.warning("Delivery charge update may have failed ⚠️");
          }
        }
      } catch (err) {
        console.error("Delivery charge update failed:", err);
        toast.error("Failed to update delivery charges");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error assigning invoices.");
    } finally {
      setIsAssigning(false);
      setSelectedInvoices([]);
      refetch();
    }
  };

  const openActionModal = (invoice) => {
    setActiveActionInvoice(invoice);
    setActionModalOpen(true);
  };

    // in PendingInvoiceListPage component, before return()
    const fetchAllPendingInvoices = async () => {
      const all = [];
      try {
        let page = 1;
        let pages = 1;
        do {
          const res = await api.get(`/hold-list?page=${page}&limit=100`);
          const batch = res?.data?.data?.data || [];
          all.push(...batch);
          const total = res?.data?.data?.total || 0;
          const perPage = res?.data?.data?.per_page || 100;
          pages = Math.ceil(total / perPage);
          page++;
        } while (page <= pages);
      } catch (err) {
        console.error("fetch all invoices error:", err);
      }
      return all;
    };

  const handlePrintInvoices = async (printAll = false) => {
    let toastId;
    try {
      toastId = toast.info("Preparing print sheet...");
      let printingInvoices = [];

      if (printAll) {
        printingInvoices = await fetchAllPendingInvoices();
      } else {
        printingInvoices = selectedInvoices;
      }

      if (!printingInvoices.length) {
        toast.dismiss(toastId);
        toast.error("No invoices to print.");
        return;
      }

      // temporary wrapper
      const wrapper = document.createElement("div");
      document.body.appendChild(wrapper);
      const root = ReactDOM.createRoot(wrapper);
      root.render(
        <HoldInvoicePrintSheet
          invoices={printingInvoices}
          session={session}
        />,
      );

      // wait a moment for barcodes / images to render
      setTimeout(() => {
        const printHTML = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Pending Invoice Labels</title>
            <style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    .print-page > div:not(:last-child) {
    margin-bottom: 12px;
  }

    body {
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: Arial, sans-serif;
    }

    /* EACH PAGE HOLDS EXACTLY 3 LABELS */
    .print-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }

    .print-page:last-child {
      page-break-after: auto;
    }

    /* NEVER SPLIT A LABEL */
    .print-page > div {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }

  img { max-width: 100%; height: auto; }
  svg { display: block; margin: 0 auto; }
</style>

          </head>
          <body>
            ${wrapper.innerHTML}

            <script>
              // Tell the opener (main app) to reload when printing is finished
              window.onafterprint = function() {
                try {
                  if (window.opener) {
                    window.opener.postMessage({ type: "PRINT_DONE" }, "*");
                  }
                } catch (e) {}
                setTimeout(() => window.close(), 500);
              };
              window.onload = function() {
                window.focus();
                setTimeout(() => window.print(), 300);
              };
            </script>
          </body>
        </html>`;

        toast.dismiss(toastId);

        // open print window
        const printWin = window.open("", "_blank", "width=900,height=700");
        if (!printWin) {
          toast.error("Popup blocked — allow popups to print.");
          root.unmount?.();
          wrapper.remove();
          return;
        }

        printWin.document.open();
        printWin.document.write(printHTML);
        printWin.document.close();

        // parent listens for message from print window
        const reloadListener = (e) => {
          if (e.data?.type === "PRINT_DONE") {
            // ✅ cleanup & full reload
            try {
              root.unmount?.();
            } catch {}
            wrapper.remove();
            window.removeEventListener("message", reloadListener);
            window.location.reload(); // now the page actually reloads
          }
        };
        window.addEventListener("message", reloadListener);
      }, 1000);
    } catch (err) {
      console.error("Print failed:", err);
      toast.dismiss(toastId);
      toast.error("Print failed");
    }
  };

  if (status === "loading" || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <p className="text-red-500 mb-3">Failed to load invoices</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );

  return (
    <ProtectedRoute featureName="Sale" optionName="Hold Invoice List">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <Toaster position="top-right" />

        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Hold Invoice List
            </h1>
            {/* 🆕 Search + Filters UI */}
            <HoldInvoiceFilters
              filters={searchFilters}
              onFilterChange={(newFilters) =>
                setSearchFilters((prev) => ({ ...prev, ...newFilters }))
              }
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white border border-violet-100 shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-3 w-full lg:w-1/2">
              <CheckSquare className="text-violet-600 shrink-0" />
              <p className="text-gray-700 text-sm">
                {selectedInvoices.length
                  ? `${selectedInvoices.length} invoice(s) selected`
                  : "Select invoices to assign a delivery"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-1/2 justify-end">
              <div className="w-48 sm:w-56">
                <Select
                  placeholder="Select Delivery..."
                  options={deliveryOptions}
                  value={selectedMethod}
                  onChange={(v) => setSelectedMethod(v)}
                />
              </div>
              <Input
                type="number"
                min="0"
                className="w-28 border-violet-200 focus:border-violet-400 focus:ring-violet-300"
                placeholder="Fee"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
              />
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
                onClick={handleAssignToDelivery}
                disabled={!selectedInvoices.length || isAssigning}
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Assign to Delivery
                  </>
                )}
              </Button>
              <Button
                onClick={() => handlePrintInvoices(false)}
                disabled={!selectedInvoices.length}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Print Selected
              </Button>

              <Button
                onClick={() => handlePrintInvoices(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Print All
              </Button>              
            </div>
          </div>
          {/* Status Filter Dropdown */}
          <div className="flex justify-end mb-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option value="all">All</option>
              <option value="hold">Hold</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* 🎯 Add this right before returning the table */}
          {/** Create filteredInvoices list once */}
          {(() => {
            // filter invoices based on status
            const filteredInvoices = invoices.filter((invoice) => {
              const isPending = !!invoice.steadfast_courier?.consignment_id;
              if (statusFilter === "all") return true;
              if (statusFilter === "pending") return isPending;
              if (statusFilter === "hold") return !isPending;
              return true;
            });

            return (
              <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-[950px] w-full text-sm">
                  <thead className="bg-white border-b border-gray-200 font-semibold text-gray-900 select-none">
                    <tr>
                      {/* ✅ Fixed checkbox selecting only filtered invoices */}
                      <th className="w-10 text-center py-2">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedInvoices(filteredInvoices)
                              : setSelectedInvoices([])
                          }
                          checked={
                            filteredInvoices.length > 0 &&
                            filteredInvoices.every((fInv) =>
                              selectedInvoices.some(
                                (sInv) => sInv.id === fInv.id,
                              ),
                            )
                          }
                          className="accent-violet-600 cursor-pointer"
                        />
                      </th>
                      <th className="w-32 text-left py-2 px-2">Invoice</th>
                      <th className="w-[250px] text-left py-2 px-2">
                        Products
                      </th>
                      <th className="w-24 text-right py-2 px-2">Total</th>
                      <th className="w-24 text-right py-2 px-2">Due</th>
                      <th className="w-40 text-left py-2 px-2">Date/Time</th>
                      <th className="w-20 text-center py-2 px-2">Status</th>
                      <th className="w-16 text-center py-2 px-2">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {/* Use filteredInvoices instead of invoices */}
                    {filteredInvoices.map((invoice) => {
                      const isExpanded = expandedRows.has(invoice.id);
                      const dateInfo = formatDate(invoice.created_at);
                      const dueAmount = invoice.sub_total - invoice.paid_amount;
                      const isChecked = selectedInvoices.some(
                        (i) => i.id === invoice.id,
                      );

                      return (
                        <React.Fragment key={invoice.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="text-center py-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleInvoiceSelect(invoice)}
                                className="accent-violet-600 cursor-pointer"
                              />
                            </td>

                            <td className="py-2 px-2 align-middle">
                              <div className="font-medium text-blue-600 truncate">
                                {invoice.invoice_id}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {invoice.customer_name}
                              </div>
                              {invoice.steadfast_courier?.consignment_id && (
                                <p className="text-xs text-blue-600 truncate">
                                  Parcel ID:{" "}
                                  {invoice.steadfast_courier.consignment_id}
                                </p>
                              )}
                              {invoice?.delivery_customer_address ? (
                                <p className="text-xs text-gray-500 whitespace-normal break-words max-w-[200px]">
                                  Addr: {invoice.delivery_customer_address}
                                </p>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="py-2 px-2 align-middle">
                              <div className="flex flex-col gap-0.5">
                                {invoice.sales_details?.map((d, i) => {
                                  const currentStock = d.product_variant
                                    ? d.product_variant.quantity
                                    : d.product_info?.quantity;
                                  const isNegative = Number(currentStock) <= 0;
                                  return (
                                    <div
                                      key={i}
                                      className="whitespace-normal break-words flex items-center gap-1"
                                    >
                                      <span className="text-gray-500">
                                        {i + 1}.
                                      </span>
                                      <span
                                        className={`font-medium ${isNegative
                                          ? "text-red-600"
                                          : "text-gray-800"
                                          } transition-colors duration-200`}
                                      >
                                        {d.product_info?.name}{" "}
                                        {d.product_variant?.name && `(${d.product_variant.name})`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>

                            <td className="py-2 px-2 text-right font-medium align-middle">
                              {formatAmount(invoice.sub_total)}
                            </td>

                            <td className="py-2 px-2 text-right font-medium align-middle">
                              {formatAmount(dueAmount)}
                            </td>

                            <td className="py-2 px-2 align-middle">
                              <div className="font-medium">
                                {dateInfo.display}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dateInfo.time}
                              </div>
                            </td>

                            <td
                              className={`text-center py-2 font-medium align-middle ${invoice.steadfast_courier?.consignment_id
                                ? "text-green-600"
                                : "text-red-500"
                                }`}
                            >
                              {invoice.steadfast_courier?.consignment_id
                                ? "Pending"
                                : "Hold"}
                            </td>

                            <td className="text-center py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:text-violet-600"
                                onClick={() => openActionModal(invoice)}
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
                              <td colSpan={8} className="px-6 py-2">
                                {invoice.sales_details?.map((d, i) => (
                                  <div key={i}>
                                    {i + 1}. {d.product_info?.name}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination (unchanged) */}
                <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "ghost"}
                        onClick={() => handlePageChange(p)}
                        className={
                          currentPage === p
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "text-gray-600"
                        }
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action Modal */}
        <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
          <DialogContent className="sm:max-w-sm rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Invoice Actions
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 px-2 pb-4 text-sm">
              <Link
                href={`/invoice/${activeActionInvoice?.invoice_id || ""}`}
                onClick={() => setActionModalOpen(false)}
              >
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                  View Invoice
                </Button>
              </Link>

              <Link
                href={`/invoice/edit/${activeActionInvoice?.invoice_id || ""}`}
                onClick={() => setActionModalOpen(false)}
              >
                <Button className="w-full justify-start gap-2 text-white bg-blue-600 hover:bg-blue-700">
                  <Pencil className="h-4 w-4" />
                  Edit Invoice
                </Button>
              </Link>

              <Button
                className="w-full justify-start gap-2 text-white bg-yellow-600 hover:bg-yellow-700"
                onClick={() => {
                  setActionModalOpen(false);
                  handleCancelClick(activeActionInvoice);
                }}
              >
                <SquareX className="h-4 w-4" />
                Cancel Invoice
              </Button>

              <Button
                className="w-full justify-start gap-2 text-white bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setActionModalOpen(false);
                  handleDeleteClick(activeActionInvoice);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Delete invoice{" "}
                <span className="font-semibold">
                  {invoiceToDelete?.invoice_id}
                </span>{" "}
                permanently? This can’t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/*Cancel Confirmation*/}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancel</AlertDialogTitle>
              <AlertDialogDescription>
                Cancel invoice{" "}
                <span className="font-semibold">
                  {invoiceToCancel?.invoice_id}
                </span>{" "}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
