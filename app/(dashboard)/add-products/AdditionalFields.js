"use client";
import { useGetUnitsQuery } from "@/app/store/api/unitsApi";
import { setToken } from "@/app/store/authSlice";
import CustomDatePicker from "@/app/utils/CustomDatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Nunito } from "next/font/google";
import { useGetCurrencyQuery } from "@/app/store/api/currencyApi";
import ReactSelect from "react-select";
import { readAdditionalInfosFromStorage } from "@/app/utils/additionalInfosStorage";
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "1000"], // optional
});

export default function AdditionalFields({
  form,
  productColor,
  setProductColor,
  setValue,
  fileUploadHandler,
}) {
  const watch = form.watch;
  const currentPdfPath = watch("pdf_file");
  const currentVideoPath = watch("video_link");
  const [savedAdditionalInfos, setSavedAdditionalInfos] = React.useState(null);
  const [prefillNonce, setPrefillNonce] = React.useState({});
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [session, status, dispatch]);

  const { data: units } = useGetUnitsQuery(undefined, {
    skip: status !== "authenticated",
  });

  const { data: currencies } = useGetCurrencyQuery(undefined, {
    skip: status !== "authenticated",
  });

  useEffect(() => {
    // Read once on mount. (Settings page writes to localStorage.)
    setSavedAdditionalInfos(readAdditionalInfosFromStorage());

    // Keep in sync if another tab updates localStorage
    const onStorage = (e) => {
      if (!e) return;
      // If key is null, storage cleared; refresh anyway
      if (!e.key || e.key === "Applex.additionalInfos.v1") {
        setSavedAdditionalInfos(readAdditionalInfosFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handlePrefillSelect = (fieldKey, rawValue) => {
    if (rawValue === "__clear__") {
      setValue(fieldKey, "");
    } else {
      setValue(fieldKey, rawValue || "");
    }
    // Reset just this dropdown back to placeholder by remounting it.
    setPrefillNonce((prev) => ({
      ...prev,
      [fieldKey]: (prev?.[fieldKey] || 0) + 1,
    }));
  };

  return (
    // UPDATED: Use larger padding and a cleaner shadow for the container
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${nunito.className}`}
    >
      {/* <h3 className="text-xl font-extrabold text-gray-900 mb-6">
        Additional Information
      </h3> */}

      {/* Unit and Warranty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative">
          <Label
            htmlFor="unit"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Unit
          </Label>
          <FormField
            name="unit_id"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                {/* UPDATED: Input styling for a more modern look */}
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-lg border-gray-300">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.data?.data &&
                      units?.data?.data.length &&
                      units.data.data.map((item) => (
                        <SelectItem key={item?.id} value={String(item?.id)}>
                          {item?.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
            )}
          />
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <FormField
            name="stock_restrictions"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Checkbox
                  id="stock_restrictions"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(!!checked);
                  }}
                  className="h-5 w-5 rounded text-blue-600 border-gray-300"
                />
              </FormControl>
            )}
          />
          <Label
            htmlFor="stock_restrictions"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Enable Stock Restrictions
            {/* <p className="text-xs text-gray-500 font-normal">
              Keeps product stock controlled by default. Uncheck if you want to
              allow unrestricted sales.
            </p> */}
          </Label>
        </div>
        <div className="relative">
          <Label
            htmlFor="warrantyDay"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Warranty Day
          </Label>
          <FormField
            name="warranties_count"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="warrantyDay"
                  placeholder="e.g., 365"
                  type="text"
                  // UPDATED: Input styling for a more modern look
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
      </div>

      {/* Warranty Conditions */}
      <div className="mb-6 relative">
        <Label
          htmlFor="warrantyConditions"
          // UPDATED: Standard block label style
          className="text-sm font-semibold text-gray-700 mb-1 block"
        >
          Warranty Conditions
        </Label>
        <FormField
          name="warrenty"
          control={form.control}
          render={({ field }) => (
            <FormControl>
              <Input
                {...field}
                id="warrantyConditions"
                placeholder="Briefly describe the warranty conditions (e.g., 1 year against manufacturing defects)"
                // UPDATED: Input styling for a more modern look
                className="rounded-lg border-gray-300 text-sm"
              />
            </FormControl>
          )}
        />
      </div>

      {/* Dates and Product Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative">
          <Label
            htmlFor="manufactoryDate"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Manufactory Date
          </Label>
          {/* Note: CustomDatePicker must handle its own styling internally to match the new design */}
          <CustomDatePicker
            setValue={setValue}
            fieldName={"manufactory_date"}
            form={form}
          />
        </div>
        <div className="relative">
          <Label
            htmlFor="expiryDate"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Expiry Date
          </Label>
          {/* Note: CustomDatePicker must handle its own styling internally to match the new design */}
          <CustomDatePicker
            setValue={setValue}
            fieldName={"expiry_date"}
            form={form}
          />
        </div>
        <div className="relative">
          <Label
            htmlFor="productCode"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product Code
          </Label>
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="productCode"
                  placeholder="e.g., SKU-12345"
                  // UPDATED: Input styling for a more modern look
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
      </div>

      {/* Stock and Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative">
          <Label
            htmlFor="minimumStock"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Minimum Stock
          </Label>
          <FormField
            name="minimum_stock"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  // Ensure value is a string for the input component to be controlled correctly
                  value={
                    field.value !== undefined && field.value !== null
                      ? String(field.value)
                      : ""
                  }
                  onChange={(e) => {
                    // This handles numbers correctly, allowing empty string but converting valid input to number/string
                    const value = e.target.value;
                    const parsedValue = value === "" ? "" : Number(value);
                    field.onChange(isNaN(parsedValue) ? "" : parsedValue);
                  }}
                  id="minimumStock"
                  placeholder="1"
                  type="text"
                  // UPDATED: Input styling for a more modern look
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
        {/* Employee Incentive Amount */}
        <div className="relative">
          <Label
            htmlFor="employee_incentive_amount"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Employee Incentive Amount
          </Label>
          <FormField
            name="employee_incentive_amount"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="employee_incentive_amount"
                  type="number"
                  step="any"
                  placeholder="e.g., 200 or leave blank"
                  value={field.value === null ? "" : field.value}
                  onChange={(e) => {
                    // Allow blank, convert to number when valid
                    const val = e.target.value.trim();
                    field.onChange(val === "" ? "" : Number(val));
                  }}
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Leave empty if no incentive for this product.
          </p>
        </div>
        <div className="relative">
          <Label
            htmlFor="productColorName"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product Color Name
          </Label>
          <FormField
            name="color"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="productColorName"
                  placeholder="e.g., Black"
                  // UPDATED: Input styling for a more modern look
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
        <div className=" relative">
          <Label
            htmlFor="productColor"
            // UPDATED: Standard block label style
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product Color
          </Label>
          {/* UPDATED: Aligned the color input to the new design */}
          <div className="flex gap-2">
            <FormField
              name="color_code"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <Input
                    id="productColor"
                    placeholder="Pick Color (e.g., #000000)"
                    value={productColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue("color_code", value);
                      setProductColor(value);
                    }}
                    // UPDATED: Input styling for a more modern look
                    className="flex-1 rounded-lg border-gray-300"
                  />
                </FormControl>
              )}
            />

            <div className="relative">
              <input
                type="color"
                value={productColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductColor(value);
                  setValue("color_code", value);
                }}
                // UPDATED: Color input styling
                style={{
                  WebkitAppearance: "none",
                  padding: "1px",
                  border: "2px solid #ccc",
                }}
                className="w-12 h-10 outline-none rounded-lg cursor-pointer bg-white transition-all duration-200 hover:border-blue-500"
              />
              <Palette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Order & Media Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Minimum Order */}
        <div className="relative">
          <Label
            htmlFor="minimum_order"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Minimum Order
          </Label>
          <FormField
            name="minimum_order"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="minimum_order"
                  type="number"
                  step="any"
                  placeholder="e.g., 1"
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>

        {/* Order Advance Amount */}
        <div className="relative">
          <Label
            htmlFor="order_advance_amount"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Order Advance Amount
          </Label>
          <FormField
            name="order_advance_amount"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="order_advance_amount"
                  type="number"
                  step="any"
                  placeholder="e.g., 500"
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>

        {/* YouTube Link */}
        <div className="relative">
          <Label
            htmlFor="youtube_link"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            YouTube Link
          </Label>
          <FormField
            name="youtube_link"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="youtube_link"
                  type="url"
                  placeholder="https://youtube.com/..."
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
      </div>

      {/* PDF & Video Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PDF File (queued, uploaded on save) */}
        <div className="relative">
          <Label
            htmlFor="pdf_file"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product PDF File
          </Label>
          <FormField
            name="pdf_file"
            control={form.control}
            render={({ field }) => (
              <>
                <FormControl>
                  <Input
                    id="pdf_file"
                    type="file"
                    accept="application/pdf"
                    className="rounded-lg border-gray-300"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // queue file; actual upload happens on save
                      setValue("pdf_file_raw", file || null);
                    }}
                  />
                </FormControl>
                {currentPdfPath && (
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    Existing PDF: {currentPdfPath}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Video File (queued, uploaded on save) */}
        <div className="relative">
          <Label
            htmlFor="video_link"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product Video File
          </Label>
          <FormField
            name="video_link"
            control={form.control}
            render={({ field }) => (
              <>
                <FormControl>
                  <Input
                    id="video_link"
                    type="file"
                    accept="video/*"
                    className="rounded-lg border-gray-300"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // queue file; actual upload happens on save
                      setValue("video_file_raw", file || null);
                    }}
                  />
                </FormControl>
                {currentVideoPath && (
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    Existing Video: {currentVideoPath}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Additional Options */}
      {/* UPDATED: Enhanced checkbox section for better visual grouping */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-base font-semibold text-gray-800">
          Product Attributes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <FormField
              name="is_variable_weight"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <Checkbox
                    id="variableWeight"
                    checked={field.value == 1}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? 1 : 0);
                    }}
                    className="h-5 w-5 rounded text-blue-600 border-gray-300"
                  />
                </FormControl>
              )}
            />
            <Label
              htmlFor="variableWeight"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Variable Weight
              <p className="text-xs text-gray-500 font-normal">
                Check if the product's weight changes per purchase (e.g.,
                fruits, bulk items).
              </p>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <FormField
              name="is_ecommerce"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <Checkbox
                    id="ecommerce"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(!!checked);
                    }}
                    className="h-5 w-5 rounded text-blue-600 border-gray-300"
                  />
                </FormControl>
              )}
            />
            <Label
              htmlFor="ecommerce"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Ecommerce Product
              <p className="text-xs text-gray-500 font-normal">
                Check if this product should be listed and available on your
                online store.
              </p>
            </Label>
          </div>
        </div>
      </div>

      {/* === NEW: Currency, Exchange Rate & Product Cost === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-3">
        {/* Currency Dropdown */}
        <div className="relative">
          <Label
            htmlFor="currency_id"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Currency
          </Label>
          <FormField
            name="currency_id"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <ReactSelect
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=" Currency"
                  options={
                    currencies?.data?.map((cur) => ({
                      value: cur.id,
                      label: `${cur.name} (${cur.symbol}) — ${cur.code}`,
                    })) || []
                  }
                  // this makes the previously saved value show correctly in Edit mode
                  value={
                    field.value
                      ? currencies?.data
                        ?.filter((c) => Number(c.id) === Number(field.value))
                        .map((c) => ({
                          value: c.id,
                          label: `${c.name} (${c.symbol}) — ${c.code}`,
                        }))[0]
                      : null
                  }
                  onChange={(option) =>
                    field.onChange(option ? option.value : "")
                  }
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": { borderColor: "#93c5fd" },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </FormControl>
            )}
          />
        </div>

        {/* NEW FIELD: International Retail Price */}
        <div className="relative">
          <Label
            htmlFor="intl_retails_price"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Intl. Retail Price
          </Label>
          <FormField
            name="intl_retails_price"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="intl_retails_price"
                  type="number"
                  step="any"
                  placeholder="Enter international retail price"
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>

        {/* Exchange Rate (manual input) */}
        <div className="relative">
          <Label
            htmlFor="international_exchange_rate"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Exchange Rate
          </Label>
          <FormField
            name="international_exchange_rate"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="international_exchange_rate"
                  type="number"
                  step="any"
                  placeholder="Enter exchange rate manually"
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>

        {/* Product Cost */}
        <div className="relative">
          <Label
            htmlFor="product_cost"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Product Cost
          </Label>
          <FormField
            name="product_cost"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="product_cost"
                  type="number"
                  step="any"
                  placeholder="Enter product cost"
                  className="rounded-lg border-gray-300"
                />
              </FormControl>
            )}
          />
        </div>
      </div>

      {/* === NEW: Additional Text Area Fields === */}
      <div className="space-y-6 mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-base font-semibold text-gray-800">
          Some More Additional Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manufacturer Details */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label
                htmlFor="manufacturer_details"
                className="text-sm font-semibold text-gray-700 block"
              >
                Manufacturer Details
              </Label>
              <Select
                key={`prefill-manufacturer_details-${prefillNonce?.manufacturer_details || 0}`}
                onValueChange={(v) => handlePrefillSelect("manufacturer_details", v)}
              >
                <SelectTrigger className="h-8 w-[170px] rounded-md border-gray-300 text-xs">
                  <SelectValue placeholder="Select saved" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(savedAdditionalInfos?.manufacturer_details) &&
                    savedAdditionalInfos.manufacturer_details.length ? (
                    savedAdditionalInfos.manufacturer_details.map((val, idx) => (
                      <SelectItem
                        key={`manufacturer_details-${idx}`}
                        value={val}
                      >
                        {val.length > 40 ? `${val.slice(0, 40)}…` : val}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No saved values
                    </SelectItem>
                  )}
                  <SelectItem
                    value="__clear__"
                    className="text-red-600 focus:text-red-600"
                  >
                    Clear field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              name="manufacturer_details"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <textarea
                    id="manufacturer_details"
                    {...field}
                    placeholder="Enter manufacturer information"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </FormControl>
              )}
            />
          </div>

          {/* Packer Details */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label
                htmlFor="packer_details"
                className="text-sm font-semibold text-gray-700 block"
              >
                Packer Details
              </Label>
              <Select
                key={`prefill-packer_details-${prefillNonce?.packer_details || 0}`}
                onValueChange={(v) => handlePrefillSelect("packer_details", v)}
              >
                <SelectTrigger className="h-8 w-[170px] rounded-md border-gray-300 text-xs">
                  <SelectValue placeholder="Select saved" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(savedAdditionalInfos?.packer_details) &&
                    savedAdditionalInfos.packer_details.length ? (
                    savedAdditionalInfos.packer_details.map((val, idx) => (
                      <SelectItem key={`packer_details-${idx}`} value={val}>
                        {val.length > 40 ? `${val.slice(0, 40)}…` : val}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No saved values
                    </SelectItem>
                  )}
                  <SelectItem
                    value="__clear__"
                    className="text-red-600 focus:text-red-600"
                  >
                    Clear field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              name="packer_details"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <textarea
                    id="packer_details"
                    {...field}
                    placeholder="Enter packer information"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </FormControl>
              )}
            />
          </div>

          {/* Seller Details */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label
                htmlFor="seller_details"
                className="text-sm font-semibold text-gray-700 block"
              >
                Seller Details
              </Label>
              <Select
                key={`prefill-seller_details-${prefillNonce?.seller_details || 0}`}
                onValueChange={(v) => handlePrefillSelect("seller_details", v)}
              >
                <SelectTrigger className="h-8 w-[170px] rounded-md border-gray-300 text-xs">
                  <SelectValue placeholder="Select saved" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(savedAdditionalInfos?.seller_details) &&
                    savedAdditionalInfos.seller_details.length ? (
                    savedAdditionalInfos.seller_details.map((val, idx) => (
                      <SelectItem key={`seller_details-${idx}`} value={val}>
                        {val.length > 40 ? `${val.slice(0, 40)}…` : val}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No saved values
                    </SelectItem>
                  )}
                  <SelectItem
                    value="__clear__"
                    className="text-red-600 focus:text-red-600"
                  >
                    Clear field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              name="seller_details"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <textarea
                    id="seller_details"
                    {...field}
                    placeholder="Enter seller information"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </FormControl>
              )}
            />
          </div>

          {/* Return / Delivery Days */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label
                htmlFor="return_delivery_days"
                className="text-sm font-semibold text-gray-700 block"
              >
                Return / Delivery Days
              </Label>
              <Select
                key={`prefill-return_delivery_days-${prefillNonce?.return_delivery_days || 0}`}
                onValueChange={(v) => handlePrefillSelect("return_delivery_days", v)}
              >
                <SelectTrigger className="h-8 w-[170px] rounded-md border-gray-300 text-xs">
                  <SelectValue placeholder="Select saved" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(savedAdditionalInfos?.return_delivery_days) &&
                    savedAdditionalInfos.return_delivery_days.length ? (
                    savedAdditionalInfos.return_delivery_days.map((val, idx) => (
                      <SelectItem
                        key={`return_delivery_days-${idx}`}
                        value={val}
                      >
                        {val.length > 40 ? `${val.slice(0, 40)}…` : val}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No saved values
                    </SelectItem>
                  )}
                  <SelectItem
                    value="__clear__"
                    className="text-red-600 focus:text-red-600"
                  >
                    Clear field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              name="return_delivery_days"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <textarea
                    id="return_delivery_days"
                    {...field}
                    placeholder="Enter return or delivery days policy"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </FormControl>
              )}
            />
          </div>

          {/* Importer Details */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label
                htmlFor="importer_details"
                className="text-sm font-semibold text-gray-700 block"
              >
                Importer Details
              </Label>
              <Select
                key={`prefill-importer_details-${prefillNonce?.importer_details || 0}`}
                onValueChange={(v) => handlePrefillSelect("importer_details", v)}
              >
                <SelectTrigger className="h-8 w-[170px] rounded-md border-gray-300 text-xs">
                  <SelectValue placeholder="Select saved" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(savedAdditionalInfos?.importer_details) &&
                    savedAdditionalInfos.importer_details.length ? (
                    savedAdditionalInfos.importer_details.map((val, idx) => (
                      <SelectItem key={`importer_details-${idx}`} value={val}>
                        {val.length > 40 ? `${val.slice(0, 40)}…` : val}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No saved values
                    </SelectItem>
                  )}
                  <SelectItem
                    value="__clear__"
                    className="text-red-600 focus:text-red-600"
                  >
                    Clear field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              name="importer_details"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <textarea
                    id="importer_details"
                    {...field}
                    placeholder="Enter importer information"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </FormControl>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
