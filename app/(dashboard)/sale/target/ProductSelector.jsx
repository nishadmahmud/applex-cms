/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SpinnerCustom } from "@/components/shared/CustomLoader";

export default function ProductSelector({
  products,
  isLoading,
  searchQuery,
  onSearch,
  selectedProductId,
  onSelect,
}) {
  const [open, setOpen] = useState(false);

  /* ================= SELECTED PRODUCT ================= */
  const selectedProduct = useMemo(() => {
    return products?.data?.data?.find(
      (p) => p.id === selectedProductId
    );
  }, [products, selectedProductId]);

  /* ================= INPUT VALUE ================= */
  const inputValue = open
    ? searchQuery
    : selectedProduct?.name || "";

  /* ================= CLEAR ================= */
  const handleClear = () => {
    onSelect(null);
    onSearch({ target: { value: "" } });
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Select product..."
          value={inputValue}
          onChange={onSearch}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pr-8"
        />

        {selectedProduct && !open && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow">
          <div className="h-[220px] overflow-y-auto">
            <div className="p-2 space-y-1">
              {isLoading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SpinnerCustom /> Loading products…
                </p>
              )}

              {!isLoading &&
                products?.data?.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No products found.
                  </p>
                )}

              {products?.data?.data?.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded p-2",
                    selectedProductId === p.id
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {p.image_path && (
                    <img
                      src={p.image_path}
                      className="h-7 w-7 rounded"
                      alt={p.name}
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Price: {p.retails_price} | Stock: {p.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
