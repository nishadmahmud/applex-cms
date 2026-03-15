"use client";

import { React, useState } from "react";
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

export default function AllSellInvoiceFilters({ filters, onFilterChange }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());

  const handleKeywordChange = (e) => {
    onFilterChange({ keyword: e.target.value });
  };

  const handleCheckboxChange = (field, checked) => {
    onFilterChange({ [field]: checked });
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    onFilterChange({ startDate: date ? date.toISOString() : 0 });
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
      dueOnly: false,
    });
  };

  const activeFiltersCount = [
    filters.nameId,
    filters.emailId,
    filters.phoneId,
    filters.product,
    filters.dueOnly,
    filters.startDate !== 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Invoice"
            value={filters.keyword}
            onChange={handleKeywordChange}
            className="pl-10 bg-muted/50"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative bg-transparent"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nameId"
                    checked={filters.nameId}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("nameId", checked)
                    }
                  />
                  <Label
                    htmlFor="nameId"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Customer Name
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailId"
                    checked={filters.emailId}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("emailId", checked)
                    }
                  />
                  <Label
                    htmlFor="emailId"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Customer Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phoneId"
                    checked={filters.phoneId}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("phoneId", checked)
                    }
                  />
                  <Label
                    htmlFor="phoneId"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Customer Number
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="productId"
                    checked={filters.product}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("product", checked)
                    }
                  />
                  <Label
                    htmlFor="productId"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Product
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dueOnly"
                    checked={filters.dueOnly}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("dueOnly", checked)
                    }
                  />
                  <Label
                    htmlFor="dueOnly"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Due Invoices Only
                  </Label>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h5 className="font-medium text-sm">Date Range</h5>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Start Date
                  </Label>
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
                    <PopoverContent className="w-auto p-0" align="start">
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
                  <Label className="text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        {endDate
                          ? format(endDate, "dd/MM/yyyy")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
    </div>
  );
}
