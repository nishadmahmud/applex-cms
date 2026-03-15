"use client";
import React, { useState } from "react";
import { useRoleList } from "@/apiHooks/hooks/useRoleQueries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, Pencil, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RoleListPage() {
  const { data: roles = [], isLoading, isError } = useRoleList();
  const [search, setSearch] = useState("");

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute featureName={"HRM"} optionName={"Role List"}>
      <div className="container mx-auto py-6 space-y-6">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Role Management
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  className="pl-8 w-60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Link href="/hrm/roles/add">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Role
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : isError ? (
              <p className="text-center py-10 text-red-500">
                Failed to load roles
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No roles found</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-violet-50 border-b text-left text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Role Name</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-center">Features</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((role, idx) => (
                      <RoleRow key={role.id} index={idx} role={role} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

function RoleRow({ role, index }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <>
      <tr
        className={cn(
          "border-b hover:bg-violet-50 transition",
          expanded && "bg-violet-50"
        )}
      >
        <td className="px-4 py-2 align-top">{index + 1}</td>
        <td className="px-4 py-2 align-top font-semibold text-gray-800">
          {role.name}
        </td>
        <td className="px-4 py-2 align-top text-gray-600">
          {role.description || "---"}
        </td>
        <td className="px-4 py-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-violet-600"
          >
            {expanded ? "Hide" : "View"} ({role.features.length})
            <ChevronDown
              className={cn(
                "ml-1 h-4 w-4 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </Button>
        </td>
        <td className="px-4 py-2 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-violet-600 border-violet-200 hover:bg-violet-50"
            onClick={() => router.push(`/hrm/roles/edit/${role.id}`)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t bg-white">
          <td colSpan={5} className="px-6 py-4">
            <FeatureGrid features={role.features} />
          </td>
        </tr>
      )}
    </>
  );
}

function FeatureGrid({ features }) {
  if (!features.length)
    return (
      <p className="text-sm text-gray-500 italic ml-2">
        No feature access defined.
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {features.map((f) => (
        <div
          key={f.id}
          className="border rounded-lg shadow-sm p-3 bg-gray-50 hover:shadow-md transition-all"
        >
          <div className="flex justify-between mb-2">
            <span className="font-medium text-gray-800 text-sm">{f.name}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                f.status
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {f.status ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {f.feature_options.map((opt) => (
              <span
                key={opt.id}
                className={cn(
                  "px-2 py-0.5 rounded border",
                  opt.status
                    ? "bg-violet-100 border-violet-300 text-violet-700"
                    : "bg-gray-100 border-gray-200 text-gray-500"
                )}
              >
                {opt.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
