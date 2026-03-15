"use client";
import React, { useState, useEffect } from "react";

export default function OrderSearchBar({ onSearch, onReset }) {
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🕒 debounce effect (fires after 600 ms of pause)
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch({
        keyword,
        start_date: startDate ? new Date(startDate).toISOString() : "",
        end_date: endDate ? new Date(endDate).toISOString() : "",
      });
    }, 600);

    // cleanup for every change before timeout completes
    return () => clearTimeout(handler);
  }, [keyword, startDate, endDate, onSearch]);

  const handleReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    onReset();
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-end mb-6 bg-white p-4 rounded-lg shadow">
      {/* Keyword */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium text-gray-600 mb-1">
          Invoice Keyword
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. INV‑2025‑10‑23‑63304"
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Start date */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* End date */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Reset button only */}
      <div className="flex gap-3 mt-2 md:mt-0">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
