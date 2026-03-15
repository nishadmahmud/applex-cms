"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useGetDeliveryListQuery } from "@/app/store/api/deliveryApi";
import {
  useGetPathaoStoresQuery,
  useGetPathaoCitiesQuery,
  useGetPathaoZonesQuery,
} from "@/app/store/api/pathaoApi";
import {
  useUpdateEcommerceSalesMutation,
  useCreatePathaoOrderMutation,
} from "@/app/store/api/ecommerceOrderListApi";

export default function DeliveryModal({ open, onClose, order }) {
  const { data: deliveryData } = useGetDeliveryListQuery({
    page: 1,
    limit: 50,
  });
  const [updateSales, { isLoading }] = useUpdateEcommerceSalesMutation();
  const [createPathaoOrder] = useCreatePathaoOrderMutation();

  // ---------- form ----------
  const [form, setForm] = useState({
    delivery_method_id: order?.delivery_method_id || "",
    delivery_method_name:
      order?.delivery_method?.type_name?.toLowerCase() || "",
    delivery_info_id: order?.delivery_info_id || "",
    recipient_name: order?.delivery_customer_name || "",
    phone: order?.delivery_customer_phone || "",
    address: order?.delivery_customer_address || "",
    note: order?.delivery_note || "",
    delivery_fee: order?.delivery_fee || 0,
    delivery_city: order?.delivery_city || "",
    delivery_district: order?.delivery_district || "",
  });

  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  const { data: storeData } = useGetPathaoStoresQuery(undefined, {
    skip: form.delivery_method_name !== "pathao",
  });
  const { data: cityData } = useGetPathaoCitiesQuery(undefined, {
    skip: form.delivery_method_name !== "pathao",
  });

  const [loadZonesCity, setLoadZonesCity] = useState("");
  useEffect(() => {
    if (selectedCity) setLoadZonesCity(selectedCity);
    else if (form.delivery_city) {
      const found = cityData?.data?.data?.find(
        (c) =>
          c.city_name.trim().toLowerCase() ===
          form.delivery_city.trim().toLowerCase(),
      );
      if (found) setLoadZonesCity(found.city_id);
    }
  }, [selectedCity, form.delivery_city, cityData]);

  const { data: zoneData } = useGetPathaoZonesQuery(loadZonesCity, {
    skip:
      !loadZonesCity ||
      form.delivery_method_name !== "pathao" ||
      !cityData?.data?.data?.length,
  });

  useEffect(() => {
    if (order) {
      setForm({
        delivery_method_id: order.delivery_method_id || "",
        delivery_method_name:
          order.delivery_method?.type_name?.toLowerCase() || "",
        delivery_info_id: order.delivery_info_id || "",
        recipient_name: order.delivery_customer_name || "",
        phone: order.delivery_customer_phone || "",
        address: order.delivery_customer_address || "",
        note: order.delivery_note || "",
        delivery_fee: order.delivery_fee || 0,
        delivery_city: order.delivery_city || "",
        delivery_district: order.delivery_district || "",
      });
    }
  }, [order]);

  const methods = deliveryData?.data?.data || [];
  const selectedMethodObj = methods.find(
    (m) => Number(m.id) === Number(form.delivery_method_id),
  );
  const isPathao =
    selectedMethodObj?.type_name?.toLowerCase?.() === "pathao" ||
    form.delivery_method_name === "pathao";

  const stores =
    storeData?.data?.data?.map((s) => ({
      value: String(s.store_id),
      label: s.store_name,
    })) || [];
  const cities =
    cityData?.data?.data?.map((c) => ({
      value: String(c.city_id),
      label: c.city_name.trim(),
    })) || [];
  const zones =
    zoneData?.data?.data?.map((z) => ({
      value: String(z.zone_id),
      label: z.zone_name,
    })) || [];

  // ---------- auto select ----------
  useEffect(() => {
    if (!isPathao) return;

    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(String(stores[0].value));
    }

    if (form.delivery_city || form.delivery_district) return;

    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(String(cities[0].value));
      setForm((p) => ({ ...p, delivery_city: cities[0].label }));
    }
  }, [
    isPathao,
    stores,
    cities,
    selectedStore,
    selectedCity,
    form.delivery_city,
    form.delivery_district,
  ]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelivery = async () => {
    try {
      const cityName =
        cities.find((c) => c.value === selectedCity)?.label ||
        form.delivery_city;
      const zoneName =
        zones.find((z) => z.value === selectedZone)?.label ||
        form.delivery_district;

      const payload = {
        invoice_id: order.invoice_id,
        pay_mode: order.pay_mode,
        paid_amount: order.paid_amount,
        cash_change: order.cash_change,
        sub_total: order.sub_total,
        vat: order.vat,
        tax: order.tax,
        discount: order.discount,
        product: order.sales_details?.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          product_variant_id: item.product_variant_id,
          price: item.price,
          retails_price: Number(item.product_info?.retails_price || 0),
          mode: Number(item.mode),
          size: Number(item.size),
          sales_id: item.sales_id,
          imei_id: item.imei_id || "",
          purchase_price: item.purchase_price,
          sale_price: 0,
          color: "",
          color_code: "",
          note: "",
          storage: "",
          battery_life: "",
          region: "",
          image_path: "",
          product_condition: "",
        })),
        delivery_method_id: form.delivery_method_id,
        delivery_info_id: form.delivery_info_id || form.delivery_method_id,
        delivery_customer_name: form.recipient_name,
        delivery_customer_address: form.address,
        delivery_customer_phone: form.phone,
        delivery_fee: Number(form.delivery_fee) || 0,
        delivery_note: form.note,
        delivery_city: cityName,
        delivery_district: zoneName,
        sales_id: order.sales_id,
        status: order.status || 1,
        created_at: order.created_at,
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
      };

      const res = await updateSales(payload).unwrap();

      if (res?.success && isPathao) {
        const invoiceId = res?.data?.invoice_id;
        const firstItem = order.sales_details?.[0];
        const itemName = firstItem?.product_info?.name || "Product";
        const variantName = firstItem?.product_variant?.name
          ? ` (${firstItem.product_variant.name})`
          : "";
        const qty = firstItem?.qty || 1;

        // match ids even if user didn’t reselect
        const matchedCityId = selectedCity
          ? Number(selectedCity)
          : Number(
              cities.find(
                (c) =>
                  c.label.trim().toLowerCase() ===
                  form.delivery_city.trim().toLowerCase(),
              )?.value,
            ) || 0;

        const matchedZoneId = selectedZone
          ? Number(selectedZone)
          : Number(
              zones.find(
                (z) =>
                  z.label.trim().toLowerCase() ===
                  form.delivery_district.trim().toLowerCase(),
              )?.value,
            ) || 0;

        const pathaoPayload = {
          store_id: Number(selectedStore),
          merchant_order_id: invoiceId,
          recipient_name: form.recipient_name,
          recipient_phone: form.phone,
          recipient_address: form.address,
          recipient_city: matchedCityId,
          recipient_zone: matchedZoneId,
          special_instruction: form.note,
          item_quantity: qty,
          item_description: `${itemName}${variantName}`,
          amount_to_collect:
            Number(order.sub_total) + Number(form.delivery_fee),
        };

        const pathaoRes = await createPathaoOrder(pathaoPayload).unwrap();
        if (pathaoRes?.success || pathaoRes?.code === 200) {
          toast.success("Pathao order created successfully!");
        } else {
          toast.error("Ecommerce updated, but Pathao order failed.");
        }
      }

      if (res?.success) {
        toast.success("Ecommerce order updated successfully!");
        setConfirmOpen(false);
        onClose(false);
      } else {
        toast.error(res?.message || "Failed to update order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating delivery.");
    }
  };

  // ---------- UI ----------
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Update and confirm delivery details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Delivery method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Delivery Method
              </label>
              <Select
                classNamePrefix="react-select"
                options={methods.map((m) => ({
                  value: String(m.id),
                  label: m.type_name,
                }))}
                value={
                  methods
                    .map((m) => ({
                      value: String(m.id),
                      label: m.type_name,
                    }))
                    .find((x) => x.value === String(form.delivery_method_id)) ||
                  null
                }
                onChange={(opt) =>
                  setForm((prev) => ({
                    ...prev,
                    delivery_method_id: Number(opt.value),
                    delivery_method_name: opt.label.toLowerCase(),
                  }))
                }
                placeholder="Select delivery method"
                isSearchable
              />
            </div>

            {isPathao && (
              <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">
                  Pathao Shipping Info
                </p>

                {/* Store */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Store
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    isSearchable
                    options={stores}
                    value={
                      stores.find((s) => s.value === selectedStore) || null
                    }
                    onChange={(opt) => setSelectedStore(opt.value)}
                    placeholder="Select store"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    City
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    isSearchable
                    options={cities}
                    value={cities.find((c) => c.value === selectedCity) || null}
                    onChange={(opt) => {
                      setSelectedCity(opt.value);
                      setSelectedZone("");
                      setForm((prev) => ({
                        ...prev,
                        delivery_city: opt.label,
                        delivery_district: "",
                      }));
                    }}
                    placeholder={form.delivery_city || "Select city"}
                  />
                </div>

                {/* Zone */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Zone
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    isSearchable
                    options={zones}
                    value={zones.find((z) => z.value === selectedZone) || null}
                    onChange={(opt) => {
                      setSelectedZone(opt.value);
                      setForm((prev) => ({
                        ...prev,
                        delivery_district: opt.label,
                      }));
                    }}
                    placeholder={form.delivery_district || "Select zone"}
                    isDisabled={!selectedCity}
                  />
                </div>
              </div>
            )}

            {/* Recipient section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Recipient Name
              </label>
              <Input
                value={form.recipient_name}
                onChange={(e) =>
                  setForm({ ...form, recipient_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Delivery Phone
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]"
              />
            </div>

            {!isPathao && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    value={form.delivery_city}
                    onChange={(e) =>
                      setForm({ ...form, delivery_city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    District
                  </label>
                  <Input
                    value={form.delivery_district}
                    onChange={(e) =>
                      setForm({ ...form, delivery_district: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Note
              </label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Delivery Fee
              </label>
              <Input
                type="number"
                value={form.delivery_fee}
                onChange={(e) =>
                  setForm({ ...form, delivery_fee: e.target.value })
                }
              />
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4"
            >
              {isLoading ? "Updating..." : "Confirm Delivery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm this delivery?</AlertDialogTitle>
            <p className="text-sm text-gray-500">
              This will update the order and create a Pathao shipment if
              applicable.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelivery}>
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
