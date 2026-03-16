"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  User,
  Mail,
  Trash2,
  ShoppingBag,
  Package,
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
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "./ui/card";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  clearRecentLinks,
  addRecentLink,
  selectRecentLinks,
} from "@/app/store/recentSlice";
import { useRouter, usePathname } from "next/navigation";
import { menuSections } from "@/app/constants/menu-section";
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

export function AppHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const recentLinks = useSelector(selectRecentLinks);

  // Note modal
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

  // Flatten all features for search
  const allFeatures = useMemo(() => {
    const features = [];
    menuSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) =>
            features.push({
              name: child.name,
              link: child.link,
              section: section.title,
            })
          );
        } else if (item.link) {
          features.push({
            name: item.name,
            link: item.link,
            section: section.title,
          });
        }
      });
    });
    return features;
  }, []);

  const filteredFeatures = allFeatures.filter((feature) =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 left-auto z-[40] bg-white border-b border-gray-100 shadow-sm">
        {/* ===== ROW 1: Sidebar trigger + Search + Profile ===== */}
        <div className="flex items-center justify-between px-2 md:px-4 h-14 md:h-14">
          {/* Left: Sidebar trigger + Note */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-6 w-6 text-foreground" />
            <button
              onClick={() => setNoteOpen(true)}
              className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200/60 transition-all text-xs font-bold"
            >
              <NotebookText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Note</span>
            </button>
          </div>

          {/* Center: Feature search */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className="flex items-center w-full max-w-md h-9 px-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200/60 transition-all font-sans group"
                  tabIndex={0}
                >
                  <Search className="h-3.5 w-3.5 text-gray-400 mr-2 group-hover:text-black transition-colors" />
                  <span className="text-gray-400 text-xs font-medium truncate">
                    Search features or pages...
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="center"
                className="w-[calc(100vw-1rem)] md:w-[28rem] p-3 mt-2 rounded-2xl shadow-2xl border border-border bg-card"
              >
                {/* Search Input */}
                <div className="px-2 pb-2 relative">
                  <div className="flex items-center bg-gray-50 rounded-full border px-3 py-2 focus-within:ring-2 focus-within:ring-black/20">
                    <Search className="h-4 w-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Type to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                </div>

                {searchTerm.trim() === "" ? (
                  <>
                    <DropdownMenuLabel className="flex justify-between items-center text-sm font-semibold text-gray-700 mt-1">
                      Recently Visited
                      {recentLinks.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-gray-100"
                          onClick={() => dispatch(clearRecentLinks())}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {recentLinks.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {recentLinks.map((item) => (
                          <DropdownMenuItem
                            key={item.link}
                            asChild
                            className="p-2 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Link
                              href={item.link}
                              className="flex flex-col items-start w-full"
                            >
                              <span className="truncate font-medium text-gray-800">
                                {item.name}
                              </span>
                              <span className="text-xs text-blue-500 font-mono">
                                {item.link}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ) : (
                      <DropdownMenuItem
                        disabled
                        className="text-center justify-center text-gray-400 py-3"
                      >
                        No recent activity
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="text-sm font-semibold text-gray-700 mt-1">
                      Search Results
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-72 overflow-y-auto">
                      {filteredFeatures.length > 0 ? (
                        filteredFeatures.map((feature) => (
                          <DropdownMenuItem
                            key={feature.link}
                            onClick={() => {
                              dispatch(
                                addRecentLink({
                                  name: feature.name,
                                  link: feature.link,
                                })
                              );
                              router.push(feature.link);
                            }}
                            className="p-2 flex flex-col items-start rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <span className="font-medium text-gray-800">
                              {feature.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {feature.section}
                            </span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem
                          disabled
                          className="text-center justify-center text-gray-400 py-3"
                        >
                          No results found
                        </DropdownMenuItem>
                      )}
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Offer + Notifications + Profile */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Offer */}
            <Link
              href="/ecommerce/offers"
              className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200/60 transition-all text-xs font-bold"
            >
              <PercentCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offers</span>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></div>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        session?.isEmployee
                          ? session?.employee?.emp_image ||
                          session?.user?.profile_pic
                          : session?.user?.profile_pic
                      }
                      alt="User"
                    />
                    <AvatarFallback className="bg-black text-white text-xs font-bold">
                      {(session?.user?.owner_name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:block ml-2 leading-none">
                    <p className="text-sm font-bold text-gray-900">
                      {session?.isEmployee
                        ? session?.employee?.name || "Employee"
                        : session?.user?.owner_name || "User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {session?.isEmployee
                        ? session?.employee?.role?.name || "Employee"
                        : "Admin"}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 p-0 mr-2 mt-2 border-none shadow-lg"
                sideOffset={5}
              >
                <div className="max-h-[80vh] overflow-y-auto p-4 space-y-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    User Profile
                  </h1>

                  <Card className="p-4 bg-white border-0 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            session?.user?.profile_pic ||
                            "https://pos.outletexpense.com/layoutlogo.svg"
                          }
                          alt={session?.user?.owner_name || "User"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {session?.user?.owner_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <Mail className="h-4 w-4" />
                          <p className="break-all">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Link
                        href="/settings/invoice-settings"
                        className="flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            My Profile
                          </h4>
                          <p className="text-sm text-gray-600">Account Settings</p>
                        </div>
                      </Link>
                    </Card>

                    <Button
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="w-full bg-transparent border border-blue-300 text-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ===== ROW 2: Quick Nav (Note + Route Pills + Offer + IMEI Search) ===== */}
        <div className="relative h-11 border-t border-gray-100/50 overflow-hidden">
          {/* Wave Background Layer */}
          <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-0">
            <svg
              className="absolute top-0 w-[200%] h-full animate-liquid-flow opacity-60"
              viewBox="0 0 1200 24"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,8 C75,0 150,16 300,8 C450,0 525,16 600,8 C750,0 825,16 900,8 C1050,0 1125,16 1200,8 L1200,24 L0,24 Z"
                fill="#f3f4f6"
              />
              <path
                d="M0,8 C75,0 150,16 300,8 C450,0 525,16 600,8 C750,0 825,16 900,8 C1050,0 1125,16 1200,8"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 flex items-center gap-1.5 px-2 md:px-4 h-full overflow-x-auto scrollbar-none">
            {/* Quick Route Pills */}
            {QUICK_ROUTES.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`shrink-0 flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold transition-all duration-200 border ${isActive
                    ? "bg-black text-white border-black"
                    : "bg-transparent text-gray-600 border-gray-200/40 hover:bg-black/5 hover:text-black"
                    }`}
                >
                  <route.icon className="w-3 h-3" strokeWidth={2.5} />
                  <span>{route.label}</span>
                </Link>
              );
            })}

          {/* Spacer pushes IMEI to right */}
          <div className="flex-1" />

            {/* IMEI Search */}
            <div ref={imeiBoxRef} className="relative shrink-0">
              <div className="flex items-center bg-transparent border border-gray-200/40 rounded-md h-7 w-40 md:w-52 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all">
                <Search className="w-3 h-3 text-gray-400 ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder="IMEI Search..."
                  value={imeiQuery}
                  onChange={handleImeiSearch}
                  onFocus={() => { if (imeiQuery.trim()) setImeiOpen(true); }}
                  className="flex-1 bg-transparent text-[11px] font-medium outline-none px-2 text-gray-800 placeholder:text-gray-400"
                />
                {imeiQuery && (
                  <button onClick={clearImei} className="pr-2">
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

            {/* IMEI Dropdown */}
            {imeiOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {imeiLoading ? (
                    <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                    </div>
                  ) : imeiResults.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      {imeiQuery.trim() ? "No IMEI records found" : "Type to search IMEI..."}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {imeiResults.map((item, idx) => (
                        <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate flex-1">{item.name}</p>
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.inStock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              {item.inStock > 0 ? `In Stock: ${item.inStock}` : "Sold"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Vendor: <span className="font-medium text-gray-700">{item.vendorName}</span>
                          </p>
                          <div className="flex justify-between mt-1.5 text-[11px]">
                            <span className="text-gray-500">
                              Purchase: <span className="font-semibold text-emerald-600">৳{item.purchasePrice.toLocaleString()}</span>
                            </span>
                            <span className="text-gray-500">
                              Sale: <span className="font-semibold text-blue-600">৳{item.salePrice.toLocaleString()}</span>
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

        </div>
      </header>

      {/* Smart Notepad Modal */}
      <SmartNotepadModal open={noteOpen} onClose={() => setNoteOpen(false)} />
    </>
  );
}
