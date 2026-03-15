"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  useSalesTargetReport,
  useCreateSalesTarget,
  useUpdateSalesTarget,
  useDeleteSalesTarget,
} from "@/apiHooks/hooks/useSalesTargets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit3, Trash2, Eye, XCircle } from "lucide-react";
import Select from "react-select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import CustomPagination from "@/app/utils/CustomPagination";
import dayjs from "dayjs";
import TargetModal from "./components/TargetModal";
import ProgressBar from "./components/ProgressBar";
import ViewTargetDetails from "./components/ViewTargetDetails";
import useProductList from "@/customHooks/useProductList";
import useProductSearchFilter from "@/customHooks/useProductSearchFilter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ---------- helper for human-readable month ---------- */
const monthLabel = (iso) => {
  if (!iso) return "—";
  return dayjs(`${iso}-01`).format("MMMM YYYY");
};

export default function SalesTargetPage() {
  const [filters, setFilters] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    product_id: "",
    page: 1,
    per_page: 5,
  });

  // --- Search management ---
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  // --- Product APIs: default vs search ---
  const { products: productsList, isLoading: isProductsLoading } =
    useProductList(1, 50);
  const { searchProducts, searchResults, isSearching, clearSearch } =
    useProductSearchFilter();

  const [displayedProducts, setDisplayedProducts] = useState([]);

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        await searchProducts({
          keyword: searchQuery.trim(),
          categoryId: false,
          subCategoryId: false,
          unitId: false,
          brandId: false,
          product_type: "",
          stockIn: false,
          stockOut: false,
          variants: false,
          normal: false,
        });
      } else {
        clearSearch();
      }
    }, 700);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, searchProducts, clearSearch]);

  // Merge logic to decide which products to show
  useEffect(() => {
    if (isSearching) return; // prevent flicker
    if (searchQuery.trim().length > 0 && searchResults?.data?.data?.length) {
      setDisplayedProducts(searchResults.data.data);
    } else if (
      searchQuery.trim().length > 0 &&
      !isSearching &&
      !searchResults?.data?.data?.length
    ) {
      setDisplayedProducts([]); // no match
    } else {
      setDisplayedProducts(productsList?.data?.data || []);
    }
  }, [searchQuery, searchResults, productsList, isSearching]);

  // --- Reset search handler ---
  const handleResetSearch = () => {
    setSearchQuery("");
    clearSearch();
    setDisplayedProducts(productsList?.data?.data || []);
    handleFilterChange("product_id", "");
  };

  // --- Targets management ---
  const { data, isLoading, isFetching } = useSalesTargetReport(filters);
  const createTarget = useCreateSalesTarget();
  const updateTarget = useUpdateSalesTarget();
  const deleteTarget = useDeleteSalesTarget();

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (form) => {
    const payload = {
      ...form,
      target_quantity: Number(form.target_quantity),
      target_amount: Number(form.target_amount),
    };
    if (editData) {
      updateTarget.mutate(
        { id: editData.id, data: payload },
        { onSuccess: () => setShowModal(false) }
      );
    } else {
      createTarget.mutate(payload, { onSuccess: () => setShowModal(false) });
    }
  };

  const handleDelete = (id) => deleteTarget.mutate(id);
  const handleFilterChange = (f, v) => setFilters((p) => ({ ...p, [f]: v }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="shadow-lg border-2 border-border/60 rounded-xl overflow-hidden">
        {/* --- HEADER --- */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-background via-muted/50 to-background">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Sales Target Report
          </CardTitle>

          <div className="flex flex-wrap items-center gap-3">
            {/* filter date */}
            <Input
              type="month"
              value={dayjs(filters.date).format("YYYY-MM")}
              onChange={(e) =>
                handleFilterChange(
                  "date",
                  dayjs(e.target.value, "YYYY-MM")
                    .startOf("month")
                    .format("YYYY-MM-DD")
                )
              }
              className="h-10 w-44 font-medium"
            />

            {/* filter product */}
            <div className="min-w-[220px] flex items-center gap-2">
              <div className="flex-1">
                <Select
                  placeholder={
                    isProductsLoading || isSearching
                      ? "Loading products..."
                      : "Filter by product"
                  }
                  options={
                    displayedProducts?.map((p) => ({
                      label: p.name,
                      value: p.id,
                    })) ?? []
                  }
                  onInputChange={(v) => setSearchQuery(v)}
                  onChange={(opt) =>
                    handleFilterChange("product_id", opt?.value ?? "")
                  }
                  value={
                    filters.product_id
                      ? {
                          label:
                            displayedProducts.find(
                              (p) => p.id === filters.product_id
                            )?.name ?? "Selected",
                          value: filters.product_id,
                        }
                      : null
                  }
                  isSearchable
                  isLoading={isProductsLoading || isSearching}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              {/* clear/reset button */}
              {(searchQuery || filters.product_id) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-600 p-2"
                  onClick={handleResetSearch}
                  title="Clear search"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Add button - colorful gradient */}
            <Button
              onClick={() => setShowModal(true)}
              className="gap-1 bg-gradient-to-r from-primary to-green-500 text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Target
            </Button>
          </div>
        </CardHeader>

        <Separator />

        {/* --- TABLE CONTENT --- */}
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                Loading targets...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm table-fixed">
                  <thead className="bg-muted/40 sticky top-0 z-10">
                    <tr className="text-left font-medium text-muted-foreground">
                      <th className="p-2 w-[180px]">Product</th>
                      <th className="p-2 w-[100px] text-center">Month</th>
                      <th className="p-2 w-[100px] text-right">
                        Target Qty / Achieved Qty
                      </th>
                      <th className="p-2 w-[130px] text-right">
                        Target Amount / Achieved Amount
                      </th>
                      <th className="p-2 w-[80px] text-center">Ach Qty %</th>
                      <th className="p-2 w-[80px] text-center">Ach Amt %</th>
                      <th className="p-2 text-center w-36">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.data?.length ? (
                      data.data.map((item, idx) => {
                        const ach = item.achieved_amount_percentage ?? 0;
                        const zero = ach === 0;
                        return (
                          <tr
                            key={idx}
                            className="border-t hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-2 font-medium flex items-center gap-2">
                              {item.product_info?.image_path && (
                                <img
                                  src={item.product_info.image_path}
                                  alt={item.product_info.name}
                                  className="w-8 h-8 rounded object-cover border"
                                />
                              )}
                              {item.product_info?.name ?? "—"}
                            </td>

                            <td className="p-2 font-medium text-center">
                              {monthLabel(item.target_month)}
                            </td>

                            {/* Target Qty / Achieved Qty */}
                            <td className="p-2 text-right">
                              {item.target_quantity ?? 0}{" "}
                              <span className="text-muted-foreground">/</span>{" "}
                              {item.achieved_quantity ?? 0}
                            </td>

                            {/* Target Amount / Achieved Amount */}
                            <td className="p-2 text-right">
                              {item.target_amount ?? 0}{" "}
                              <span className="text-muted-foreground">/</span>{" "}
                              {item.achieved_amount?.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              }) ?? 0}
                            </td>

                            {/* --- Achieved Quantity % (Circular) --- */}
                            <td className="p-2 text-center">
                              <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg
                                  className="rotate-[-90deg]"
                                  width="40"
                                  height="40"
                                >
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke={
                                      item.achieved_quantity_percentage < 50
                                        ? "#f97316" // orange
                                        : item.achieved_quantity_percentage < 90
                                        ? "#facc15" // yellow
                                        : "#10b981" // green
                                    }
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 17}
                                    strokeDashoffset={
                                      2 *
                                      Math.PI *
                                      17 *
                                      (1 -
                                        Math.min(
                                          item.achieved_quantity_percentage ??
                                            0,
                                          100
                                        ) /
                                          100)
                                    }
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-[10px] font-semibold text-gray-700">
                                  {Math.min(
                                    item.achieved_quantity_percentage ?? 0,
                                    999
                                  )}
                                  %
                                </span>
                              </div>
                            </td>

                            {/* --- Achieved Amount % (Circular) --- */}
                            <td className="p-2 text-center">
                              <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg
                                  className="rotate-[-90deg]"
                                  width="40"
                                  height="40"
                                >
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke={
                                      item.achieved_amount_percentage < 50
                                        ? "#f97316" // orange
                                        : item.achieved_amount_percentage < 90
                                        ? "#facc15" // yellow
                                        : "#10b981" // green
                                    }
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 17}
                                    strokeDashoffset={
                                      2 *
                                      Math.PI *
                                      17 *
                                      (1 -
                                        Math.min(
                                          item.achieved_amount_percentage ?? 0,
                                          100
                                        ) /
                                          100)
                                    }
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-[10px] font-semibold text-gray-700">
                                  {Math.min(
                                    item.achieved_amount_percentage ?? 0,
                                    999
                                  )}
                                  %
                                </span>
                              </div>
                            </td>

                            {/* --- Actions --- */}
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="hover:bg-emerald-50"
                                  onClick={() => {
                                    setViewData(item);
                                    setViewModal(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-emerald-600" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="hover:bg-blue-50"
                                  onClick={() => {
                                    setEditData(item);
                                    setShowModal(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 text-blue-600" />
                                </Button>

                                {/* ----- Delete button with confirmation dialog ----- */}
                                <AlertDialog
                                  open={
                                    deleteDialogOpen && deleteId === item.id
                                  }
                                  onOpenChange={(o) => {
                                    if (!o) {
                                      setDeleteDialogOpen(false);
                                      setDeleteId(null);
                                    }
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="hover:bg-rose-50"
                                      onClick={() => {
                                        setDeleteDialogOpen(true);
                                        setDeleteId(item.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-rose-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirm Deletion
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        sales target? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-rose-600 hover:bg-rose-700 text-white"
                                        onClick={() => handleDelete(item.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-6 text-center text-muted-foreground"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {data?.last_page > 1 && (
                <div className="pt-4 flex justify-center">
                  <CustomPagination
                    totalPage={data.last_page}
                    currentPage={filters.page}
                    setCurrentPage={(p) => handleFilterChange("page", p)}
                  />
                </div>
              )}
            </>
          )}

          {isFetching && (
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> refreshing...
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Create / Edit modal --- */}
      <TargetModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        editData={editData}
        onSubmit={handleSave}
        products={displayedProducts}
        onSearch={setSearchQuery}
      />

      {/* --- View details modal --- */}
      <ViewTargetDetails
        open={viewModal}
        onClose={() => setViewModal(false)}
        item={viewData}
      />
    </div>
  );
}
