"use client";

import { React, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// --- UPDATE START: Import required Shadcn components and Lucide icons ---
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch"; // Added for Product Attributes toggle
import { Label } from "@/components/ui/label"; // Added for Product Attributes toggle label
// Lucide Icons for visual appeal (using the same set as the card example)
import {
  SquareGanttChart,
  Layers3,
  DollarSign,
  MoreHorizontal,
  Package,
  Grip,
} from "lucide-react";
// --- UPDATE END ---

import DynamicProductVariants from "./DynamicProductVariants";
import GeneralPart from "./GeneralPart";
import PricingSection from "./PricingSection";
import AdditionalFields from "./AdditionalFields";
import MediaFields from "./MediaFields";
import ProductDetailsFields from "./ProductDetailsFields";
import { useForm } from "react-hook-form";
// import { Form } from "@/components/ui/form"; // Already imported above
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import useProductList from "@/customHooks/useProductList";
import ProductAttributes from "./ProductAttributes";
import QuantityDiscountFields from "./QuantityDiscountFields";
import { Nunito } from "next/font/google";
import ProductTagSelector from "./ProductTagSelector";
import { useRouter } from "next/navigation";

const nunito = Nunito({
  subsets: ["latin"], // optional
});

const DRAFT_KEY_ADD = "Applex.add-product.draft";
const DRAFT_KEY_EDIT_PREFIX = "Applex.edit-product.draft.";
// Edit drafts are per productId so different products never share a draft.
// Draft is cleared on successful save, so re-opening edit shows API/saved data.

function getDraftKey(mode, productId) {
  return mode === "add" ? DRAFT_KEY_ADD : `${DRAFT_KEY_EDIT_PREFIX}${productId}`;
}

/** Make form values JSON-serializable (strip File instances so draft can be stored in sessionStorage). */
function serializableDraft(values) {
  return JSON.parse(
    JSON.stringify(values, (_, v) => (v instanceof File ? null : v))
  );
}

function getDraft(mode, productId) {
  if (typeof sessionStorage === "undefined") return null;
  const key = getDraftKey(mode, productId);
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setDraft(mode, productId, values) {
  if (typeof sessionStorage === "undefined") return;
  const key = getDraftKey(mode, productId);
  try {
    sessionStorage.setItem(key, JSON.stringify(serializableDraft(values)));
  } catch {
    // ignore quota or parse errors
  }
}

function clearDraft(mode, productId) {
  if (typeof sessionStorage === "undefined") return;
  const key = getDraftKey(mode, productId);
  try {
    sessionStorage.removeItem(key);
  } catch { }
}

export default function ProductFormFields({ product, mode = "add" }) {
  const [productColor, setProductColor] = useState("#000000");
  const [selectedImage, setSelectedImage] = useState({});
  const [clearUploader, setClearUploader] = useState(false);
  const [showProductItems, setShowProductItems] = useState(false);
  // --- UPDATE START: Add state to track all images (old URLs and new files) ---
  const [allImages, setAllImages] = useState([]);
  // --- UPDATE END ---
  const { data: session } = useSession();
  const { mutateProductList } = useProductList();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: "",
      product_type: "standard",
      description: "",
      serial: "",
      category_id: "",
      sub_category_id: "",
      brand_id: "",
      bundle_ids: [],
      unit_id: "",
      currency_id: "",
      image_path: "",
      image_path1: "",
      image_path2: "",
      image_paths: [], // Add for consistency
      purchase_price: 0,
      wholesale_price: 0,
      retails_price: 0,
      last_price: 0,
      regular_price: 0,
      discount_type: 0,
      discount: 0,
      warrenty: "",
      warranties_count: "",
      others: "",
      have_variant: 0,
      minimum_stock: 1,
      employee_incentive_amount: "",
      barcode: "",
      manufactory_date: "",
      expiry_date: "",
      is_ecommerce: false,
      color_code: "",
      code: "",
      is_specification: 0,
      specifications: [],
      color: "",
      have_product_variant: 0,
      product_variants: [],
      product_items: [], // Add this line
      is_variable_weight: 0,
      quantity: "0",
      quantity_discounts: [],
      tags: [],
      manufacturer_details: "",
      packer_details: "",
      seller_details: "",
      return_delivery_days: "",
      importer_details: "",
      international_exchange_rate: 0,
      product_cost: 0,
      size_chart_category_id: "",
      intl_retails_price: 0,
      stock_restrictions: true,
      meta_title: "",
      meta_description: "",
      // Newly added business fields
      pdf_file: "",
      pdf_file_raw: null,
      author_id: "",
      order_advance_amount: "",
      minimum_order: "",
      youtube_link: "",
      video_link: "",
      video_file_raw: null,
    },
  });

  const {
    register,
    handleSubmit,
    watch = form.watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = form;

  // Handle pre-filling form data when in edit mode (or restore unsaved draft)
  useEffect(() => {
    if (product && mode === "edit") {
      const draft = getDraft("edit", product.id);
      if (draft) {
        reset(draft);
        setShowProductItems((draft?.product_items?.length ?? 0) > 0);
        if (draft.color_code) setProductColor(draft.color_code);
        return;
      }

      // --- UPDATE START: Logic to fix the data mismatch ('items' vs 'product_items') ---
      let processedProduct = { ...product };
      if (
        Array.isArray(processedProduct?.items) &&
        !processedProduct?.product_items
      ) {
        processedProduct.product_items = processedProduct.items;
      }
      // --- UPDATE END ---

      reset({
        name: processedProduct.name || "",
        product_type: processedProduct.product_type || "standard",
        description: processedProduct.description || "",
        serial: processedProduct.serial || "",
        category_id: processedProduct.category_id || "",
        sub_category_id: processedProduct.sub_category_id || "",
        child_category_id: processedProduct.child_category_id || "",
        brand_id: processedProduct.brand_id || "",
        bundle_ids: processedProduct.bundle_ids || [],
        currency_id: processedProduct.currency_id || "",
        image_path: processedProduct.image_path || "",
        image_path1: processedProduct.image_path1 || "",
        image_path2: processedProduct.image_path2 || "",
        discount_type: processedProduct.discount_type || "",
        discount: processedProduct.discount || 0,
        warrenty: processedProduct.warrenty || "",
        warranties_count: processedProduct.warranties_count || "",
        quantity: processedProduct.quantity || "0",
        others: processedProduct.others || "",
        have_variant: processedProduct.have_variant || 0,
        minimum_stock: processedProduct.minimum_stock || 1,
        employee_incentive_amount:
          processedProduct.employee_incentive_amount || "",
        barcode: processedProduct.barcode || "",
        manufactory_date: processedProduct.manufactory_date || "",
        expiry_date: processedProduct.expiry_date || "",
        is_ecommerce: processedProduct.is_ecommerce || false,
        color_code: processedProduct.color_code || "",
        code: processedProduct.code || "",
        pdf_file: processedProduct.pdf_file || "",
        // Support both author_id and author.id from product-details API
        author_id:
          (processedProduct.author_id || processedProduct.author?.id) ?? "",
        order_advance_amount:
          processedProduct.order_advance_amount ?? "",
        minimum_order: processedProduct.minimum_order ?? "",
        youtube_link: processedProduct.youtube_link || "",
        video_link: processedProduct.video_link || "",
        manufacturer_details: processedProduct.manufacturer_details || "",
        packer_details: processedProduct.packer_details || "",
        seller_details: processedProduct.seller_details || "",
        return_delivery_days: processedProduct.return_delivery_days || "",
        importer_details: processedProduct.importer_details || "",
        size_chart_category_id: processedProduct.size_chart_category_id || "",
        intl_retails_price: processedProduct.intl_retails_price || 0,
        international_exchange_rate:
          processedProduct.international_exchange_rate || 0,
        product_cost: processedProduct.product_cost || 0,
        is_specification: processedProduct.is_specification || 0,
        color: processedProduct.color || "",
        have_product_variant: processedProduct.have_product_variant || 0,
        stock_restrictions:
          processedProduct.stock_restrictions !== undefined
            ? Boolean(processedProduct.stock_restrictions)
            : true, // ✅ default to true if missing
        product_variants: Array.isArray(processedProduct?.product_variants)
          ? processedProduct.product_variants.map((v) => ({
            ...v,
            variant_id: v.id,              // 👈 store backend id as variant_id
            child_product_variants: Array.isArray(v.child_variants)
              ? v.child_variants
              : [],
          }))
          : [],
        // Update the existing reset call using the processed product
        product_items: Array.isArray(processedProduct?.product_items)
          ? processedProduct.product_items
          : [],
        is_variable_weight: processedProduct.is_variable_weight || 0,
        specifications: Array.isArray(processedProduct?.specifications)
          ? processedProduct.specifications
          : [],
        productId: processedProduct?.id,
        quantity_discounts: Array.isArray(processedProduct?.quantity_discounts)
          ? processedProduct.quantity_discounts.map((qd) => ({
            ...qd,
            // Ensure value is a string/number depending on API expectation
            discount_value: qd.discount_value
              ? String(qd.discount_value)
              : qd.discount_value,
          }))
          : [],
        tags: Array.isArray(processedProduct?.tags)
          ? processedProduct.tags.map((tag) => tag.id)
          : [],
        meta_title: processedProduct.meta_title || "",
        meta_description: processedProduct.meta_description || "",
      });

      // --- UPDATE START: Use the processedProduct to set the checkbox state correctly ---
      setShowProductItems(processedProduct?.product_items?.length > 0); // Add this line
      // --- UPDATE END ---

      setTimeout(() => {
        form.setValue("product_type", processedProduct?.product_type);
        form.setValue(
          "have_variant",
          Boolean(processedProduct?.have_variant == 1),
        );
        form.setValue(
          "have_product_variant",
          Boolean(processedProduct?.have_product_variant == 1),
        );
        form.setValue("is_ecommerce", Boolean(processedProduct?.is_ecommerce));
        form.setValue(
          "is_specification",
          Boolean(processedProduct?.is_specification == 1),
        );
        form.setValue(
          "is_variable_weight",
          Boolean(processedProduct?.is_variable_weight == 1),
        );
        form.setValue("unit_id", processedProduct?.unit_id);
        form.setValue("retails_price", processedProduct?.retails_price);
        form.setValue("last_price", processedProduct?.last_price);
        form.setValue("regular_price", processedProduct?.retails_price);
        form.setValue("wholesale_price", processedProduct?.wholesale_price);
        form.setValue("purchase_price", processedProduct?.purchase_price);
        form.setValue("currency_id", processedProduct?.currency_id || "");
        form.setValue(
          "international_exchange_rate",
          processedProduct?.international_exchange_rate || 0,
        );
        form.setValue("product_cost", processedProduct?.product_cost || 0);
        // form.setValue("product_variants", Array.isArray(product?.variants) ? product.variants : []);
      }, 0);

      // Set additional state values
      if (processedProduct.color_code) {
        setProductColor(processedProduct.color_code);
      }
    }
  }, [product, mode, reset, setShowProductItems, form]);

  // Restore add-product draft when returning to the page
  useEffect(() => {
    if (mode !== "add") return;
    const draft = getDraft("add", null);
    if (draft && Object.keys(draft).length > 0) {
      reset(draft);
      setShowProductItems((draft?.product_items?.length ?? 0) > 0);
      if (draft.color_code) setProductColor(draft.color_code);
    }
  }, [mode, reset, setShowProductItems]);

  // Persist form to sessionStorage so it survives tab switch / navigation
  const watched = watch();
  useEffect(() => {
    const id = setTimeout(() => {
      setDraft(mode, mode === "edit" ? product?.id : null, getValues());
    }, 500);
    return () => clearTimeout(id);
  }, [watched, mode, product?.id, getValues]);

  const handleProductItemsToggle = (checked) => {
    setShowProductItems(checked);
    if (!checked) {
      setValue("product_items", []); // Clear the array when unchecked
    }
  };

  const imageHandler = async (image) => {
    const imageData = new FormData();
    imageData.append("file_name", image);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/file-upload`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );
      return res.data.path;
    } catch (error) {
      console.log(error);
    }
  };

  // --- UPDATE START: Modify handler to accept files as an argument ---
  const multipleImageHandler = async (filesToUpload) => {
    // If there are no new files, no need to call the API.
    if (!filesToUpload || filesToUpload.length === 0) {
      return [];
    }

    const imageData = new FormData();
    filesToUpload.forEach((file) => {
      imageData.append("pictures[]", file);
    });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/multiple-file-upload`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res?.data?.path?.length) {
        return res.data.path.map((img) => img.path);
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  // --- UPDATE END ---

  const onSubmit = async (data) => {
    // --- UPDATE START: New logic to correctly handle image paths ---
    // 1. Get URLs of existing images that were NOT removed.
    const existingImageUrls = allImages
      .filter((img) => !img.file && img.preview) // 'file' is null for existing images
      .map((img) => img.preview);

    // 2. Get only the NEW file objects that need to be uploaded.
    const newFilesToUpload = allImages
      .filter((img) => img.file) // 'file' exists only for new images
      .map((img) => img.file);

    // 3. Upload ONLY the new files and get their paths.
    const newlyUploadedPaths = await multipleImageHandler(newFilesToUpload);

    // 4. Combine the old and new paths into the final list.
    const finalImagePaths = [...existingImageUrls, ...newlyUploadedPaths];

    // ✅ FIRST image goes into image_path as main image (if any exist)
    const mainImage = finalImagePaths.length > 0 ? finalImagePaths[0] : "";

    // 5. Handle queued PDF / video uploads (only on save).
    const values = getValues();

    let pdfPath = values.pdf_file || "";
    const pdfFile = values.pdf_file_raw;
    if (pdfFile instanceof File) {
      try {
        const fd = new FormData();
        fd.append("file_name", pdfFile);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/file-upload`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        if (res?.data?.path) {
          pdfPath = res.data.path;
        }
      } catch (err) {
        console.error("PDF upload failed", err);
      }
    }

    let videoPath = values.video_link || "";
    const videoFile = values.video_file_raw;
    if (videoFile instanceof File) {
      try {
        const fd = new FormData();
        fd.append("file_name", videoFile);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/file-upload`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        if (res?.data?.path) {
          videoPath = res.data.path;
        }
      } catch (err) {
        console.error("Video upload failed", err);
      }
    }

    const {
      pdf_file_raw,
      video_file_raw,
      ...cleanValues
    } = values;

    // 6. Construct the final payload for the API.
    const updatedData = {
      ...cleanValues,
      currency_id: getValues().currency_id,
      international_exchange_rate: Number(
        getValues().international_exchange_rate,
      ),
      stock_restrictions: Boolean(getValues().stock_restrictions),
      product_cost: Number(getValues().product_cost),
      image_path: mainImage, // 👈 add this line
      image_paths: finalImagePaths, // keep array intact
      pdf_file: pdfPath,
      video_link: videoPath,
      // Ensure author_id is always sent for save/update (product-details API should return it)
      author_id: getValues().author_id || cleanValues.author_id || null,
      product_variants: getValues().product_variants.map(({ variant_id, ...rest }) => {
        const variant = { ...rest };
        if (variant_id) variant.id = variant_id; // only include id in edit mode
        return variant;
      }),
    };
    // --- UPDATE END ---

    try {
      let url;
      url =
        mode === "add"
          ? `${process.env.NEXT_PUBLIC_API}/save-product`
          : `${process.env.NEXT_PUBLIC_API}/update-product`;

      const res = await axios.post(url, updatedData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (res.status === 200) {
        // Clear draft so next time user opens add/edit they see fresh or API data, not old draft
        clearDraft(mode, mode === "edit" ? product?.id : null);
        if (mode === "add") {
          form.reset();
          reset({});
          setProductColor("#000000"); // Reset color picker
          setSelectedImage({}); // Reset currently selected single image
          setClearUploader(true); // Flag MediaFields component to clear uploads
          setShowProductItems(false); // Hide the Product Attributes section
          setAllImages([]); // Clear the array of all images (new and old)

          toast.success("Product Created Successfully");
        } else {
          toast.success("Product Updated Successfully");
        }
        mutateProductList(); // revalidate / refetch product listing
        router.push("/products");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form
      {...form}
      className={`max-w-7xl mx-auto p-4 md:p-6 bg-white min-h-screen ${nunito.className}`}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Professional Page Header */}
        <div className="mb-6 pb-2 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <Grip className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column (Main Form - Panel Layout) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. General Section (Replaced Accordion Item with a Card/Panel) */}
            <div className="rounded-xl border border-gray-200 p-6 shadow-lg bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                <SquareGanttChart className="w-5 h-5 text-blue-600" />
                General Information
              </h3>
              <GeneralPart
                errors={errors}
                form={form}
                product={product}
                mode={mode}
                imageHandler={imageHandler}
                multipleImageHandler={multipleImageHandler}
              />
              <div className="mt-6 pt-6 border-t border-gray-100">
                <ProductTagSelector form={form} />
              </div>
            </div>

            {/* 2. Variation & Attributes Section (Grouped into one Card/Panel) */}
            <div className="rounded-xl border border-gray-200 p-6 shadow-lg bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                <Layers3 className="w-5 h-5 text-blue-600" />
                Product Variation & Attributes
              </h3>

              {/* Variation Component */}
              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-800 mb-3 border-l-4 border-blue-200 pl-3">
                  Product Variants / Specifications
                </h4>
                <DynamicProductVariants
                  setValue={setValue}
                  watch={watch}
                  form={form}
                  getVariant={
                    product?.product_variants?.length
                      ? product.product_variants?.length
                      : null
                  }
                  getSpecifications={
                    product?.specifications?.length
                      ? product?.specifications?.length
                      : null
                  }
                />
              </div>

              {/* Product Attributes Component */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  {/* --- UPDATE START: Replace input[type=checkbox] with Shadcn Switch component --- */}
                  <Switch
                    id="productItemsToggle"
                    checked={showProductItems}
                    onCheckedChange={handleProductItemsToggle}
                  />
                  <Label
                    htmlFor="productItemsToggle"
                    className="text-base font-semibold text-gray-800 cursor-pointer"
                  >
                    Has Product Attributes
                  </Label>
                  {/* --- UPDATE END --- */}
                </div>

                {showProductItems && (
                  <ProductAttributes
                    setValue={setValue}
                    watch={watch}
                    form={form}
                    getProductItems={
                      product?.product_items?.length
                        ? product.product_items?.length
                        : null
                    }
                  />
                )}
              </div>
            </div>

            {/* 3. Pricing & Discount Section (Replaced Accordion Item with a Card/Panel) */}
            <div className="rounded-xl border border-gray-200 p-6 shadow-lg bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Pricing & Discounts
              </h3>

              <PricingSection
                form={form}
                watch={watch}
                setValue={setValue}
                register={register}
                getValues={getValues}
              />

              {/* Quantity Discount Component */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-base font-semibold text-gray-800 mb-3 border-l-4 border-blue-200 pl-3">
                  Quantity Discounts (Packs)
                </h4>
                <QuantityDiscountFields form={form} product={product} />
              </div>
            </div>

            {/* 4. Additional Fields Section (Replaced Accordion Item with a Card/Panel) */}
            <div className="rounded-xl border border-gray-200 p-6 shadow-lg bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                <MoreHorizontal className="w-5 h-5 text-blue-600" />
                Additional Information
              </h3>
              <AdditionalFields
                setValue={setValue}
                register={register}
                form={form}
                productColor={productColor}
                setProductColor={setProductColor}
                fileUploadHandler={imageHandler}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className={`space-y-6 ${nunito.className}`}>
            {/* Media - Given a professional container */}
            <div className="rounded-xl border border-gray-200 p-6 shadow-lg bg-white sticky top-4">
              <h3 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" /> Product Media
              </h3>
              <MediaFields
                clearUploader={clearUploader}
                setClearUploader={setClearUploader}
                register={register}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                mode={mode}
                product={product}
                productImages={product?.image_paths || []}
                // --- UPDATE START: Pass the new state handler to the child ---
                onAllImagesChange={setAllImages}
              // --- UPDATE END ---
              />
            </div>

            {/* Product Details */}
            {/* <ProductDetailsFields
                  errors={errors}
                  imageHandler={imageHandler}
                  form={form}
                  /> */}
          </div>
        </div>

        {/* Sticky Action Buttons Footer (New styling for professional look) */}
        <div className="sticky bottom-0 left-0 right-0 p-4 mt-8 bg-white border-t border-gray-200 shadow-xl z-10">
          <div className="flex justify-center gap-6">
            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-md transition-all font-medium"
            >
              Cancel
            </Button>

            {/* Save / Update Button */}
            <Button
              type="submit"
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
            >
              {mode === "add" ? "Save Product" : "Update Product"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
