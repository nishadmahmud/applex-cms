"use client";
import { useState } from "react";

/**
 * 🧠 Handles local exchange product selections and auto-tagging in order list.
 */
export default function useExchangeManager({ orderList, setOrderList }) {
  const [exchangeSelection, setExchangeSelection] = useState({});

  const handleToggleExchange = (product, checked) => {
    setExchangeSelection((prev) => ({
      ...prev,
      [product.id]: checked,
    }));

    // If product already in order list, update immediately
    if (orderList.length) {
      const updated = orderList.map((item) =>
        item.id === product.id ? { ...item, is_exchange: checked } : item,
      );
      setOrderList(updated);
    }
  };

  return {
    exchangeSelection,
    handleToggleExchange,
  };
}
