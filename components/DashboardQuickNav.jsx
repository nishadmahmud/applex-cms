"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Undo2,
  PackagePlus,
  CornerUpLeft,
  Wallet,
  Receipt,
  Boxes,
  Smartphone,
  NotebookText,
  PercentCircle,
  Search,
  X,
  Package,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLazyGetImeiSerialStockReportQuery } from "@/app/store/api/imeiSerialReportApi";
import SmartNotepadModal from "@/components/SmartNotepadModal";

const QUICK_ROUTES = [
  { label: "Sales", href: "/sale/billing", icon: ShoppingCart },
  { label: "S-Return", href: "/sale/return", icon: Undo2 },
  { label: "Purchase", href: "/purchase/billing", icon: PackagePlus },
  { label: "P-Return", href: "/purchase/return", icon: CornerUpLeft },
  { label: "Cashbook", href: "/analytics/cash-book-details-history", icon: Wallet },
  { label: "Expense", href: "/expense/list", icon: Receipt },
  { label: "Stock", href: "/products", icon: Boxes },
  { label: "IMEI Report", href: "/analytics/imei-serial-report", icon: Smartphone },
];

export default function DashboardQuickNav() {
  const pathname = usePathname();
  const [noteOpen, setNoteOpen] = useState(false);

  // IMEI Search
  const [imeiOpen, setImeiOpen] = useState(false);
  const [imeiQuery, setImeiQuery] = useState("");
  const [imeiResults, setImeiResults] = useState([]);
  const [imeiLoading, setImeiLoading] = useState(false);
  const [searchImei] = useLazyGetImeiSerialStockReportQuery();
  const debounceRef = useRef(null);
  const imeiBoxRef = useRef(null);

  // Close IMEI dropdown on outside click
  useEffect(() => {
    if (!imeiOpen) return;
    const handler = (e) => {
      if (imeiBoxRef.current && !imeiBoxRef.current.contains(e.target)) {
        setImeiOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [imeiOpen]);

  const handleImeiSearch = (e) => {
    const keyword = e.target.value;
    setImeiQuery(keyword);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (keyword.trim() === "") {
      setImeiResults([]);
      setImeiLoading(false);
      setImeiOpen(false);
      return;
    }

    setImeiLoading(true);
    setImeiOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchImei({ imei: keyword }).unwrap();
        const apiDataObj = res?.data || {};
        const flatRows = [];
        Object.keys(apiDataObj).forEach((group) => {
          (apiDataObj[group] || []).forEach((item) => {
            flatRows.push({
              name: item?.product_name || group,
              purchaseInvoice: item?.purchase_invoice || "N/A",
              saleInvoice: item?.sale_invoice || "N/A",
              purchasePrice: Number(item?.purchase_price ?? 0),
              salePrice: Number(item?.sale_price ?? 0),
              vendorName: item?.vendor_name || "N/A",
              inStock: Number(item?.in_stock ?? 0),
            });
          });
        });
        flatRows.sort((a, b) => b.inStock - a.inStock);
        setImeiResults(flatRows);
      } catch {
        setImeiResults([]);
      } finally {
        setImeiLoading(false);
      }
    }, 500);
  };

  const clearImei = () => {
    setImeiQuery("");
    setImeiResults([]);
    setImeiOpen(false);
  };

  return (
    <>
      <nav className="relative bg-white border-b border-gray-100 shadow-sm z-[35]">
        <div className="flex items-center gap-2 px-2 md:px-4 h-12 overflow-x-auto scrollbar-none">
          {/* Note Button */}
          <button
            onClick={() => setNoteOpen(true)}
            className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200/60 transition-all text-xs font-bold"
          >
            <NotebookText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Note</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Quick Route Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_ROUTES.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200/60 hover:bg-black hover:text-white hover:border-black"
                  }`}
                >
                  <route.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{route.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Offer Button */}
          <Link
            href="/ecommerce/offers"
            className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200/60 transition-all text-xs font-bold"
          >
            <PercentCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offers</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* IMEI Search */}
          <div ref={imeiBoxRef} className="relative shrink-0 ml-auto">
            <div className="flex items-center bg-gray-50 border border-gray-200/60 rounded-md h-8 w-44 md:w-56 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 ml-2.5 shrink-0" />
              <input
                type="text"
                placeholder="IMEI Search..."
                value={imeiQuery}
                onChange={handleImeiSearch}
                onFocus={() => {
                  if (imeiQuery.trim()) setImeiOpen(true);
                }}
                className="flex-1 bg-transparent text-xs font-medium outline-none px-2 text-gray-800 placeholder:text-gray-400"
              />
              {imeiQuery && (
                <button onClick={clearImei} className="pr-2">
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* IMEI Dropdown */}
            {imeiOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {imeiLoading ? (
                    <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </div>
                  ) : imeiResults.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      {imeiQuery.trim()
                        ? "No IMEI records found"
                        : "Type to search IMEI..."}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {imeiResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate flex-1">
                              {item.name}
                            </p>
                            <span
                              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.inStock > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {item.inStock > 0
                                ? `In Stock: ${item.inStock}`
                                : "Sold"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Vendor:{" "}
                            <span className="font-medium text-gray-700">
                              {item.vendorName}
                            </span>
                          </p>
                          <div className="flex justify-between mt-1.5 text-[11px]">
                            <span className="text-gray-500">
                              Purchase:{" "}
                              <span className="font-semibold text-emerald-600">
                                ৳{item.purchasePrice.toLocaleString()}
                              </span>
                            </span>
                            <span className="text-gray-500">
                              Sale:{" "}
                              <span className="font-semibold text-blue-600">
                                ৳{item.salePrice.toLocaleString()}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liquid Animation Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div
            className="h-full w-[200%] animate-liquid-flow"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #0073B7 20%, #6366f1 40%, #0073B7 60%, transparent 80%, #0073B7 100%)",
            }}
          />
        </div>
      </nav>

      {/* Smart Notepad Modal */}
      <SmartNotepadModal open={noteOpen} onClose={() => setNoteOpen(false)} />
    </>
  );
}
