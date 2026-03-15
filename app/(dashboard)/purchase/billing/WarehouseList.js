"use client";
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import useWarehouseQuery from "@/apiHooks/hooks/useWarehouseQuery";

// eslint-disable-next-line react/prop-types
export function WarehouseList({ setOrderSchema, setWarehouseName }) {
  const [open, setOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const { data } = useWarehouseQuery();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedWarehouse
            ? data?.data?.data?.find((item) => item?.id === selectedWarehouse)
                ?.name
            : "Select Warehouse"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <Command>
          {/* <CommandInput placeholder="Search customer..." className="h-9" value={keyword}
                        onValueChange={setKeyword} /> */}
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {data?.data?.data && data?.data?.data?.length
                ? data.data.data
                    .filter((item) => item.name)
                    .map((house) => (
                      <CommandItem
                        key={house.id}
                        value={house?.id.toString?.()}
                        onSelect={(value) => {
                          setSelectedWarehouse(house.id);
                          setOrderSchema(value);
                          setWarehouseName(house.name);
                          setOpen(false);
                        }}
                      >
                        {house?.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedWarehouse === house?.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))
                : ""}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
