"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";
import { usePathname } from "next/navigation";
import { analyticsReports } from "./page";

/**
 * This layout protects every route under /analytics
 * so any employee lacking the Analytics feature is blocked.
 * It also dynamically checks for specific report sub-options based on the path.
 */
export default function AnalyticsLayout({ children }) {
  const pathname = usePathname();

  // Find which specific report route we are currently on
  const exactReport = analyticsReports.find(report => report.link === pathname);

  if (exactReport) {
    return (
      <ProtectedRoute featureName="Analytics" optionName={exactReport.title}>
        {children}
      </ProtectedRoute>
    );
  }

  // Fallback for the root /analytics page or unknown routes
  return <ProtectedRoute featureName="Analytics">{children}</ProtectedRoute>;
}
