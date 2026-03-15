"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetDeliveryListQuery } from "@/app/store/api/deliveryApi";
import {
  useGetPathaoStoresQuery,
  useGetPathaoCitiesQuery,
  useGetPathaoZonesQuery,
} from "@/app/store/api/pathaoApi";
import { ChevronsUpDown, Check, Save } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function DeliveryMethod({
  selectedMethod,
  setSelectedMethod,
  setDeliveryModal,
  setDeliveryFee, // <-- parent setter
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showPathaoFields, setShowPathaoFields] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [localDeliveryFee, setLocalDeliveryFee] = useState(0);

  // 🔹 Fetch all delivery methods
  const { data } = useGetDeliveryListQuery({ page: 1, limit: 20 });

  // 🔹 Pathao data
  const { data: storeData } = useGetPathaoStoresQuery(undefined, {
    skip: !showPathaoFields,
  });
  const { data: cityData } = useGetPathaoCitiesQuery(undefined, {
    skip: !showPathaoFields,
  });
  const { data: zoneData } = useGetPathaoZonesQuery(selectedCity, {
    skip: !selectedCity,
  });

  // ⏩ Default method = hand-to-hand
  useEffect(() => {
    if (data?.data?.data?.length) {
      const defaultMethod =
        data.data.data.find((item) => item.type_name === "hand-to-hand")?.id ||
        null;
      setSelectedMethod((prev) => prev || defaultMethod);
    }
  }, [data?.data?.data]);

  // ⏩ Detect Pathao selection
  useEffect(() => {
    const methodObj = data?.data?.data?.find((m) => m.id === selectedMethod);
    const isPathao = methodObj?.type_name?.toLowerCase() === "pathao";
    setShowPathaoFields(isPathao);

    // reset fields for non-pathao
    if (!isPathao) {
      setSelectedStore("");
      setSelectedCity("");
      setSelectedZone("");
      setLocalDeliveryFee(0);
      if (setDeliveryFee) setDeliveryFee(0);
    }
  }, [selectedMethod]);

  // sync globally (for backward compat.)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.deliverySelection = {
        ...(window.deliverySelection || {}), // ✅ keep existing keys (like allMethods)
        selectedStore,
        selectedCity,
        selectedZone,
        deliveryFee: Number(localDeliveryFee) || 0,
        allMethods: data?.data?.data || [], // ✅ store all delivery methods globally
      };
    }
  }, [
    selectedStore,
    selectedCity,
    selectedZone,
    localDeliveryFee,
    data?.data?.data,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fee = window.deliverySelection?.deliveryFee;
      if (fee != null) setLocalDeliveryFee(Number(fee));
    }
  }, []);

  // 🔘 handleSave
  const handleSave = () => {
    if (
      showPathaoFields &&
      (!selectedStore || !selectedCity || !selectedZone)
    ) {
      toast.error("Please select store, city and zone before saving.");
      return;
    }

    // ✅ update parent delivery fee
    if (setDeliveryFee) setDeliveryFee(Number(localDeliveryFee) || 0);

    window.deliverySelection = {
      ...(window.deliverySelection || {}), // ✅ merge instead of overwrite
      selectedStore,
      selectedCity,
      selectedZone,
      deliveryFee: Number(localDeliveryFee) || 0,
    };

    toast.success("Delivery details saved successfully!");
    if (setDeliveryModal) setDeliveryModal(false);
  };

  // 🔹 Styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      boxShadow: "none",
      minHeight: "38px",
      "&:hover": { borderColor: "#a855f7" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#a78bfa"
        : state.isFocused
        ? "#ede9fe"
        : "white",
      color: state.isSelected ? "white" : "#111827",
      cursor: "pointer",
    }),
  };

  return (
    <div className="space-y-5 bg-gradient-to-b from-violet-50 via-white to-indigo-50 p-5 rounded-lg shadow-inner">
      {/* Delivery Method dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-violet-200 hover:border-violet-400 bg-white shadow-sm"
          >
            {selectedMethod
              ? data?.data?.data?.find((m) => m.id === selectedMethod)
                  ?.type_name
              : "Select delivery method"}
            <ChevronsUpDown className="opacity-60 ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px]">
          <Command>
            <CommandInput
              placeholder="Search delivery method..."
              className="h-9"
              value={keyword}
              onValueChange={setKeyword}
            />
            <CommandList>
              <CommandEmpty>No method found.</CommandEmpty>
              <CommandGroup>
                {data?.data?.data?.length
                  ? data.data.data.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          setSelectedMethod(item.id);
                          setKeyword("");
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        {item.type_name}
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedMethod === item.id
                              ? "opacity-100"
                              : "opacity-0"
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

      {/* Pathao fields */}
      {showPathaoFields && (
        <div className="space-y-4 pt-2 animate-fadeIn">
          {/* Store */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Store
            </label>
            <Select
              isSearchable
              styles={selectStyles}
              placeholder="Select Pathao store..."
              options={
                storeData?.data?.data?.map((s) => ({
                  value: s.store_id,
                  label: s.store_name,
                })) || []
              }
              value={
                selectedStore
                  ? {
                      value: selectedStore,
                      label:
                        storeData?.data?.data?.find(
                          (s) => s.store_id == selectedStore
                        )?.store_name || "",
                    }
                  : null
              }
              onChange={(val) => setSelectedStore(val?.value || "")}
            />
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              City
            </label>
            <Select
              isSearchable
              styles={selectStyles}
              placeholder="Select city..."
              options={
                cityData?.data?.data?.map((c) => ({
                  value: c.city_id,
                  label: c.city_name.trim(),
                })) || []
              }
              value={
                selectedCity
                  ? {
                      value: selectedCity,
                      label:
                        cityData?.data?.data?.find(
                          (c) => c.city_id == selectedCity
                        )?.city_name || "",
                    }
                  : null
              }
              onChange={(val) => {
                setSelectedCity(val?.value || "");
                setSelectedZone("");
              }}
            />
          </div>

          {/* Zone */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Zone
            </label>
            <Select
              isSearchable
              styles={selectStyles}
              placeholder="Select zone..."
              options={
                zoneData?.data?.data?.map((z) => ({
                  value: z.zone_id,
                  label: z.zone_name,
                })) || []
              }
              value={
                selectedZone
                  ? {
                      value: selectedZone,
                      label:
                        zoneData?.data?.data?.find(
                          (z) => z.zone_id == selectedZone
                        )?.zone_name || "",
                    }
                  : null
              }
              onChange={(val) => setSelectedZone(val?.value || "")}
            />
          </div>
        </div>
      )}

      {/* Delivery Fee */}
      <div className="pt-4">
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Delivery Fee
        </label>
        <Input
          type="number"
          min="0"
          className="border-violet-200 focus:border-violet-400 focus:ring-violet-300"
          value={localDeliveryFee}
          onChange={(e) => setLocalDeliveryFee(Number(e.target.value))}
        />
      </div>

      {/* Save */}
      <div className="pt-4 border-t border-violet-100">
        <Button
          onClick={handleSave}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </Button>
      </div>
    </div>
  );
}
