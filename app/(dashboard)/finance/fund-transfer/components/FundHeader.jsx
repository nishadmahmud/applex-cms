// "use client";
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export default function FundHeader({ accounts }) {
//   if (!accounts?.length) return null;

//   return (
//     <>
//       <h2 className="text-lg font-semibold text-gray-700 mb-3">
//         Accounts Summary
//       </h2>
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {accounts.map((acc) => {
//           const amount = Number(acc.paymentcategory_sum_payment_amount);
//           const isNegative = amount < 0;
//           return (
//             <Card
//               key={acc.id}
//               className={`border transition hover:shadow-md ${
//                 isNegative
//                   ? "border-red-200 bg-red-50"
//                   : "border-emerald-100 bg-emerald-50"
//               }`}
//             >
//               <CardHeader className="pb-1">
//                 <CardTitle className="text-sm font-medium">
//                   {acc.payment_category_name}
//                 </CardTitle>
//                 <p className="text-[11px] text-gray-500">
//                   {acc.account_number}
//                 </p>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div
//                   className={`text-lg font-semibold ${
//                     isNegative ? "text-red-600" : "text-emerald-700"
//                   }`}
//                 >
//                   {amount.toFixed(2)}
//                 </div>
//                 <p className="text-[11px] text-gray-500">Balance</p>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </>
//   );
// }

"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Banknote, CreditCard, PiggyBank } from "lucide-react"; // sample generic icons

export default function FundHeader({ accounts }) {
  if (!accounts?.length) return null;

  const getIconOrLetter = (acc, isNegative) => {
    // If an icon URL or icon_letter exists, show whichever matches your backend structure
    if (acc.icon_letter && acc.icon_letter.startsWith("icon:")) {
      // for custom icon logic in the future
      const iconName = acc.icon_letter.replace("icon:", "").toLowerCase();
      switch (iconName) {
        case "wallet":
          return <Wallet className="h-5 w-5" />;
        case "cash":
          return <Banknote className="h-5 w-5" />;
        case "card":
          return <CreditCard className="h-5 w-5" />;
        default:
          return <PiggyBank className="h-5 w-5" />;
      }
    }

    // Otherwise fallback cleanly to letter (always capitalized)
    const firstLetter =
      acc.payment_category_name?.charAt(0)?.toUpperCase() || "?";
    return (
      <span
        className={`text-sm font-semibold ${
          isNegative ? "text-red-600" : "text-emerald-700"
        }`}
      >
        {firstLetter}
      </span>
    );
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Accounts Summary
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map((acc) => {
          const amount = Number(acc.paymentcategory_sum_payment_amount);
          const isNegative = amount < 0;

          return (
            <Card
              key={acc.id}
              className={`border transition hover:shadow-md ${
                isNegative
                  ? "border-red-200 bg-red-50"
                  : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <div>
                  <CardTitle className="text-sm font-medium">
                    {acc.payment_category_name}
                  </CardTitle>
                  <p className="text-[11px] text-gray-500">
                    {acc.account_number}
                  </p>
                </div>

                {/* 🪙 Icon / Letter Bubble */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm
                  ${
                    isNegative
                      ? "bg-red-100 shadow-red-50"
                      : "bg-emerald-100 shadow-emerald-50"
                  }`}
                >
                  {getIconOrLetter(acc, isNegative)}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div
                  className={`text-lg font-semibold ${
                    isNegative ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {amount.toFixed(2)}
                </div>
                <p className="text-[11px] text-gray-500">Balance</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
