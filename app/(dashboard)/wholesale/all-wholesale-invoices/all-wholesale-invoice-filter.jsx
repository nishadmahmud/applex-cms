"use client";
import React, { useState } from "react";
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

export default function AllWholeSaleInvoiceFilters({
  filters,
  onFilterChange,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());

  const handleKeywordChange = (e) =>
    onFilterChange({ keyword: e.target.value });
  const toggle = (field, checked) => onFilterChange({ [field]: checked });

  const handleStart = (date) => {
    setStartDate(date);
    onFilterChange({ startDate: date ? date.getTime() : 0 });
  };
  const handleEnd = (date) => {
    setEndDate(date);
    onFilterChange({
      endDate: date ? date.toISOString() : new Date().toISOString(),
    });
  };

  const clear = () => {
    setStartDate(null);
    setEndDate(new Date());
    onFilterChange({
      keyword: "",
      nameId: false,
      emailId: false,
      phoneId: false,
      startDate: 0,
      endDate: new Date().toISOString(),
    });
  };

  const activeCount = [
    filters.nameId,
    filters.emailId,
    filters.phoneId,
    filters.startDate !== 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Invoice / Wholeseller"
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
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filters</h4>
                {!!activeCount && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
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
                    onCheckedChange={(c) => toggle("nameId", c)}
                  />
                  <Label htmlFor="nameId" className="text-sm">
                    Wholeseller Name
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailId"
                    checked={filters.emailId}
                    onCheckedChange={(c) => toggle("emailId", c)}
                  />
                  <Label htmlFor="emailId" className="text-sm">
                    Wholeseller Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phoneId"
                    checked={filters.phoneId}
                    onCheckedChange={(c) => toggle("phoneId", c)}
                  />
                  <Label htmlFor="phoneId" className="text-sm">
                    Wholeseller Number
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
                        className="w-full justify-start text-left"
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
                        onSelect={handleStart}
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
                        className="w-full justify-start text-left"
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
                        onSelect={handleEnd}
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
