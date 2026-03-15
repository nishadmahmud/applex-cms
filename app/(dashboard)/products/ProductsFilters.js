"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ProductsFilters({
  onSearch,
  onFilterChange,
  filters,
  isSearching,
}) {
  const debounceRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    categoryId: false,
    subCategoryId: false,
    unitId: false,
    brandId: false,
    service: false,
    variants: false,
    normal: false,
    stockIn: false,
    stockOut: false,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 700);
  };

  const handleFilterToggle = (filterKey) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  useEffect(() => {
    if (!filterOpen) {
      onFilterChange(localFilters);
    }
  }, [filterOpen]);

  const handleStockFilter = (type) => {
    if (type === "stockIn") {
      setLocalFilters((prev) => ({
        ...prev,
        stockIn: !prev.stockIn,
        stockOut: false,
      }));
    } else {
      setLocalFilters((prev) => ({
        ...prev,
        stockOut: !prev.stockOut,
        stockIn: false,
      }));
    }
  };

  return (
    <div className="flex items-center justify-end gap-4 mb-6 p-4 bg-white rounded-lg border">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search Product"
          className="pl-10"
          disabled={isSearching}
        />
      </div>

      {/* Filter Button with Dropdown */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category"
                  checked={localFilters.categoryId}
                  onCheckedChange={() => handleFilterToggle("categoryId")}
                />
                <Label
                  htmlFor="category"
                  className="text-sm font-normal cursor-pointer"
                >
                  Category
                </Label>
              </div>

              {/* Sub Category */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subCategory"
                  checked={localFilters.subCategoryId}
                  onCheckedChange={() => handleFilterToggle("subCategoryId")}
                />
                <Label
                  htmlFor="subCategory"
                  className="text-sm font-normal cursor-pointer"
                >
                  Sub Category
                </Label>
              </div>

              {/* Unit */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unit"
                  checked={localFilters.unitId}
                  onCheckedChange={() => handleFilterToggle("unitId")}
                />
                <Label
                  htmlFor="unit"
                  className="text-sm font-normal cursor-pointer"
                >
                  Unit
                </Label>
              </div>

              {/* Brand */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="brand"
                  checked={localFilters.brandId}
                  onCheckedChange={() => handleFilterToggle("brandId")}
                />
                <Label
                  htmlFor="brand"
                  className="text-sm font-normal cursor-pointer"
                >
                  Brand
                </Label>
              </div>

              {/* Service */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="service"
                  checked={localFilters.service}
                  onCheckedChange={() => handleFilterToggle("service")}
                />
                <Label
                  htmlFor="service"
                  className="text-sm font-normal cursor-pointer"
                >
                  Service
                </Label>
              </div>

              {/* Variants */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="variants"
                  checked={localFilters.variants}
                  onCheckedChange={() => handleFilterToggle("variants")}
                />
                <Label
                  htmlFor="variants"
                  className="text-sm font-normal cursor-pointer"
                >
                  Variants
                </Label>
              </div>

              {/* Normal */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="normal"
                  checked={localFilters.normal}
                  onCheckedChange={() => handleFilterToggle("normal")}
                />
                <Label
                  htmlFor="normal"
                  className="text-sm font-normal cursor-pointer"
                >
                  Normal
                </Label>
              </div>
            </div>

            {/* Stock Filters */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant={localFilters.stockIn ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleStockFilter("stockIn")}
              >
                Stock In
              </Button>
              <Button
                variant={localFilters.stockOut ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleStockFilter("stockOut")}
              >
                Stock Out
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
