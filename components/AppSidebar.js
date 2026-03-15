// "use client";
// import React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import { useDispatch } from "react-redux";
// import { addRecentLink } from "@/app/store/recentSlice";
// import { menuSections } from "@/app/constants/menu-section";
// import { ChevronRight } from "lucide-react";

// export function AppSidebar({ ...props }) {
//   const pathname = usePathname();
//   const { data: session } = useSession();
//   const dispatch = useDispatch();

//   const handleLinkClick = (name, link) => {
//     dispatch(addRecentLink({ name, link }));
//   };

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader className="bg-white">
//         <div className="flex flex-col items-center py-4">
//           <Image
//             src={
//               session?.user?.invoice_settings?.shop_logo ||
//               "https://pos.outletexpense.com/layoutlogo.svg"
//             }
//             alt="shop-logo"
//             width={50}
//             height={50}
//           />
//           <div className="text-center group-data-[collapsible=icon]:hidden mt-3">
//             <div className="font-semibold text-sm text-gray-900">
//               {session?.user?.outlet_name}
//             </div>
//           </div>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         {menuSections.map((section, sectionIndex) => (
//           <SidebarGroup key={section.title}>
//             <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//               {section.title}
//             </SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {section.items.map((item) => {
//                   if (item.children) {
//                     return (
//                       <Collapsible
//                         key={item.name}
//                         className="group/collapsible"
//                       >
//                         <SidebarMenuItem>
//                           <CollapsibleTrigger asChild>
//                             <SidebarMenuButton
//                               tooltip={item.name}
//                               className="w-full  data-[state=open]:bg-blue-500 data-[state=open]:text-white text-gray-400 hover:text-white"
//                             >
//                               <item.icon className="h-4 w-4 " />
//                               <span className="text-[15px] font-bold ">
//                                 {item.name}
//                               </span>
//                               <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
//                             </SidebarMenuButton>
//                           </CollapsibleTrigger>
//                           <CollapsibleContent>
//                             <SidebarMenuSub>
//                               {item.children.map((child) => (
//                                 <SidebarMenuSubItem key={child.name}>
//                                   <SidebarMenuSubButton
//                                     asChild
//                                     isActive={pathname === child.link}
//                                   >
//                                     <Link
//                                       href={child.link}
//                                       prefetch={false}
//                                       onClick={() =>
//                                         handleLinkClick(child.name, child.link)
//                                       }
//                                     >
//                                       <child.icon className="h-4 w-4 " />
//                                       <span className="text-[15px] font-bold ">
//                                         {child.name}
//                                       </span>
//                                     </Link>
//                                   </SidebarMenuSubButton>
//                                 </SidebarMenuSubItem>
//                               ))}
//                             </SidebarMenuSub>
//                           </CollapsibleContent>
//                         </SidebarMenuItem>
//                       </Collapsible>
//                     );
//                   } else {
//                     return (
//                       <SidebarMenuItem key={item.name}>
//                         <SidebarMenuButton
//                           asChild
//                           isActive={pathname === item.link}
//                           tooltip={item.name}
//                           className={
//                             pathname === item.link
//                               ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
//                               : "text-gray-400"
//                           }
//                         >
//                           <Link
//                             href={item.link}
//                             prefetch={false}
//                             onClick={() =>
//                               handleLinkClick(item.name, item.link)
//                             }
//                           >
//                             <item.icon className="h-4 w-4 " />
//                             <span className="text-[15px] font-bold ">
//                               {item.name}
//                             </span>
//                           </Link>
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     );
//                   }
//                 })}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>
//       <SidebarRail />
//     </Sidebar>
//   );
// }

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
        <div key={i} className="h-3 w-3/4 bg-gray-300 rounded"></div>
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
      <SidebarHeader className="bg-sidebar">
        <div className="flex flex-col items-center py-4">
          <Image
            src={
              session?.user?.invoice_settings?.shop_logo ||
              session?.user?.profile_pic ||
              "https://pos.outletexpense.com/layoutlogo.svg"
            }
            alt="shop-logo"
            width={50}
            height={50}
          />
          <div className="text-center group-data-[collapsible=icon]:hidden mt-3">
            <div className="font-semibold text-sm text-foreground">
              {session?.user?.outlet_name || "Outlet"}
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* === CONTENT === */}
      <SidebarContent className="bg-sidebar text-foreground">
        {showMenuSkeleton ? (
          <div className="px-4 py-4">
            <MenuSkeleton />
          </div>
        ) : (
          visibleMenuSections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
                              className="w-full data-[state=open]:bg-primary data-[state=open]:text-primary-foreground text-foreground hover:bg-secondary hover:text-primary transition-colors"
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
                          className={
                            pathname === item.link
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                              : "text-foreground hover:bg-secondary hover:text-primary"
                          }
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
    