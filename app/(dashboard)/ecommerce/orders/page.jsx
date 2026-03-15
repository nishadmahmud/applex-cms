"use client";
import { React, useState } from "react";
import OrderSearchBar from "./order-search-bar";
import OrderTabs from "./order-tabs";
import OrderTable from "./order-table";
import ProtectedRoute from "@/components/ProtectedRoute";

const STATUS_TABS = [
  { label: "Order Received", type: 1 },
  { label: "Order Completed", type: 2 },
  { label: "Delivery Processing", type: 3 },
  { label: "Delivered", type: 4 },
  { label: "Canceled", type: 5 },
  { label: "Hold", type: 6 },
];

export default function EcommercePage() {
  const [selectedTab, setSelectedTab] = useState(1);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = (filters) => {
    // do nothing if all filters are empty
    if (!filters.keyword && !filters.start_date && !filters.end_date) {
      return;
    }

    setSearchParams(filters);
  };

  const handleReset = () => {
    setSearchParams(null);
  };

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Orders">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Ecommerce Orders
        </h1>

        <OrderSearchBar onSearch={handleSearch} onReset={handleReset} />

        <OrderTabs
          tabs={STATUS_TABS}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Pass searchParams to conditionally trigger search query within OrderTable */}
        <OrderTable orderType={selectedTab} searchParams={searchParams} />
      </div>
    </ProtectedRoute>
  );
}
