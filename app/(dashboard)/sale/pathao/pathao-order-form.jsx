"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useGetPathaoStoresQuery,
  useGetPathaoCitiesQuery,
  useGetPathaoZonesQuery,
} from "@/app/store/api/pathaoApi";

export default function PathaoOrderForm({
  orderList,
  total,
  customerData,
  onSubmit, // parent callback triggers /save-sales then /pathao/create-order
}) {
  // 🌐 preloaded selection from Delivery Method (saved globally)
  const preSelected =
    typeof window !== "undefined" ? window.deliverySelection : null;

  const [store, setStore] = useState(null);
  const [city, setCity] = useState(null);
  const [zone, setZone] = useState(null);
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState({
    name: customerData?.delivery_customer_name || customerData?.name || "",
    phone:
      customerData?.delivery_customer_phone ||
      customerData?.mobile_number ||
      "",
    address:
      customerData?.delivery_customer_address || customerData?.address || "",
  });

  // 🔹 Queries
  const { data: storesData } = useGetPathaoStoresQuery();
  const { data: citiesData } = useGetPathaoCitiesQuery();
  const { data: zonesData } = useGetPathaoZonesQuery(city?.value, {
    skip: !city?.value,
  });

  // 🔹 Options for react-select
  const storeOptions =
    storesData?.data?.data?.map((s) => ({
      value: s.store_id,
      label: s.store_name,
    })) || [];

  const cityOptions =
    citiesData?.data?.data?.map((c) => ({
      value: c.city_id,
      label: c.city_name.trim(),
    })) || [];

  const zoneOptions =
    zonesData?.data?.data?.map((z) => ({
      value: z.zone_id,
      label: z.zone_name,
    })) || [];

  // ⏩ Auto-select Pathao fields chosen in DeliveryMethod modal
  useEffect(() => {
    if (!preSelected) return;
    const preStore = storeOptions.find(
      (s) => s.value === preSelected.selectedStore
    );
    const preCity = cityOptions.find(
      (c) => c.value === preSelected.selectedCity
    );
    const preZone = zoneOptions.find(
      (z) => z.value === preSelected.selectedZone
    );
    if (preStore) setStore(preStore);
    if (preCity) setCity(preCity);
    if (preZone) setZone(preZone);
    // }, [storeOptions, cityOptions, zoneOptions]);
  }, [!!storeOptions.length, !!cityOptions.length, !!zoneOptions.length]);

  // 💰 Calculate total due (amount to collect)
  const amountToCollect = Math.max(
    Number(total) - Number(customerData?.paid_amount || 0),
    0
  );

  // ✅ Validate and send to parent
  const handleSubmit = async () => {
    if (!recipient.name || !recipient.phone || recipient.address.length < 10) {
      toast.error(
        "Please fill receiver info properly. Address must be at least 10 characters."
      );
      return;
    }

    const formValues = {
      store_id: store?.value || preSelected?.selectedStore,
      city_id: city?.value || preSelected?.selectedCity,
      zone_id: zone?.value || preSelected?.selectedZone,
      recipient_name: recipient.name,
      recipient_phone: recipient.phone,
      recipient_address: recipient.address,
      special_instruction: note || "",
      delivery_fee: preSelected?.deliveryFee || 0,
      amount_to_collect: Math.round(amountToCollect),
    };

    await onSubmit(formValues);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Confirm or adjust receiver details below. Delivery method is prefilled
        and locked from your previous selection.
      </p>

      {/* 🟣 Receiver Info */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Name
        </label>
        <Input
          type="text"
          value={recipient.name}
          onChange={(e) =>
            setRecipient((p) => ({ ...p, name: e.target.value }))
          }
          placeholder="Receiver Name"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Phone
        </label>
        <Input
          type="text"
          value={recipient.phone}
          onChange={(e) =>
            setRecipient((p) => ({ ...p, phone: e.target.value }))
          }
          placeholder="Receiver Phone"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Address
        </label>
        <Input
          type="text"
          value={recipient.address}
          onChange={(e) =>
            setRecipient((p) => ({ ...p, address: e.target.value }))
          }
          placeholder="Receiver Address"
        />
      </div>

      {/* 🔒 Locked Store/City/Zone (from DeliveryMethod) */}
      <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Store
          </label>
          <Select
            isDisabled
            options={storeOptions}
            value={store}
            placeholder="Selected Store"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            City
          </label>
          <Select
            isDisabled
            options={cityOptions}
            value={city}
            placeholder="Selected City"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Zone
          </label>
          <Select
            isDisabled
            options={zoneOptions}
            value={zone}
            placeholder="Selected Zone"
          />
        </div>
      </div>

      {/* 💴 Amount to Collect */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Amount to Collect (Due)
        </label>
        <Input value={amountToCollect.toFixed(2)} disabled />
      </div>

      {/* ✏️ Special Instruction */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Special Instruction
        </label>
        <Input
          placeholder="Any note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* 💾 Save & Proceed */}
      <Button
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
        onClick={handleSubmit}
      >
        Save & Proceed
      </Button>
    </div>
  );
}
