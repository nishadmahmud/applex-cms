"use client";

import React, { useState, useMemo } from "react";
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
import { useRouter } from "next/navigation";
import { menuSections } from "@/app/constants/menu-section";

export function AppHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const recentLinks = useSelector(selectRecentLinks);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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

  // Custom Search Input Trigger UI
  const SearchInputTrigger = React.forwardRef((props, ref) => (
    <div
      ref={ref}
      {...props}
      className="flex items-center w-full max-w-xl h-11 px-4 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 border border-transparent hover:border-blue-300 transition-all"
      tabIndex={0}
    >
      <Search className="h-4 w-4 text-gray-500 mr-2" />
      <span className="text-gray-500 text-sm font-medium truncate">
        Search features or pages ....
      </span>
    </div>
  ));
  SearchInputTrigger.displayName = "SearchInputTrigger";

  return (
    <header className="sticky top-0 left-auto z-[40] flex flex-wrap md:flex-nowrap items-center justify-between bg-card px-2 md:px-4 shadow-md border-b border-border">
      {/* TOP ROW: sidebar trigger + quick nav + notifications + profile */}
      <div className="flex items-center gap-2 md:gap-4 h-14 md:h-16 order-1">
        <SidebarTrigger className="h-6 w-6 text-foreground" />
      </div>

      {/* SEARCH — full-width 2nd row on mobile, centered middle on desktop */}
      <div className="flex w-full md:w-auto md:flex-1 justify-center px-0 md:px-4 pb-2 md:pb-0 order-3 md:order-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="flex items-center w-full max-w-xl h-11 px-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200/80 border border-border/80 hover:border-primary/40 transition-all font-sans group"
              tabIndex={0}
            >
              <Search className="h-4 w-4 text-muted-foreground mr-2 group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground text-sm font-medium truncate">
                Search features or pages ....
              </span>
            </div>
          </DropdownMenuTrigger>

              <DropdownMenuContent
                align="center"
                className="w-[calc(100vw-1rem)] md:w-[28rem] p-3 mt-2 rounded-2xl shadow-2xl border border-border bg-card"
              >
            {/* Search Input */}
            <div className="px-2 pb-2 relative">
              <div className="flex items-center bg-gray-50 rounded-full border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
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

            {/* Conditional Display */}
            {searchTerm.trim() === "" ? (
              <>
                {/* Recently Visited */}
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
                {/* Search Results */}
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

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-1 md:gap-2 h-14 md:h-16 order-2 md:order-3">
        {/* Quick Navigation Buttons */}
        <div className="flex items-center gap-1 md:gap-2 border-r pr-2 md:pr-3">
          <Button
            onClick={() => router.push("/sale/billing")}
            className="h-8 md:h-9 px-2.5 md:px-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 md:gap-2"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.3} />
            <span className="hidden md:inline">POS</span>
          </Button>

          <Button
            onClick={() => router.push("/purchase/billing")}
            className="h-8 md:h-9 px-2.5 md:px-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 md:gap-2"
          >
            <Package className="h-4 w-4" strokeWidth={2.3} />
            <span className="hidden md:inline">Purchase</span>
          </Button>
        </div>
        {/* Language Selector */}
        {/* <div className="flex items-center text-sm font-semibold border-r pr-3 mr-1 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
          <span className="text-lg mr-1">🇬🇧</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </div> */}

        {/* Dark Mode Toggle */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button> */}

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
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  MN
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
    </header>
  );
}
