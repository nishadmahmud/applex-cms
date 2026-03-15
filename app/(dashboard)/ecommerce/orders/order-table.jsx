// import {
//   useGetOrdersQuery,
//   useSearchInvoicesQuery,
//   useUpdateOrderStatusMutation,
// } from "@/app/store/api/ecommerceOrderListApi";
// import { useSession } from "next-auth/react";

// import { React, useState } from "react";
// import { FiLoader } from "react-icons/fi";
// import StatusBadge from "./status-badge";
// import OrderRowMenu from "./order-row-menu";
// import PaginationBar from "./pagination-bar";
// import { de } from "zod/v4/locales";

// export default function OrderTable({ orderType, searchParams }) {
//   const { data: session, status } = useSession();
//   const [updateStatus] = useUpdateOrderStatusMutation();
//   const [loadingInvoice, setLoadingInvoice] = useState(null);
//   const [page, setPage] = useState(1);

//   const isSearchMode = Boolean(
//     searchParams?.keyword || searchParams?.start_date || searchParams?.end_date,
//   );

//   const orderListQuery = useGetOrdersQuery(
//     { type: orderType, page },
//     { skip: status !== "authenticated" || isSearchMode },
//   );

//   const searchQuery = useSearchInvoicesQuery(
//     { ...searchParams, page },
//     { skip: !isSearchMode || status !== "authenticated" },
//   );

//   const activeQuery = isSearchMode ? searchQuery : orderListQuery;
//   const isLoading = activeQuery.isLoading;
//   const data = activeQuery.data;
//   const pagination = {
//     current_page: data?.data?.current_page,
//     last_page: data?.data?.last_page,
//     total: data?.data?.total,
//     per_page: data?.data?.per_page,
//   };

//   const orders = data?.data?.data || [];

//   console.log(orders);

//   async function handleStatusChange(invoiceId, newStatus) {
//     try {
//       setLoadingInvoice(invoiceId);
//       await updateStatus({ invoice_id: invoiceId, status: newStatus }).unwrap();
//     } catch {
//       alert("Failed to update status");
//     } finally {
//       setLoadingInvoice(null);
//     }
//   }

//   if (status === "loading")
//     return (
//       <div className="text-center py-10 text-gray-500">Checking session...</div>
//     );

//   if (status === "unauthenticated")
//     return (
//       <div className="text-center py-10 text-red-500">
//         Please login to view orders.
//       </div>
//     );

//   if (isLoading)
//     return (
//       <div className="text-center py-10 text-gray-500">Loading orders...</div>
//     );

//   if (!orders.length)
//     return (
//       <div className="text-center py-10 text-gray-400">No orders found.</div>
//     );

//   return (
//     <div className="bg-white rounded-lg shadow">
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm border-collapse">
//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="p-3 text-left">Invoice</th>
//               <th className="p-3 text-left">Customer</th>
//               <th className="p-3 text-left">Amount</th>
//               <th className="p-3 text-left">Payment</th>
//               <th className="p-3 text-left">Date/Time</th>
//               <th className="p-3 text-left">Status</th>
//               <th className="p-3 text-left">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((o) => (
//               <tr key={o.invoice_id} className="border-t hover:bg-gray-50">
//                 <td className="p-3 font-medium">
//                   <div className="space-y-0.5">
//                     <p className="font-medium text-gray-900">{o.invoice_id}</p>

//                     {/* 🟢 Show Parcel ID if available */}
//                     {o.steadfast_courier?.consignment_id && (
//                       <p className="text-xs text-blue-600">
//                         Parcel ID: {o.steadfast_courier.consignment_id}
//                       </p>
//                     )}
//                   </div>
//                 </td>
//                 <td className="p-3">
//                   <div>{o.customer_name}</div>
//                   <div className="text-xs text-gray-500">
//                     {o.customer_phone}
//                   </div>
//                 </td>
//                 <td className="p-3">{o.sub_total + o.delivery_fee}</td>
//                 <td className="p-3">{o.pay_mode}</td>
//                 <td className="p-3 text-xs text-gray-600">
//                   {new Date(o.created_at).toLocaleString()}
//                 </td>
//                 <td className="p-3">
//                   <StatusBadge status={o.tran_status} />
//                 </td>
//                 <td className="p-3 flex gap-2 items-center">
//                   <OrderRowMenu
//                     order={o}
//                     orderId={o.id}
//                     onDeleted={() => {
//                       if (searchParams?.keyword) {
//                         // We're in search mode
//                         if (searchQuery.isSuccess) searchQuery.refetch();
//                       } else {
//                         // We're viewing tabbed list
//                         if (orderListQuery.isSuccess) orderListQuery.refetch();
//                       }
//                     }}
//                   />
//                   <select
//                     className="border rounded px-2 py-1 text-xs"
//                     value={o.tran_status}
//                     onChange={(e) =>
//                       handleStatusChange(o.invoice_id, e.target.value)
//                     }
//                     disabled={loadingInvoice === o.invoice_id}
//                   >
//                     <option value="1">Order Received</option>
//                     <option value="2">Order Completed</option>
//                     <option value="3">Delivery Processing</option>
//                     <option value="4">Delivered</option>
//                     <option value="5">Canceled</option>
//                     <option value="6">Hold</option>
//                   </select>
//                   {loadingInvoice === o.invoice_id && (
//                     <FiLoader className="animate-spin text-blue-600" />
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Bar */}
//       <PaginationBar pagination={pagination} onPageChange={setPage} />
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { FiLoader } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  useGetOrdersQuery,
  useSearchInvoicesQuery,
  useUpdateOrderStatusMutation,
} from "@/app/store/api/ecommerceOrderListApi";
import api from "@/lib/api";

import StatusBadge from "./status-badge";
import OrderRowMenu from "./order-row-menu";
import PaginationBar from "./pagination-bar";
import EcommerceOrderPrintSheet from "./ecommerce-order-print/EcommerceOrderPrintSheet";

export default function OrderTable({ orderType, searchParams }) {
  const { data: session, status } = useSession();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [loadingInvoice, setLoadingInvoice] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const isSearchMode = Boolean(
    searchParams?.keyword || searchParams?.start_date || searchParams?.end_date,
  );

  const orderListQuery = useGetOrdersQuery(
    { type: orderType, page },
    { skip: status !== "authenticated" || isSearchMode },
  );

  const searchQuery = useSearchInvoicesQuery(
    { ...searchParams, page },
    { skip: !isSearchMode || status !== "authenticated" },
  );

  const activeQuery = isSearchMode ? searchQuery : orderListQuery;
  const isLoading = activeQuery.isLoading;
  const data = activeQuery.data;
  const pagination = {
    current_page: data?.data?.current_page,
    last_page: data?.data?.last_page,
    total: data?.data?.total,
    per_page: data?.data?.per_page,
  };

  const orders = data?.data?.data || [];

  async function handleStatusChange(invoiceId, newStatus) {
    try {
      setLoadingInvoice(invoiceId);
      await updateStatus({ invoice_id: invoiceId, status: newStatus }).unwrap();
      toast.success("Order status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoadingInvoice(null);
    }
  }

  // 🌟 Selection logic for printing
  const toggleSelectAll = (checked) => {
    if (checked) setSelectedOrders(orders);
    else setSelectedOrders([]);
  };

  const toggleSelectSingle = (order) => {
    setSelectedOrders((prev) =>
      prev.find((p) => p.id === order.id)
        ? prev.filter((p) => p.id !== order.id)
        : [...prev, order],
    );
  };

  // 🌟 Print handler (identical logic from Pending Invoice)
  const fetchAllOrders = async () => {
    const all = [];
    try {
      let page = 1;
      let pages = 1;
      do {
        const res = await api.get(
          `/orders?type=${orderType}&page=${page}&limit=100`,
        );
        const batch = res?.data?.data?.data || [];
        all.push(...batch);
        const total = res?.data?.data?.total || 0;
        const perPage = res?.data?.data?.per_page || 100;
        pages = Math.ceil(total / perPage);
        page++;
      } while (page <= pages);
    } catch (err) {
      console.error("fetch all orders error:", err);
    }
    return all;
  };

  async function handlePrintInvoices(printAll = false) {
    let toastId;
    try {
      toastId = toast.info("Preparing print sheet...");
      let toPrint = [];

      if (printAll) {
        toPrint = await fetchAllOrders();
      } else {
        toPrint = selectedOrders;
      }

      if (!toPrint.length) {
        toast.dismiss(toastId);
        toast.error("No orders to print.");
        return;
      }

      const wrapper = document.createElement("div");
      document.body.appendChild(wrapper);
      const root = ReactDOM.createRoot(wrapper);
      root.render(
        <EcommerceOrderPrintSheet orders={toPrint} session={session} />,
      );

      // Prepare styled print window
      setTimeout(() => {
        const printHTML = `
          <html>
            <head>
              <meta charset="UTF-8" />
              <title>Order Labels</title>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 10mm; }
                  body { background: #fff; font-family: Arial, sans-serif; }
                  .print-page { page-break-after: always; display: flex; flex-direction: column; }
                  .print-page:last-child { page-break-after: auto; }
                  .print-page > div { page-break-inside: avoid; break-inside: avoid; margin-bottom: 12px; }
                  img { max-width: 100%; height: auto; }
                }
              </style>
            </head>
            <body>
              ${wrapper.innerHTML}
              <script>
                window.onafterprint = function() {
                  try { if (window.opener) window.opener.postMessage({ type: "PRINT_DONE" }, "*"); } catch {}
                  setTimeout(() => window.close(), 500);
                };
                window.onload = function() {
                  window.focus(); setTimeout(() => window.print(), 300);
                };
              </script>
            </body>
          </html>`;

        toast.dismiss(toastId);

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

        const reloadListener = (e) => {
          if (e.data?.type === "PRINT_DONE") {
            try {
              root.unmount?.();
            } catch {}
            wrapper.remove();
            window.removeEventListener("message", reloadListener);
            window.location.reload();
          }
        };
        window.addEventListener("message", reloadListener);
      }, 800);
    } catch (err) {
      console.error("Print failed:", err);
      toast.dismiss(toastId);
      toast.error("Print failed");
    }
  }

  // 🧩 Render States
  if (status === "loading")
    return (
      <div className="text-center py-10 text-gray-500">Checking session...</div>
    );

  if (status === "unauthenticated")
    return (
      <div className="text-center py-10 text-red-500">
        Please login to view orders.
      </div>
    );

  if (isLoading)
    return (
      <div className="text-center py-10 text-gray-500">Loading orders...</div>
    );

  if (!orders.length)
    return (
      <div className="text-center py-10 text-gray-400">No orders found.</div>
    );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ✅ Print action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <p className="text-sm text-gray-600">
          {selectedOrders.length
            ? `${selectedOrders.length} order(s) selected`
            : "Select orders to print"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrintInvoices(false)}
            disabled={!selectedOrders.length}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Print Selected
          </button>
          {/* <button
            onClick={() => handlePrintInvoices(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded"
          >
            Print All
          </button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  checked={
                    orders.length > 0 &&
                    orders.every((o) =>
                      selectedOrders.some((s) => s.id === o.id),
                    )
                  }
                />
              </th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Date/Time</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.invoice_id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.some((s) => s.id === o.id)}
                    onChange={() => toggleSelectSingle(o)}
                  />
                </td>
                <td className="p-3 font-medium">
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900">{o.invoice_id}</p>
                    {o.steadfast_courier?.consignment_id && (
                      <p className="text-xs text-blue-600">
                        Parcel ID: {o.steadfast_courier.consignment_id}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-gray-500">
                    {o.customer_phone}
                  </div>
                </td>
                <td className="p-3">
                  {(o.sub_total + o.delivery_fee).toFixed(2)}
                </td>
                <td className="p-3">{o.pay_mode}</td>
                <td className="p-3 text-xs text-gray-600">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <StatusBadge status={o.tran_status} />
                </td>
                <td className="p-3 flex gap-2 items-center">
                  <OrderRowMenu
                    order={o}
                    orderId={o.id}
                    onDeleted={() => {
                      if (searchParams?.keyword) {
                        if (searchQuery.isSuccess) searchQuery.refetch();
                      } else {
                        if (orderListQuery.isSuccess) orderListQuery.refetch();
                      }
                    }}
                  />
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={o.tran_status}
                    onChange={(e) =>
                      handleStatusChange(o.invoice_id, e.target.value)
                    }
                    disabled={loadingInvoice === o.invoice_id}
                  >
                    <option value="1">Order Received</option>
                    <option value="2">Order Completed</option>
                    <option value="3">Delivery Processing</option>
                    <option value="4">Delivered</option>
                    <option value="5">Canceled</option>
                    <option value="6">Hold</option>
                  </select>
                  {loadingInvoice === o.invoice_id && (
                    <FiLoader className="animate-spin text-blue-600" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <PaginationBar pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
