"use client";

import React, { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import dynamic from "next/dynamic";
import CustomPagination from "@/app/utils/CustomPagination";
import SettingsSkeleton from "../../SettingsSkeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { setToken } from "@/app/store/authSlice";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import {
  useGetAuthorsQuery,
  useDeleteAuthorMutation,
} from "@/app/store/api/authorsApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

const SettingsTemplate = dynamic(
  () => import("@/app/(dashboard)/settings/SettingsTemplate"),
  {
    suspense: true,
  },
);

const AuthorsPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessAuthors =
    !isEmployee || canAccess(features, "Settings", "Authors");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessAuthors;

  const {
    data: authors,
    isLoading,
  } = useGetAuthorsQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });

  const authorsData = authors?.data || authors;
  const total = Array.isArray(authorsData) ? authorsData.length : 0;

  // Author row actions (edit/delete)
  const AuthorActions = ({ id }) => {
    const [deleteAuthor] = useDeleteAuthorMutation();

    const handleDelete = async () => {
      try {
        toast.loading("Deleting author...");
        await deleteAuthor(id).unwrap();
        toast.dismiss();
        toast.success("Author deleted successfully");
      } catch (error) {
        console.error(error);
        toast.dismiss();
        toast.error("Failed to delete author");
      }
    };

    return (
      <div className="flex space-x-2 justify-end">
        <Link href={`/settings/authors/edit/${id}`}>
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Edit
          </Button>
        </Link>
        <Button
          onClick={handleDelete}
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    );
  };

  // Authors table columns
  const authorColumns = [
    {
      header: "Sl.",
      key: "sl",
      width: "w-1/12",
      render: (_item, index) => <span>{index + 1}</span>,
    },
    {
      header: "Photo",
      key: "image",
      width: "w-2/12",
      render: (item) =>
        item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
    {
      header: "Name",
      key: "name",
      width: "w-3/12",
    },
    {
      header: "Education",
      key: "education",
      width: "w-3/12",
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.education || "N/A"}
        </span>
      ),
    },
    {
      header: "Active",
      key: "active",
      width: "w-1/12",
      render: (item) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
            Number(item.active) === 1
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {Number(item.active) === 1 ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Authors"}>
      <div className="pb-5">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTemplate
            isLoading={isLoading}
            data={authorsData}
            session={session}
            formHref={"/settings/authors/add"}
            columns={authorColumns}
            type="authors"
            headerTitle="Authors"
            showProductListButton={false}
            showProfileSection={false}
            customActions={(item) => <AuthorActions id={item.id} />}
          />
        </Suspense>
        {/* Simple count footer; authors API does not paginate in this UI */}
        <CustomPagination
          totalPage={1}
          currentPage={1}
          setCurrentPage={() => {}}
        />
      </div>
    </ProtectedRoute>
  );
};

export default AuthorsPage;

