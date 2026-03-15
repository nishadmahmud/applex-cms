// "use client";

// import React from "react";
// import AsyncSelect from "react-select/async";
// import { useState } from "react";
// import useVendorQuery from "@/apiHooks/hooks/useVendorQuery";
// import { useQueryClient } from "@tanstack/react-query";
// import debounce from "debounce";

// // eslint-disable-next-line react/prop-types
// export function VendorsList({
//   setOrderSchema,
//   selectedVendor,
//   setSelectedVendor,
// }) {
//   const [keyword, setKeyword] = useState("");
//   const { mutateAsync } = useVendorQuery({ keyword });
//   const queryClient = useQueryClient();

//   const handleChange = async (value) => {
//     setKeyword(value);
//     const cached = queryClient.getQueryData(["VendorSearchQuery", value]);
//     if (cached) {
//       return cached.data.data.map((item) => ({
//         value: item.id,
//         label: item.name,
//       }));
//     }

//     const res = await mutateAsync({ keyword: value });
//     return res.data.data.map((item) => ({
//       value: item.id,
//       label: item.name,
//     }));
//   };

//   const loadOptions = (inputValue) =>
//     new Promise((resolve) => {
//       debouncedFetch(inputValue, resolve);
//     });

//   const debouncedFetch = debounce(async (inputValue, cb) => {
//     const result = await handleChange(inputValue);
//     cb(result);
//   }, 600);

//   return (
//     <div className="w-full">
//       <AsyncSelect
//         cacheOptions
//         defaultOptions
//         value={selectedVendor}
//         loadOptions={loadOptions}
//         placeholder="Select Vendor"
//         onChange={(selected) => {
//           setSelectedVendor(selected);
//           setOrderSchema((prev) => ({
//             ...prev,
//             vendor_id: selected.value,
//             vendor_name: selected?.label,
//           }));
//         }}
//       />
//     </div>
//   );
// }

// import React, { useMemo, useState } from "react";
// import AsyncSelect from "react-select/async";
// import useVendorQuery from "@/apiHooks/hooks/useVendorQuery";
// import { useQueryClient } from "@tanstack/react-query";
// import debounce from "debounce";

// // eslint-disable-next-line react/prop-types
// export function VendorsList({
//   setOrderSchema,
//   selectedVendor,
//   setSelectedVendor,
//   placeholder = "Select Vendor",
// }) {
//   const [keyword, setKeyword] = useState("");
//   const { mutateAsync } = useVendorQuery({ keyword });
//   const queryClient = useQueryClient();

//   const handleChange = async (value) => {
//     setKeyword(value);
//     const cached = queryClient.getQueryData(["VendorSearchQuery", value]);
//     if (cached) {
//       return cached.data.data.map((item) => ({
//         value: item.id,
//         label: item.name,
//       }));
//     }

//     const res = await mutateAsync({ keyword: value });
//     return res.data.data.map((item) => ({
//       value: item.id,
//       label: item.name,
//     }));
//   };

//   const loadOptions = (inputValue) =>
//     new Promise((resolve) => {
//       debouncedFetch(inputValue, resolve);
//     });

//   const debouncedFetch = debounce(async (inputValue, cb) => {
//     const result = await handleChange(inputValue);
//     cb(result);
//   }, 600);

//   // 🔹 Normalize the value so placeholder + selection display correctly
//   const normalizedValue = useMemo(() => {
//     if (!selectedVendor) return null;

//     // Case 1: an existing react-select shape { value, label }
//     if (
//       typeof selectedVendor === "object" &&
//       "value" in selectedVendor &&
//       "label" in selectedVendor
//     ) {
//       return selectedVendor;
//     }

//     // Case 2: your original exchange shape { vendor_id, vendor_name }
//     if (selectedVendor?.vendor_id) {
//       return {
//         value: selectedVendor.vendor_id,
//         label: selectedVendor.vendor_name,
//       };
//     }

//     // Otherwise show placeholder
//     return null;
//   }, [selectedVendor]);

//   return (
//     <div className="w-full">
//       <AsyncSelect
//         cacheOptions
//         defaultOptions
//         value={normalizedValue}
//         loadOptions={loadOptions}
//         placeholder={placeholder}
//         onChange={(selected) => {
//           // Maintain existing Purchase behavior
//           setSelectedVendor?.(selected);

//           // Keep vendor_id/vendor_name synced for payload
//           setOrderSchema?.((prev) => ({
//             ...prev,
//             vendor_id: selected?.value || "",
//             vendor_name: selected?.label || "",
//           }));
//         }}
//         // 🔹 Force dropdown above everything
//         menuPortalTarget={
//           typeof document !== "undefined" ? document.body : null
//         }
//         menuPlacement="top"
//         menuPosition="fixed"
//         styles={{
//           menuPortal: (base) => ({ ...base, zIndex: 999999 }),
//           menu: (base) => ({ ...base, zIndex: 999999 }),
//         }}
//         isClearable
//       />
//     </div>
//   );
// }

"use client";

import React, { useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import useVendorQuery from "@/apiHooks/hooks/useVendorQuery";
import { useQueryClient } from "@tanstack/react-query";
import debounce from "debounce";

// eslint-disable-next-line react/prop-types
export function VendorsList({
  setOrderSchema,
  selectedVendor,
  setSelectedVendor,
  placeholder = "Select Vendor",
}) {
  const [keyword, setKeyword] = useState("");
  const { mutateAsync } = useVendorQuery({ keyword });
  const queryClient = useQueryClient();

  const handleChange = async (value) => {
    setKeyword(value);
    const cached = queryClient.getQueryData(["VendorSearchQuery", value]);
    if (cached) {
      return cached.data.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
    }

    const res = await mutateAsync({ keyword: value });
    return res.data.data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  };

  const debouncedFetch = debounce(async (inputValue, cb) => {
    const result = await handleChange(inputValue);
    cb(result);
  }, 600);

  const loadOptions = (inputValue) =>
    new Promise((resolve) => {
      debouncedFetch(inputValue, resolve);
    });

  // Normalize value so placeholder shows and newly-added vendor renders instantly
  const normalizedValue = useMemo(() => {
    if (!selectedVendor) return null;
    // react-select option shape
    if (selectedVendor.value && selectedVendor.label) return selectedVendor;
    // exchange shape { vendor_id, vendor_name }
    if (selectedVendor.vendor_id) {
      return {
        value: selectedVendor.vendor_id,
        label: selectedVendor.vendor_name,
      };
    }
    return null;
  }, [selectedVendor]);

  return (
    <div className="w-full">
      <AsyncSelect
        cacheOptions
        defaultOptions
        value={normalizedValue}
        loadOptions={loadOptions}
        placeholder={placeholder}
        onChange={(opt) => {
          // visual selection
          setSelectedVendor?.(opt);
          // payload-ready fields
          setOrderSchema?.((prev) => ({
            ...prev,
            vendor_id: opt?.value || "",
            vendor_name: opt?.label || "",
          }));
        }}
        // Make dropdown render above and in global portal
        menuPlacement="top"
        menuPosition="fixed"
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 999999 }),
          menu: (base) => ({ ...base, zIndex: 999999 }),
        }}
        isClearable
      />
    </div>
  );
}
