"use client";
import React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useGetWarrantyQuery } from "@/app/store/api/warrantyApi";

export default function WarrantyUi({
  productId,
  setWarrantyModal,
  setWarranties,
  warranties,
}) {
  const [open, setOpen] = useState({});
  const [keyword, setKeyword] = useState("");

  const { data } = useGetWarrantyQuery({ page: 1, limit: 20 });

  const handleOpen = (id, value) => {
    setOpen((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClose = (id) => {
    const remaining = warranties.filter((item) => item.id != id);
    setWarranties(remaining);
  };
  useEffect(() => {
    if (data?.data?.length) {
      const defaultMethod =
        data.data.find((item) => item.name === "7 days waranty") || null;

      setWarranties((prev) => {
        const hasWarrantyForProduct = prev.some(
          (w) => w.product_id === productId
        );

        if (!hasWarrantyForProduct) {
          return [
            ...prev,
            {
              id: new Date().toString(),
              product_id: productId,
              warranty_id: defaultMethod?.id || "",
              default_warranties_count: defaultMethod?.warranties_count || "",
            },
          ];
        }
        return prev;
      });
    }
  }, [data?.data, productId, setWarranties]);

  const addMore = () => {
    const newMethod = {
      id: new Date().toString(),
      product_id: productId,
      warranty_id: "",
      default_warranties_count: "",
    };
    setWarranties((prev) => [...prev, newMethod]);
  };

  return (
    <div>
      <div className="mt-3 space-y-3">
        {warranties
          .filter((item) => item.product_id === productId)
          .map((w, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="mb-2 font-semibold">Warranty {idx + 1}</h2>
                <Button
                  className="bg-red-500 text-white hover:bg-red-500 text-xs py-[2px]"
                  onClick={() => handleClose(w.id)}
                >
                  Cancel
                </Button>
              </div>

              <Popover
                open={!!open[w.id]}
                onOpenChange={(value) => handleOpen(w.id, value)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {w.warranty_id ? (
                      <span>
                        {
                          data.data.find((item) => item.id == w.warranty_id)
                            ?.name
                        }{" "}
                        <span className="text-gray-500 text-sm">
                          (
                          {data.data.find((item) => item.id == w.warranty_id)
                            ?.warranties_count ||
                            w.default_warranties_count}{" "}
                          days)
                        </span>
                      </span>
                    ) : (
                      "Select Warranty"
                    )}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command key={w.id}>
                    <CommandInput
                      placeholder="Search Warranty..."
                      className="h-9 w-full flex-1"
                      value={keyword}
                      onValueChange={setKeyword}
                    />
                    <CommandList>
                      <CommandEmpty>No warranties found.</CommandEmpty>
                      <CommandGroup>
                        {data?.data && data?.data?.length
                          ? data.data.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => {
                                  setWarranties(() =>
                                    warranties.map((wt) => {
                                      if (wt.id == w.id) {
                                        return {
                                          ...wt,
                                          warranty_id: item.id,
                                          default_warranties_count:
                                            item.warranties_count,
                                        };
                                      } else {
                                        return wt;
                                      }
                                    })
                                  );
                                  setKeyword("");
                                  setOpen(false);
                                }}
                              >
                                <span>
                                  {item?.name}
                                  <span className="text-gray-500 ml-1 text-sm">
                                    ({item.warranties_count} days)
                                  </span>
                                </span>
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    warranties[idx].warranty_id === item?.id
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
            </div>
          ))}
      </div>

      <div className="flex items-center w-full flex-1 justify-between mt-2">
        <p className="text-sm font-semibold">Add More Condition</p>
        <Button
          onClick={addMore}
          className="bg-white rounded-full py-5 px-3 shadow-none border hover:bg-white"
        >
          <Plus className="text-gray-700 h-10" />
        </Button>
      </div>
      <Button
        onClick={() => setWarrantyModal(false)}
        className="bg-blue-500 mt-5 py-5 px-3 shadow-none border hover:bg-blue-500 w-full font-semibold"
      >
        Save
      </Button>
    </div>
  );
}
