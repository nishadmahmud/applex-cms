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
import { useSearchCustomerQuery } from "@/app/store/api/saleCustomerApi";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export function ExistingCustomerList({ orderSchema, setOrderSchema }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const { data } = useSearchCustomerQuery(keyword, {
    skip: status !== "authenticated",
  });

  console.log(data);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {/* {selectedCustomer
            ? data.data.data.find((item) => item.id === selectedCustomer).name
            : "Cash Customer"} */}
          {orderSchema.customer_id
            ? orderSchema.customer_name || "Loading..."
            : "Cash Customer"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search customer..."
            className="h-9"
            value={keyword}
            onValueChange={setKeyword}
          />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                defaultValue={"Cash Customer"}
                onSelect={() => {
                  setKeyword("");
                  setOpen(false);
                  // reset to anonymous "cash" customer
                  setSelectedCustomer(null);
                  setOrderSchema({
                    customer_id: "", // no id for cash customer
                    customer_name: "Cash Customer",
                    delivery_customer_name: "",
                    delivery_customer_address: "",
                    delivery_customer_phone: "",
                  });
                }}
              >
                Cash Customer
                <Check
                  className={cn(
                    "ml-auto",
                    selectedCustomer === null ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {data?.data?.data && data?.data?.data?.length
                ? data.data.data.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      setSelectedCustomer(customer.id);
                      setOrderSchema((prev) => ({
                        ...prev,
                        customer_id: customer.id,
                        customer_name: customer.name,
                        delivery_customer_name: customer.name,
                        delivery_customer_address: customer.address,
                        delivery_customer_phone: customer.mobile_number,
                      }));
                      setKeyword("");
                      setOpen(false);
                    }}
                  >
                    {customer?.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedCustomer === customer?.name
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
