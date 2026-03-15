/* eslint-disable react/prop-types */
"use client";

import React, { useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, ArrowLeft, LoaderCircle } from "lucide-react";
import useProduct from "@/apiHooks/hooks/useProduct";
import useCategory from "@/apiHooks/hooks/useCategory";
import dynamic from "next/dynamic";
import useSubcategory from "@/apiHooks/hooks/useSubcategory";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addCampaign, handleImageUpload } from "@/lib/actions";
import { components } from "react-select";
import SelectedList from "./SelectedList";
import useChildCategory from "@/apiHooks/hooks/useChildCategory";
import ProtectedRoute from "@/components/ProtectedRoute";
const AsyncSelect = dynamic(() => import("react-select"), { ssr: false });

export default function CampaignPage() {
  const [query, setQuery] = useState({});
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef(null);
  const imageRef = useRef(null);
  const router = useRouter();

  const { data: products, searchProducts } = useProduct();
  const { getCategories, searchCategories } = useCategory(query?.category);
  const { getSubcategories, searchSubcategories } = useSubcategory(
    query?.subcategory
  );
  const { getChildCategories, searchChildCategories } = useChildCategory(
    query?.childcategory
  );

  const [formData, setFormData] = useState({
    name: "",
    status: "",
    description: "",
    discount_type: "",
    discount: 0,
    start_at: "",
    end_at: "",
    bg_image: "",
    products: [],
    categories: [],
    sub_categories: [],
    child_categories: [],
  });

  const removeSelection = (id, selection, setSelection) => {
    setSelection(selection.filter((item) => item.value !== id));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchInput = (value, type) => {
    setQuery((prev) => ({
      ...prev,
      [type]: value,
    }));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (type === "product") {
        await handleSearch(value);
      }
    }, 600);
  };

  const handleSearch = async (query) => {
    await searchProducts.mutateAsync(query);
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const formData = new FormData();
      formData.append("file_name", file);
      try {
        const res = await handleImageUpload(formData);
        setFormData((prev) => ({
          ...prev,
          bg_image: res,
        }));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const options =
    query?.product && searchProducts?.data
      ? searchProducts?.data?.data?.data.map((item) => ({
          value: item.id,
          label: item.name,
          image_path: item.image_path,
          type: "product",
          discount_type: "percentage",
          sku: item.sku,
        }))
      : products?.data && products?.data?.data?.data?.length
      ? products?.data?.data?.data?.map((item) => ({
          value: item.id,
          label: item.name,
          image_path: item.image_path,
          type: "product",
          discount_type: "percentage",
          sku: item.sku,
        }))
      : [];

  const categoryOptions =
    query?.category &&
    searchCategories?.data &&
    searchCategories?.data?.data?.length
      ? searchCategories.data.data.map((item) => ({
          value: item.id,
          label: item.name,
          type: "category",
          discount_type: "percentage",
        }))
      : getCategories?.data && getCategories?.data?.data?.data?.length
      ? getCategories?.data?.data?.data?.map((item) => ({
          value: item.id,
          label: item.name,
          type: "category",
          discount_type: "percentage",
        }))
      : [];

  const subCategoryOptions =
    query?.subcategory &&
    searchSubcategories?.data &&
    searchSubcategories?.data?.data?.length
      ? searchSubcategories?.data?.data.map((item) => ({
          value: item.id,
          label: item.name,
          type: "subcategory",
          discount_type: "percentage",
        }))
      : getSubcategories?.data
      ? getSubcategories?.data?.data?.data.map((item) => ({
          value: item.id,
          label: item.name,
          type: "subcategory",
          discount_type: "percentage",
        }))
      : [];

  const childCategoryOptions =
    query?.childcategory &&
    searchChildCategories?.data &&
    searchChildCategories?.data?.child_categories?.length
      ? searchChildCategories.data.child_categories.map((item) => ({
          label: item.name,
          value: item.id,
          type: "child-category",
          discount_type: "percentage",
        }))
      : getChildCategories?.data &&
        getChildCategories?.data?.child_categories?.length
      ? getChildCategories.data.child_categories.map((item) => ({
          label: item.name,
          value: item.id,
          type: "child-category",
          discount_type: "percentage",
        }))
      : [];

  const selectedCategories = useMemo(() => {
    return selected.filter((item) => item.type === "category");
  }, [selected]);

  const selectedSubCategories = useMemo(() => {
    return selected.filter((item) => item.type === "subcategory");
  }, [selected]);

  const selectedChildCategories = useMemo(() => {
    return selected.filter((item) => item.type === "child-category");
  }, [selected]);

  const selectedProducts = useMemo(() => {
    return selected.filter((item) => item.type === "product");
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const onlyProductIds = selectedProducts.map((item) =>
      item.discount
        ? {
            id: item.value,
            discount_type: item.discount_type,
            discount: item.discount,
          }
        : { id: item.value }
    );
    const onlyCategoryIds = selectedCategories.map((item) =>
      item.discount
        ? {
            id: item.value,
            discount_type: item.discount_type,
            discount: item.discount,
          }
        : { id: item.value }
    );
    const onlySubIds = selectedSubCategories.map((item) =>
      item.discount
        ? {
            id: item.value,
            discount_type: item.discount_type,
            discount: item.discount,
          }
        : { id: item.value }
    );
    const onlyChildIds = selectedChildCategories.map((item) =>
      item.discount
        ? {
            id: item.value,
            discount_type: item.discount_type,
            discount: item.discount,
          }
        : { id: item.value }
    );

    const payload = new FormData();

    payload.append("products", JSON.stringify(onlyProductIds));
    payload.append("categories", JSON.stringify(onlyCategoryIds));
    payload.append("sub_categories", JSON.stringify(onlySubIds));
    payload.append("child_categories", JSON.stringify(onlyChildIds));

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key === "products" ||
        key === "categories" ||
        key === "sub_categories" ||
        key === "child_categories"
      ) {
        return;
      }
      payload.append(key, value);
    });

    startTransition(async () => {
      try {
        const res = await addCampaign(payload);
        if (res?.success) {
          toast.success(res.message);
        } else {
          toast.error(
            `${res.message} ${
              res.product_name ? res.product_name.map((item) => item) : ""
            }`
          );
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const CustomOption = (props) => {
    // console.log(props)
    return (
      <components.Option {...props}>
        <div className="grid grid-cols-3  place-content-center">
          <img
            src={props.data.image_path}
            alt={props.data.label}
            className="w-6 h-6 rounded-full"
          />
          <p>{props.data.label}</p>
          <p>{props.data.sku}</p>
        </div>
      </components.Option>
    );
  };

  // Custom SingleValue renderer
  const CustomSingleValue = (props) => (
    <components.SingleValue {...props}>
      <div className="grid grid-cols-3 place-content-center">
        <img
          src={props.data.image_path}
          alt={props.data.label}
          className="w-6 h-6 rounded-full"
        />
        <p>{props.data.label}</p>
        <p>{props.data.sku}</p>
      </div>
    </components.SingleValue>
  );

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Campaigns">
      <>
        <div className="flex justify-between items-center mb-5">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    id="name"
                    placeholder="Enter campaign name"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="active">
                        Active
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  id="description"
                  placeholder="Enter campaign description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
              <CardDescription>
                Set up your discount type and amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discount-type">Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) =>
                      handleChange("discount_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">
                    Discount Value *{" "}
                    {formData.discount_type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    value={formData.discount}
                    id="discount"
                    type="number"
                    min="0"
                    step={
                      formData.discount_type === "percentage" ? "0.01" : "0.01"
                    }
                    placeholder={
                      formData.discount_type === "percentage"
                        ? "e.g., 15"
                        : "e.g., 25.00"
                    }
                    onChange={(e) => handleChange("discount", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>
                Set the start and end dates for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    value={formData.start_at}
                    onChange={(e) => handleChange("start_at", e.target.value)}
                    id="start-date"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date *</Label>
                  <Input
                    value={formData.end_at}
                    onChange={(e) => handleChange("end_at", e.target.value)}
                    id="end-date"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Image */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Image</CardTitle>
              <CardDescription>
                Upload a background image for your campaign (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                aria-label="button"
                onClick={() => imageRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                {preview ? (
                  <div className="relative h-52">
                    <Image
                      src={preview}
                      alt="preview"
                      fill={true}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, JPG, GIF, WebP, SVG (max 3MB)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={imageRef}
                  onChange={handleImage}
                  type="file"
                  accept=".jpeg,.png,.jpg,.gif,.webp,.svg"
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Product Targeting</CardTitle>
              <CardDescription>
                Select specific products, categories, or subcategories for this
                campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <Label>Categories</Label>
                <AsyncSelect
                  onInputChange={(value) => {
                    handleSearchInput(value, "category");
                  }}
                  options={categoryOptions}
                  isLoading={searchCategories?.isLoading}
                  onChange={(value) => {
                    if (
                      !selectedCategories.some(
                        (item) => Number(item.value) === Number(value.value)
                      )
                    ) {
                      setSelected([...selected, value]);
                    } else {
                      toast.error("already added");
                    }
                  }}
                />
                {selectedCategories.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((item, idx) => {
                        return (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {item?.label}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removeSelection(
                                  item.value,
                                  selected,
                                  setSelected
                                )
                              }
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Sub Categories */}
              <div className="space-y-3">
                <Label>Sub Categories</Label>
                <AsyncSelect
                  onInputChange={(value) => {
                    handleSearchInput(value, "subcategory");
                  }}
                  isLoading={searchSubcategories?.isLoading}
                  options={subCategoryOptions}
                  onChange={(value) => {
                    if (
                      !selectedSubCategories.some(
                        (item) => Number(item.value) === Number(value.value)
                      )
                    ) {
                      setSelected([...selected, value]);
                    } else {
                      toast.error("already added");
                    }
                  }}
                />
                {selectedSubCategories.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubCategories.map((item, idx) => {
                        return (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {item?.label}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removeSelection(
                                  item?.value,
                                  selected,
                                  setSelected
                                )
                              }
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Child Categories */}
              <div className="space-y-3">
                <Label>Child Categories</Label>
                <AsyncSelect
                  onInputChange={(value) => {
                    handleSearchInput(value, "childcategory");
                  }}
                  options={childCategoryOptions}
                  isLoading={searchChildCategories?.isLoading}
                  onChange={(value) => {
                    if (
                      !selectedChildCategories.some(
                        (item) => Number(item.value) === Number(value.value)
                      )
                    ) {
                      setSelected([...selected, value]);
                    } else {
                      toast.error("already added");
                    }
                  }}
                />
                {selectedChildCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedChildCategories.map((item, idx) => {
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {item?.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              removeSelection(item.value, selected, setSelected)
                            }
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="space-y-3">
                <Label>Products</Label>
                <AsyncSelect
                  onInputChange={(value) => {
                    handleSearchInput(value, "product");
                  }}
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
                  options={options}
                  isLoading={searchProducts?.isPending}
                  onChange={(value) => {
                    if (
                      !selectedProducts.some(
                        (item) => item.value === value.value
                      )
                    ) {
                      setSelected([...selected, value]);
                    } else {
                      toast.error("already error");
                    }
                  }}
                />
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((item, idx) => {
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {item?.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              removeSelection(item.value, selected, setSelected)
                            }
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* selected list */}
          {selected.length ? (
            <SelectedList
              list={selected}
              onRemove={removeSelection}
              selected={selected}
              setSelected={setSelected}
            />
          ) : (
            ""
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pb-5">
            <Button
              disabled={isPending}
              type="submit"
              className={`sm:w-auto ${isPending ? "bg-black/50" : ""}`}
            >
              {isPending && (
                <LoaderCircle className="animate-spin transition-transform duration-500" />
              )}{" "}
              Create Campaign
            </Button>
          </div>
        </form>
      </>
    </ProtectedRoute>
  );
}
