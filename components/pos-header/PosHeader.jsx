"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Calculator,
  NotebookText,
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Menu,
  Maximize,
  Users2,
  ShoppingCart,
} from "lucide-react";
import PosCalculatorModal from "./PosCalculatorModal";
import PosNotepadModal from "./PosNotepadModal";

export default function PosHeader({ onSidebarToggle }) {
  const router = useRouter();
  const [calcOpen, setCalcOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [customerWin, setCustomerWin] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key.toLowerCase() === "c") setCalcOpen(true);
      if (e.altKey && e.key.toLowerCase() === "n") setNoteOpen(true);
      if (e.altKey && e.key.toLowerCase() === "m") onSidebarToggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Fullscreen toggle
  const handleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // Customer panel (new tab)

  const openCustomerPanel = () => {
    const newWin = window.open(
      "/customer-panel",
      "_blank",
      "width=720,height=640"
    );
    setCustomerWin(newWin);
    window.customerDisplayRef = newWin; // allow global access
  };
  return (
    <div className="container mx-auto flex items-center justify-between bg-white border-b px-3 py-0.5 shadow-sm z-40  h-9 min-h-[36px]">
      <div className="flex items-center space-x-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sale Billing */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/sale/billing">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Sale Billing</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Purchase Billing */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/purchase/billing">
                <Button variant="ghost" size="icon">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Purchase Billing</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/invoice/all-sell-invoice">
                <Button variant="ghost" size="icon">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Sale Invoices</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/purchase/all-purchase-invoices">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Purchase Invoices</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCalcOpen(true)}
              >
                <Calculator className="h-5 w-5 text-indigo-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calculator (Alt+C)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNoteOpen(true)}
              >
                <NotebookText className="h-5 w-5 text-orange-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notepad (Alt+N)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={openCustomerPanel}>
                <Users2 className="h-5 w-5 text-teal-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Customer Panel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleFullScreen}>
                <Maximize className="h-5 w-5 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Fullscreen</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
                <Menu className="h-5 w-5 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Sidebar (Alt+M)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Popups */}
      <PosCalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <PosNotepadModal open={noteOpen} onClose={() => setNoteOpen(false)} />
    </div>
  );
}
