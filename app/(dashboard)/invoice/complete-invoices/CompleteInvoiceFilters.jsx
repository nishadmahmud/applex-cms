"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function CompleteInvoiceFilters({ filters, onFilterChange }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());

  // 🕒 Local state to debounce keyword typing
  const [localKeyword, setLocalKeyword] = useState(filters.keyword);
  const debounceTimer = useRef(null);

  // Keep input synced when filters reset externally
  useEffect(() => {
    setLocalKeyword(filters.keyword);
  }, [filters.keyword]);

  // 🔍 Debounced search handler
  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setLocalKeyword(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Wait 500 ms after last keystroke before triggering parent change
    debounceTimer.current = setTimeout(() => {
      onFilterChange({ keyword: value });
    }, 500);
  };

  const handleCheckboxChange = (field, checked) => {
    onFilterChange({ [field]: checked });
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    onFilterChange({ startDate: date ? date.getTime() : 0 });
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    onFilterChange({
      endDate: date ? date.toISOString() : new Date().toISOString(),
    });
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(new Date());
    onFilterChange({
      keyword: "",
      nameId: false,
      emailId: false,
      phoneId: false,
      product: false,
      startDate: 0,
      endDate: new Date().toISOString(),
    });
  };

  const activeFiltersCount = [
    filters.nameId,
    filters.emailId,
    filters.phoneId,
    filters.product,
    filters.startDate !== 0,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search Invoice"
          value={localKeyword} // 🧠 Debounced local value
          onChange={handleKeywordChange}
          className="pl-10 bg-blue-50 border-blue-100"
        />
      </div>

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-blue-50 border-blue-100 relative"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {[
                ["nameId", "Customer Name"],
                ["emailId", "Customer Email"],
                ["phoneId", "Customer Number"],
                ["product", "Product"],
              ].map(([key, label]) => (
                <div className="flex items-center space-x-2" key={key}>
                  <Checkbox
                    id={key}
                    checked={filters[key]}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(key, checked)
                    }
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t">
              <h5 className="font-medium text-sm">Date Range</h5>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      {startDate
                        ? format(startDate, "dd/MM/yyyy")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
