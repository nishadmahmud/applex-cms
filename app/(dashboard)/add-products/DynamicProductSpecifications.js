"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import ReactSelect from "react-select";
import { useGetSpecificationsQuery } from "@/app/store/api/specificationApi";

export default function DynamicProductSpecifications({ setValue, watch }) {
  const isVisible = watch("is_specification");
  const { data: specificationsData } = useGetSpecificationsQuery(
    { per_page: 1000, page: 1 },
    { skip: !isVisible }, // only load when visible
  );

  const specificationOptions =
    specificationsData?.data?.data?.map((spec) => ({
      value: spec.id,
      label: spec.name,
      description: spec.description,
      values: spec.specification_values || [],
    })) || [];

  const [specifications, setSpecifications] = useState([]);
  const initializedRef = useRef(false);
  // Track whether the component itself is updating the form so we skip
  // the sync effect in that case (prevents infinite loop).
  const selfUpdatingRef = useRef(false);

  // Sync local state from form data. This covers:
  //   • edit-mode: form.reset() populates specifications before this component mounts
  //   • draft restore: sessionStorage draft is loaded into the form
  // We only run this once (on first meaningful data) to avoid overwriting
  // user edits made through the UI.
  const formSpecifications = watch("specifications");

  useEffect(() => {
    // Skip if this component itself just called setValue
    if (selfUpdatingRef.current) {
      selfUpdatingRef.current = false;
      return;
    }

    if (formSpecifications && formSpecifications.length > 0 && !initializedRef.current) {
      // Assign stable local IDs so React keys work correctly
      const withIds = formSpecifications.map((spec, idx) => ({
        ...spec,
        id: spec.id ?? idx + 1,
      }));
      setSpecifications(withIds);
      initializedRef.current = true;
    } else if (!initializedRef.current) {
      // First mount with no existing specs → show one empty row
      setSpecifications([{ id: 1, name: "", description: "" }]);
      initializedRef.current = true;
    }
  }, [formSpecifications]);

  const addSpecification = () => {
    const newId = Math.max(...specifications.map((v) => v.id)) + 1;
    const newSpecifications = [
      ...specifications,
      { id: newId, name: "", description: "" },
    ];
    setSpecifications(newSpecifications);

    const withoutId = newSpecifications.map(({ id, ...variant }) => variant);
    selfUpdatingRef.current = true;
    setValue("specifications", withoutId, { shouldValidate: true });
  };

  const removeSpecification = (id) => {
    if (specifications.length > 1) {
      const newSpecifications = specifications.filter(
        (specs) => specs.id !== id,
      );
      setSpecifications(newSpecifications);

      const withoutId = newSpecifications.map(({ id, ...specs }) => specs);
      selfUpdatingRef.current = true;
      setValue("specifications", withoutId, { shouldValidate: true });
    }
  };

  const updateSpecification = (id, field, value) => {
    const updatedSpecification = specifications.map((spec) =>
      spec.id === id ? { ...spec, [field]: value } : spec,
    );
    setSpecifications(updatedSpecification);
    const withoutId = updatedSpecification.map(
      ({ id, ...specifications }) => specifications,
    );
    selfUpdatingRef.current = true;
    setValue("specifications", withoutId, { shouldValidate: true });
  };

  const handleSelectSpecification = (selectedOption) => {
    if (selectedOption && selectedOption.values?.length > 0) {
      // Transform API’s `specification_values` → { name, description } pairs
      const prefilled = selectedOption.values.map((v, idx) => ({
        id: idx + 1,
        name: v.name,
        description: v.description,
      }));

      setSpecifications(prefilled);

      const withoutId = prefilled.map(({ id, ...rest }) => rest);
      selfUpdatingRef.current = true;
      setValue("specifications", withoutId, { shouldValidate: true });
    } else {
      // Clear all if deselected
      setSpecifications([{ id: 1, name: "", description: "" }]);
      selfUpdatingRef.current = true;
      setValue("specifications", [{ name: "", description: "" }], {
        shouldValidate: true,
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* --- Dropdown of pre‑created Specifications --- */}
      <div className="mb-4">
        <ReactSelect
          classNamePrefix="react-select"
          placeholder="Select a pre‑created specification..."
          isClearable
          isSearchable
          options={specificationOptions}
          onChange={handleSelectSpecification}
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              borderRadius: "0.5rem",
              minHeight: "38px",
              boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
              "&:hover": { borderColor: "#93c5fd" },
            }),
            menu: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </div>
      {specifications.map((specification, index) => (
        <div
          key={specification.id}
          className="grid grid-cols-12 gap-3 items-start"
        >
          {/* Title Field */}
          <div className="col-span-5">
            <Input
              placeholder={`Title ${index + 1}`}
              value={specification.name}
              onChange={(e) =>
                updateSpecification(specification.id, "name", e.target.value)
              }
              className="rounded-md border-gray-300"
            />
          </div>

          {/* Description Field */}
          <div className="col-span-6">
            <Textarea
              placeholder={`Description ${index + 1}`}
              value={specification.description}
              onChange={(e) =>
                updateSpecification(
                  specification.id,
                  "description",
                  e.target.value,
                )
              }
              className="rounded-md border-gray-300 min-h-[40px] resize-none"
              rows={1}
            />
          </div>

          {/* Remove Button */}
          <div className="col-span-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeSpecification(specification.id)}
              disabled={specifications.length === 1}
              className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          onClick={addSpecification}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
}
