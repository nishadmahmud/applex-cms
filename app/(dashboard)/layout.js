"use client";
import "../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppHeader";
import AuthProvider from "../(auth)/authProvider/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "sonner";
import { Providers } from "../Providers";
import AuthSync from "../utils/AuthSync";
import TanstackProvider from "../TanstackProvider";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import PosHeader from "@/components/pos-header/PosHeader";
import FloatingShortcuts from "@/components/FloatingShortcuts";


export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Detect POS (full-screen) routes
  const isBillingPage =
    pathname?.includes("/sale/billing") ||
    pathname?.includes("/purchase/billing") ||
    pathname?.includes("/wholesale/billing") ||
    pathname?.includes("/invoice/edit");
  return (
    <AuthProvider>
      <TanstackProvider>
        <Providers>
          <div className="">
            <SidebarProvider>
              <AuthSync />
              {/* ✅ --- NORMAL LAYOUT (Dashboard, Items, etc.) --- */}
              {!isBillingPage ? (
                <>
                  <AppSidebar />
                  <div className="flex-1 relative">
                    <AppHeader />
                    {children}
                    <FloatingShortcuts />
                    <Toaster

                      style={{ zIndex: 99999 }}
                      richColors
                      position="top-center"
                    />
                  </div>
                </> /* ✅ ───────────────── POS BILLING FULLSCREEN LAYOUT ───────────────── */
              ) : (
                /* ✅ --- POS BILLING FULLSCREEN LAYOUT --- */
                <div className="relative h-screen w-screen  overflow-hidden flex flex-col gap-2">
                  {/* 🟣 POS Header Bar */}
                  <PosHeader onSidebarToggle={() => setSidebarOpen(true)} />

                  {/* 🧾 POS Content (Sale/Purchase Billing UI) */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="h-full overflow-y-auto">{children}</div>
                  </div>

                  {/* Toast inside POS Scope */}
                  <Toaster
                    style={{ zIndex: 99999 }}
                    richColors
                    position="top-center"
                  />

                  {/* 🪟 Overlay background (click to close) */}
                  <div
                    className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${sidebarOpen
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  ></div>

                  {/* 🧩 Sidebar Drawer Slide-in */}
                  <div
                    className={`fixed top-0 left-0 h-full w-[270px] bg-sidebar shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                      }`}
                  >
                    <AppSidebar />
                  </div>
                </div>
              )}
            </SidebarProvider>
          </div>
        </Providers>
      </TanstackProvider>
    </AuthProvider>
  );
}
