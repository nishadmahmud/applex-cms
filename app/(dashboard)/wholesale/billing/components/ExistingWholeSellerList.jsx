"use client";
import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { useSearchWholeSellerQuery } from "@/app/store/api/wholeSellerApi";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export function ExistingWholeSellerList({ schema, setSchema }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, session, dispatch]);

  const { data } = useSearchWholeSellerQuery(keyword, {
    skip: status !== "authenticated",
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {schema.wholeseller_id
            ? schema.wholeseller_name || "Loading..."
            : "Select Whole Seller"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput
            placeholder="Search whole seller..."
            value={keyword}
            onValueChange={setKeyword}
          />
          <CommandList>
            <CommandEmpty>No wholeseller found.</CommandEmpty>
            <CommandGroup>
              {data?.data?.data?.length
                ? data.data.data.map((seller) => (
                    <CommandItem
                      key={seller.id}
                      value={seller.name}
                      onSelect={() => {
                        setSelectedId(seller.id);
                        setSchema({
                          wholeseller_id: seller.id,
                          wholeseller_name: seller.name,
                        });
                        setKeyword("");
                        setOpen(false);
                      }}
                    >
                      {seller.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedId === seller.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))
                : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
