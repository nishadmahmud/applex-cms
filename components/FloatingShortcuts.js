"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Undo2,
  PackageMinus,
  PackagePlus,
  Receipt,
  Store,
  Users,
  Landmark,
  BookOpen,
  Smartphone,
  Wallet,
  FileStack,
  FileText,
  X,
  Search,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLazySearchProductQuery } from "@/app/store/api/productsApi";
import { useLazyGetImeiSerialStockReportQuery } from "@/app/store/api/imeiSerialReportApi";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import QuickPaymentModal from "@/components/QuickPaymentModal";

const SHORTCUTS = [
  { label: "Sale Return", href: "/sale/return", icon: Undo2, color: "from-orange-500 to-orange-600" },
  { label: "Purchase Return", href: "/purchase/return", icon: PackageMinus, color: "from-red-500 to-red-600" },
  { label: "Add Product", href: "/add-products", icon: PackagePlus, color: "from-violet-500 to-violet-600" },
  { label: "Expense", href: "/expense/list", icon: Receipt, color: "from-pink-500 to-pink-600" },
  { label: "Vendor Payment", action: "quickpay-vendor", icon: Store, color: "from-emerald-500 to-emerald-600" },
  { label: "Customer Payment", action: "quickpay-customer", icon: Users, color: "from-indigo-500 to-indigo-600" },
  { label: "Balance", href: "finance/fund-transfer", icon: Landmark, color: "from-cyan-500 to-cyan-600" },
  { label: "Ledger Statement", href: "/analytics/ledger-statement-report", icon: BookOpen, color: "from-lime-600 to-lime-700" },
  { label: "Imei Report", href: "/analytics/imei-serial-report", icon: Smartphone, color: "from-teal-500 to-teal-600" },
  { label: "Cashbook", href: "/analytics/cash-book-details-history", icon: Wallet, color: "from-blue-500 to-blue-600" },
  { label: "Sale Invoice", href: "/invoice/all-sell-invoice", icon: FileStack, color: "from-slate-500 to-slate-600" },
  { label: "Purchase Invoice", href: "/purchase/all-purchase-invoices", icon: FileText, color: "from-amber-500 to-amber-600" },
];

export default function FloatingShortcuts() {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("shortcuts"); // "shortcuts" | "product" | "imei"
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [quickPayMode, setQuickPayMode] = useState("customer");
  const panelRef = useRef(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [imeiResults, setImeiResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // API hooks
  const [searchProduct] = useLazySearchProductQuery();
  const [searchImei] = useLazyGetImeiSerialStockReportQuery();
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        resetSearch();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        resetSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const resetSearch = () => {
    setSearchTerm("");
    setProductResults([]);
    setImeiResults([]);
    setActiveTab("shortcuts");
  };

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (keyword.trim() === "") {
      setProductResults([]);
      setImeiResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        if (activeTab === "product") {
          const res = await searchProduct({ keyword }).unwrap();
          setProductResults(res?.data?.data || []);
        } else if (activeTab === "imei") {
          const res = await searchImei({ imei: keyword }).unwrap();
          // Flatten the grouped response
          const apiDataObj = res?.data || {};
          const flatRows = [];
          Object.keys(apiDataObj).forEach(group => {
            (apiDataObj[group] || []).forEach(item => {
              flatRows.push({
                name: item?.product_name || group,
                purchaseInvoice: item?.purchase_invoice || "N/A",
                saleInvoice: item?.sale_invoice || "N/A",
                purchasePrice: Number(item?.purchase_price ?? 0),
                salePrice: Number(item?.sale_price ?? 0),
                vendorName: item?.vendor_name || "N/A",
                inStock: Number(item?.in_stock ?? 0)
              });
            });
          });

          // Sort items: items in stock first, then out of stock
          flatRows.sort((a, b) => b.inStock - a.inStock);

          setImeiResults(flatRows);
        }
      } catch (error) {
        console.error("Search failed", error);
        setProductResults([]);
        setImeiResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  // Tab switch handler
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setProductResults([]);
    setImeiResults([]);
  };

  // Check permissions before rendering
  if (status === "loading" || (isEmployee && permLoading) || (isEmployee && !features)) {
    return null;
  }

  if (isEmployee && !canAccess(features, "Dashboard", "Floating Shortcuts")) {
    return null;
  }

  return (
    <div ref={panelRef} className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {/* Panel — opens to the left of the button */}
      <div
        className={`absolute right-16 transition-all duration-200 ease-out origin-right flex ${open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
          }`}
      >
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 transition-all duration-300 ${activeTab === 'shortcuts' ? 'w-[340px]' : 'w-[450px]'}`}>
          {/* Header & Tabs */}
          <div className="flex flex-col mb-3 gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-gray-800">Quick Menu</h3>
              <button
                onClick={() => { setOpen(false); resetSearch(); }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleTabSwitch("shortcuts")}
                className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${activeTab === 'shortcuts' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Shortcuts
              </button>
              <button
                onClick={() => handleTabSwitch("product")}
                className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${activeTab === 'product' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Product Search
              </button>
              <button
                onClick={() => handleTabSwitch("imei")}
                className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${activeTab === 'imei' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                IMEI Search
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[250px] max-h-[400px] overflow-y-auto custom-scrollbar px-1">
            {activeTab === "shortcuts" && (
              <div className="grid grid-cols-3 gap-2">
                {SHORTCUTS.map((item) => {
                  // Items with `action` open the quick payment modal
                  if (item.action) {
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setQuickPayMode(item.action === "quickpay-vendor" ? "vendor" : "customer");
                          setQuickPayOpen(true);
                          setOpen(false);
                          resetSearch();
                        }}
                        className="group flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-all duration-150 active:scale-95"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-150`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight group-hover:text-gray-900 transition-colors">
                          {item.label}
                        </span>
                      </button>
                    );
                  }
                  // Normal link shortcuts
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => { setOpen(false); resetSearch(); }}
                      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-all duration-150 active:scale-95"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-150`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-600 text-center leading-tight group-hover:text-gray-900 transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {(activeTab === "product" || activeTab === "imei") && (
              <div className="flex flex-col h-full gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={activeTab === "product" ? "Search product name or barcode..." : "Search IMEI..."}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto rounded-md border border-gray-100 bg-gray-50/50">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                  ) : searchTerm.trim() === "" ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">Type to start searching</p>
                    </div>
                  ) : activeTab === "product" && productResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No products found</div>
                  ) : activeTab === "imei" && imeiResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No IMEI records found</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {activeTab === "product" && productResults.map((product, idx) => (
                        <div key={product.id || idx} className="p-3 hover:bg-white transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex gap-2 min-w-0">
                              <span className="text-xs font-semibold text-gray-400 mt-0.5 w-4 shrink-0">{idx + 1}.</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                  Vendor: N/A
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                                Stock: {product.current_stock ?? "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeTab === "imei" && imeiResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="block p-3 hover:bg-white transition-colors"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-medium text-gray-800 break-words flex-1">{item.name}</p>
                              <div className="shrink-0 text-right">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.inStock > 0
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-red-50 text-red-700"
                                  }`}>
                                  {item.inStock > 0 ? `Stock: ${item.inStock}` : "Already Sold"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <p className="text-[11px] text-gray-500">
                                Vendor: <span className="font-medium text-gray-700">{item.vendorName}</span>
                              </p>
                            </div>
                            <div className="flex justify-between items-center w-full mt-1">
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                P. Inv: {item.purchaseInvoice !== "N/A" ? (
                                  <Link
                                    href={`/invoice/${item.purchaseInvoice}`}
                                    onClick={() => { setOpen(false); resetSearch(); }}
                                    className="font-medium text-blue-600 hover:underline hover:text-blue-800"
                                  >
                                    {item.purchaseInvoice}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-gray-700">N/A</span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                S. Inv: {item.saleInvoice !== "N/A" ? (
                                  <Link
                                    href={`/invoice/${item.saleInvoice}`}
                                    onClick={() => { setOpen(false); resetSearch(); }}
                                    className="font-medium text-blue-600 hover:underline hover:text-blue-800"
                                  >
                                    {item.saleInvoice}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-gray-700">N/A</span>
                                )}
                              </p>
                            </div>
                            <div className="flex justify-between items-center w-full mt-1">
                              <p className="text-[11px] font-medium text-gray-600">
                                Purchase: <span className="text-emerald-600">৳ {item.purchasePrice.toLocaleString()}</span>
                              </p>
                              <p className="text-[11px] font-medium text-gray-600">
                                Sale: <span className="text-blue-600">৳ {item.salePrice.toLocaleString()}</span>
                              </p>
                            </div>
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
      </div>

      {/* Floating trigger button — right edge, vertically centered */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-l-xl flex items-center justify-center shadow-lg transition-all duration-200 ${open
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }`}
        title="Quick Menu"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <LayoutGrid className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Quick Payment Modal */}
      <QuickPaymentModal
        open={quickPayOpen}
        onClose={() => setQuickPayOpen(false)}
        initialMode={quickPayMode}
      />
    </div>
  );
}
