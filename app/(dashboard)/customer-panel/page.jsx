"use client";

import React, { useEffect, useState } from "react";

export default function CustomerPanel() {
  // will receive POS data from opener
  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState({
    subTotal: 0,
    total: 0,
    discount: 0,
    vat: 0,
  });

  useEffect(() => {
    // receive messages from main POS window
    const handleMessage = (e) => {
      if (e.data?.type === "POS_UPDATE") {
        setCart(e.data.payload.cart || []);
        setSummary(e.data.payload.summary || {});
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="bg-white h-screen w-screen flex flex-col">
      <div className="text-center py-3 text-xl font-bold border-b bg-gradient-to-r from-blue-50 to-violet-100 text-gray-700">
        Customer Display
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-100">
            <tr className="border-b">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Discount</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((p, i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-right">{Number(p.price).toFixed(2)}</td>
                <td className="p-2 text-center">{p.qty}</td>
                <td className="p-2 text-right">0</td>
                <td className="p-2 text-right">
                  {(Number(p.price) * Number(p.qty)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-gray-50 p-3 text-sm flex justify-between">
        <span>
          Subtotal: <strong>{summary.subTotal?.toFixed?.(2) || 0}</strong>
        </span>
        <span>
          Total Item: <strong>{cart.length}</strong>
        </span>
      </div>

      <div className="text-center text-lg font-semibold text-white bg-sky-500 py-3">
        Total Payable: ৳{summary.total?.toFixed?.(2) || "0.00"}
      </div>
    </div>
  );
}
