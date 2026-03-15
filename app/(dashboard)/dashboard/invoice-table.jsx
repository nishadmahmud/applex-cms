// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function InvoiceTable({ title, invoices, type }) {
//   const getDueStatus = (due) => {
//     if (due > 0)
//       return {
//         label: `${due.toLocaleString()} BDT`,
//         color: "bg-red-100 text-red-800",
//       };
//     if (due < 0)
//       return {
//         label: `${Math.abs(due).toLocaleString()} BDT`,
//         color: "bg-blue-100 text-blue-800",
//       };
//     return { label: "Paid", color: "bg-green-100 text-green-800" };
//   };

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffTime = Math.abs(now - date);
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       return {
//         date: date.toLocaleDateString("en-US", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         }),
//         ago: `${diffDays} days ago`,
//       };
//     } catch {
//       return { date: "N/A", ago: "" };
//     }
//   };
//   const router = useRouter();
//   const handleRowClick = (id) => {
//     if (type === "selling") {
//       router.push(`/invoice/${id}`);
//     } else {
//       router.push(`/invoice/${id}`);
//     }
//   };

//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-lg">{title}</CardTitle>
//             <CardDescription>
//               Latest {type === "selling" ? "sales" : "purchase"} transactions
//             </CardDescription>
//           </div>
//           <Link
//             href={
//               type === "selling"
//                 ? `/invoice/all-sell-invoice`
//                 : `/purchase/all-purchase-invoices`
//             }
//           >
//             <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
//               View All
//             </button>
//           </Link>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="border-b border-gray-200 bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                   Name
//                 </th>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                   Amount
//                 </th>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                   Due
//                 </th>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                   Date/Time
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices?.slice(0, 7).map((invoice) => {
//                 const dueAmount =
//                   Number.parseFloat(invoice.sub_total || 0) -
//                   Number.parseFloat(invoice.paid_amount || 0);
//                 const status = getDueStatus(dueAmount);
//                 const dateInfo = formatDate(invoice.created_at);
//                 const customerName =
//                   type === "selling"
//                     ? invoice.customer_name
//                     : invoice.vendor_name;

//                 return (
//                   <tr
//                     key={invoice.id}
//                     className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
//                     onClick={() => handleRowClick(invoice?.invoice_id)}
//                   >
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {invoice.invoice_id}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {customerName || "N/A"}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="font-semibold text-gray-900">
//                         {Number.parseFloat(
//                           invoice.sub_total || 0
//                         ).toLocaleString()}{" "}
//                         BDT
//                       </p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge className={`text-xs ${status.color}`}>
//                         {status.label}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="text-gray-900">{dateInfo.date}</p>
//                         <p className="text-xs text-gray-500">{dateInfo.ago}</p>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export default function InvoiceTable({ title, invoices, type }) {
  // ✅ helpers
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      // Compare dates only (strip time) to get accurate day diff
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

      let ago;
      if (diffDays === 0) ago = "Today";
      else if (diffDays === 1) ago = "Yesterday";
      else ago = `${diffDays} days ago`;

      return {
        date: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        ago,
      };
    } catch {
      return { date: "N/A", ago: "" };
    }
  };

  const router = useRouter();
  const handleRowClick = (id) => {
    if (type === "selling") {
      router.push(`/invoice/${id}`);
    } else {
      router.push(`/invoice/${id}`);
    }
  };

  // ✅ new helper for selling invoices (grand total + due / change)
  const calculateTotal = (inv) => {
    const sub = Number(inv?.sub_total || 0);
    const vat = Number(inv?.vat || 0);
    const tax = Number(inv?.tax || 0);
    const del = Number(inv?.delivery_fee || 0);
    const disc = Number(inv?.discount || 0);
    return sub + vat + tax + del - disc;
  };

  const calculatePayment = (inv) => {
    const total = calculateTotal(inv);
    const paid = Number(inv?.paid_amount || 0);
    const rawChange = inv?.cash_change;
    const hasChange =
      rawChange !== null &&
      rawChange !== undefined &&
      rawChange !== "" &&
      Number(rawChange) > 0;
    const change = hasChange ? Number(rawChange) : 0;

    let due = Math.max(total - paid, 0);
    let changeAmount = 0;

    if (change > 0) {
      due = 0;
      changeAmount = change;
    }

    return { total, due, changeAmount };
  };

  // ✅ general (purchase still uses original getDueStatus)
  const getDueStatus = (due) => {
    if (due > 0)
      return {
        label: `${due.toLocaleString()} BDT`,
        color: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
      };
    if (due < 0)
      return {
        label: `${Math.abs(due).toLocaleString()} BDT`,
        color: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
      };
    return { label: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" };
  };

  return (
    <Card className="shadow-sm rounded-md overflow-hidden">
      <CardHeader className="bg-[#0073B7] p-3 shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <div className="flex flex-col gap-0.5">
               <CardTitle className="text-sm font-bold text-white tracking-wider uppercase m-0 p-0">{title}</CardTitle>
               <CardDescription className="text-[10px] text-white/80 m-0 p-0">
                Latest {type === "selling" ? "sales" : "purchase"} transactions
               </CardDescription>
            </div>
          </div>
          <Link
            href={
              type === "selling"
                ? `/invoice/all-sell-invoice`
                : `/purchase/all-purchase-invoices`
            }
          >
            <button className="text-[11px] text-white hover:text-white/80 font-bold uppercase tracking-wider px-2 py-1 bg-white/20 rounded-md transition-colors">
              View All
            </button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* ========== MOBILE CARD LAYOUT ========== */}
        <div className="md:hidden space-y-2">
          {invoices?.slice(0, 7).map((invoice) => {
            const dateInfo = formatDate(invoice.created_at);
            const customerName =
              type === "selling"
                ? invoice.customer_name
                : invoice.vendor_name;

            let amountDisplay, dueBadge;

            if (type === "selling") {
              const { total, due, changeAmount } = calculatePayment(invoice);
              amountDisplay = `${total.toLocaleString()} BDT`;
              dueBadge =
                changeAmount > 0 ? (
                  <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-semibold px-1.5 py-0.5 rounded-full">
                    Change {changeAmount.toLocaleString()} BDT
                  </span>
                ) : due > 0 ? (
                  <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded-full">
                    Due {due.toLocaleString()} BDT
                  </span>
                ) : (
                  <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">
                    Paid
                  </span>
                );
            } else {
              const dueAmount =
                Number.parseFloat(invoice.sub_total || 0) -
                Number.parseFloat(invoice.paid_amount || 0);
              const status = getDueStatus(dueAmount);
              amountDisplay = `${Number(invoice.sub_total || 0).toLocaleString()} BDT`;
              dueBadge = (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              );
            }

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleRowClick(invoice?.invoice_id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground truncate">
                      {invoice.invoice_id}
                    </p>
                    {dueBadge}
                  </div>
                  <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                    {customerName || "N/A"}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {amountDisplay}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40">
                    {dateInfo.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== DESKTOP TABLE LAYOUT ========== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                  Due
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                  Date/Time
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices?.slice(0, 7).map((invoice) => {
                const dateInfo = formatDate(invoice.created_at);
                const customerName =
                  type === "selling"
                    ? invoice.customer_name
                    : invoice.vendor_name;

                // ✅ logic branches by type
                if (type === "selling") {
                  const { total, due, changeAmount } =
                    calculatePayment(invoice);

                  // nicer dynamic badge presentation
                  const dueBadge =
                    changeAmount > 0 ? (
                      <Badge className="text-xs bg-green-50 text-green-700 border border-green-200 font-semibold">
                        Change {changeAmount.toLocaleString()} BDT
                      </Badge>
                    ) : due > 0 ? (
                      <Badge className="text-xs bg-red-100 text-red-700 font-semibold">
                        {due.toLocaleString()} BDT
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-green-100 text-green-700 font-semibold">
                        Paid
                      </Badge>
                    );

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(invoice?.invoice_id)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {invoice.invoice_id}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {customerName || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900 font-bold">
                        {total?.toLocaleString() || Number(invoice.sub_total || 0).toLocaleString()} BDT
                      </td>
                      <td className="px-4 py-4">{dueBadge}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{dateInfo.date}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {dateInfo.ago}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // ✅ if it's purchase type – unchanged
                const dueAmount =
                  Number.parseFloat(invoice.sub_total || 0) -
                  Number.parseFloat(invoice.paid_amount || 0);
                const status = getDueStatus(dueAmount);

                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(invoice?.invoice_id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.invoice_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customerName || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {Number(invoice.sub_total || 0).toLocaleString()} BDT
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900">{dateInfo.date}</p>
                        <p className="text-xs text-gray-500">{dateInfo.ago}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
