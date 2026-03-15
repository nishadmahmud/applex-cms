"use client";
import React, { useEffect } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRef, useState } from "react";
import {
  useGetEmployeesQuery,
  useLazySearchEmployeeQuery,
} from "@/app/store/api/employeesApi";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export function AddSeller({
  selectedSeller,
  setSelectedSeller,
  setSelectedSellerName,
}) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const { data } = useGetEmployeesQuery(undefined, {
    skip: status !== "authenticated",
  });

  const [searchEmployee, { data: searchedEmployees, isLoading }] =
    useLazySearchEmployeeQuery();

  const handleSearch = async (value) => {
    setKeyword(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(async () => {
      await searchEmployee({ keyword: value }).unwrap();
    }, 700);
  };

  const employees =
    keyword && !isLoading
      ? searchedEmployees?.data || []
      : data?.data?.data || [];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSeller
            ? data?.data?.data?.find((item) => item?.id === selectedSeller)
                ?.name
            : "Select seller..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <Command>
          <CommandInput
            placeholder="Search seller..."
            className="h-9"
            value={keyword}
            onValueChange={(value) => handleSearch(value)}
          />
          <CommandList>
            <CommandEmpty>No seller found.</CommandEmpty>
            <CommandGroup>
              {employees.length
                ? employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.name}
                      onSelect={() => {
                        setSelectedSeller(employee.id);
                        setSelectedSellerName(employee.name);
                        setKeyword("");
                        setOpen(false);
                      }}
                    >
                      {employee?.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedSeller === employee?.name
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
