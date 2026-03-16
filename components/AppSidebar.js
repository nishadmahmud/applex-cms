"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addRecentLink } from "@/app/store/recentSlice";
import { menuSections } from "@/app/constants/menu-section";
import { ChevronRight } from "lucide-react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

// Skeleton only for the menu area (not header)
function MenuSkeleton() {
  return (
    <div className="animate-pulse space-y-4 mt-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-3 w-3/4 bg-sidebar-accent/50 rounded-full"></div>
      ))}
    </div>
  );
}

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const isEmployee = !!session?.isEmployee;

  // Always call hooks → keeps order consistent
  const { data: features, isLoading } = useRolePermissions();

  const handleLinkClick = (name, link) => {
    dispatch(addRecentLink({ name, link }));
  };

  // Build visible menu dynamically
  const visibleMenuSections = useMemo(() => {
    // Always show these menu names regardless of role permissions
    const alwaysVisible = [];

    if (!isEmployee) return menuSections;
    if (!features) return [];

    return menuSections
      .map((section) => {
        const visibleItems = section.items
          .map((item) => {
            // ✅ 1. Skip filtering if in alwaysVisible list
            if (alwaysVisible.includes(item.name)) {
              return item;
            }

            // ✅ 2. Filter children if any
            if (item.children && item.children.length > 0) {
              const visibleChildren = item.children.filter((child) =>
                child.name === "Additional Infos" &&
                  item.name === "Settings"
                  ? canAccess(features, "Products", "Add Product") ||
                  canAccess(features, "Settings", "Additional Infos")
                  : canAccess(features, item.name, child.name)
              );
              if (visibleChildren.length > 0) {
                return { ...item, children: visibleChildren };
              }
              return null;
            }

            // ✅ 3. Normal permission‑based check
            const allowed = canAccess(features, item.name);
            return allowed ? item : null;
          })
          .filter(Boolean);

        // ✅ Only show section if it still has visible items
        return visibleItems.length > 0
          ? { ...section, items: visibleItems }
          : null;
      })
      .filter(Boolean);
  }, [features, isEmployee]);

  const showMenuSkeleton =
    status === "loading" || (isEmployee && (isLoading || !features));

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* === HEADER (never hidden) === */}
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white flex items-center justify-center p-1">
            <Image
              src={
                session?.user?.invoice_settings?.shop_logo ||
                session?.user?.profile_pic ||
                "https://pos.outletexpense.com/layoutlogo.svg"
              }
              alt="shop-logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="text-center group-data-[collapsible=icon]:hidden">
            <div className="font-bold text-[13px] text-gray-900 tracking-tight leading-tight uppercase">
              {session?.user?.outlet_name || "Outlet"}
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* === CONTENT === */}
      <SidebarContent className="bg-sidebar text-sidebar-foreground font-sans">
        {showMenuSkeleton ? (
          <div className="px-4 py-4">
            <MenuSkeleton />
          </div>
        ) : (
          visibleMenuSections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-4 px-2">
                {section.title}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) =>
                    item.children ? (
                      <Collapsible
                        key={item.name}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.name}
                              className="w-full data-[state=open]:bg-black data-[state=open]:text-white text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200"
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="text-[15px] font-semibold">
                                {item.name}
                              </span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.name}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === child.link}
                                    className="transition-all duration-200"
                                  >
                                    <Link
                                      href={child.link}
                                      prefetch={false}
                                      onClick={() =>
                                        handleLinkClick(child.name, child.link)
                                      }
                                    >
                                      <child.icon className="h-4 w-4" />
                                      <span className="text-[15px] font-medium">
                                        {child.name}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.link}
                          tooltip={item.name}
                           className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                        >
                          <Link
                            href={item.link}
                            prefetch={false}
                            onClick={() =>
                              handleLinkClick(item.name, item.link)
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="text-[15px] font-semibold">
                              {item.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
