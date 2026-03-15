"use client";

import {
  Barcode,
  Battery,
  DollarSign,
  Globe,
  HardDrive,
  Hash,
  Package,
  Search,
} from "lucide-react";
import { ImPriceTags } from "react-icons/im";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import usePurchaseSearchQuery from "@/apiHooks/usePurchaseSearchQuery";
import { useQueryClient } from "@tanstack/react-query";
import useSound from "use-sound";
import useExchangeManager from "./exchange/useExchangeManager";

// 🆕 Helper to fire variant modal for exchange products
const openExchangeVariantModal = (productId) => {
  window.dispatchEvent(
    new CustomEvent("OPEN_EXCHANGE_VARIANT", { detail: productId }),
  );
};

// eslint-disable-next-line react/prop-types
const ScrollListWithSearch = ({
  orderList,
  setOrderList,
  discountRef,
  type,
}) => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState([0, null]);

  const { exchangeSelection, handleToggleExchange } = useExchangeManager({
    orderList,
    setOrderList,
  });

  const itemRefs = useRef([]);
  const debounceRef = useRef(null);
  const popupRef = useRef(null);
  const inputRef = useRef(null);

  // Direct api call to avoid RTK endpoint collision with imeiSerialReportApi
  const searchProduct = async (payload) => {
    const res = await api.post('/search-product?page=1&limit=40', payload);
    return res.data;
  };
  const { mutateAsync } = usePurchaseSearchQuery();

  const handleChange = (e) => {
    setIsOpen(true);
    setSearchTerm(e.target.value);
    const keyword = e.target.value;

    const cached = queryClient.getQueryData(["PurchaseSearchQuery", keyword]);
    if (cached) {
      setResults(cached.data);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (keyword === "") {
        setResults([]);
        setIsOpen(false);
      } else {
        if (type) {
          // Purchase search
          const res = await mutateAsync({ keyword });
          setResults(res.data);
        } else {
          // Sales search
          const res = await searchProduct({ keyword });
          setResults(res.data.data);
          // 🧠 Auto-add logic for scanned IMEI/barcode (without affecting anything else)
          try {
            // Only trigger auto-add if exactly one product found
            if (Array.isArray(res.data.data) && res.data.data.length === 1) {
              const product = res.data.data[0];
              const kw = keyword?.trim();

              // 1️⃣ Check exact Product Barcode or SKU or ID
              if (
                product.barcode === kw ||
                product.sku === kw ||
                String(product.id) === kw
              ) {
                addToCart(product);
                setSearchTerm("");
                setIsOpen(false);
                return;
              }

              // 2️⃣ Check IMEI products
              if (product?.imeis?.length > 0) {
                const matchedIndex = product.imeis.findIndex(
                  (imei) => imei?.imei === kw || imei?.barcode === kw,
                );

                if (matchedIndex !== -1) {
                  addToCart(product, matchedIndex);
                  setSearchTerm("");
                  setIsOpen(false);
                  return;
                }
              }

              // 3️⃣ Check Product Variants (if applicable)
              if (product.have_product_variant && product.product_variants) {
                // Find variant with matching barcode
                const vIndex = product.product_variants.findIndex(
                  (v) => v.barcode === kw || v.sku === kw,
                );

                if (vIndex !== -1) {
                  // If found, we need to pass (product, vIndex, cIndex, ..., isProductVariant=true)
                  // addToCart signature: (product, index, cIndex, isPurchaseChild, isSaleChild, isProductVariant)
                  // For variant add: addToCart(product, vIndex, null, false, false, true)
                  addToCart(product, vIndex, null, false, false, true);
                  setSearchTerm("");
                  setIsOpen(false);
                  return;
                }

                // Also check child variants if deeply nested (optional, based on data structure)
                // If needed, we can iterate product.product_variants[i].child_variants
                for (let i = 0; i < product.product_variants.length; i++) {
                  const variant = product.product_variants[i];
                  if (variant.child_variants?.length) {
                    const cIndex = variant.child_variants.findIndex(cv => cv.barcode === kw || cv.sku === kw);
                    if (cIndex !== -1) {
                      // Found in child variant
                      // addToCart(product, i, cIndex, false, false, true)
                      addToCart(product, i, cIndex, false, false, true);
                      setSearchTerm("");
                      setIsOpen(false);
                      return;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.warn("Auto-add failed gracefully:", error);
          }
        }
      }
    }, 700);
  };

  // Focus next field (discount) on Enter when list is closed

  const [playDeleteSound] = useSound("/sounds/add-to-cart-sound.mp3", {
    volume: 5, // adjust sound strength
    interrupt: true, // restart sound immediately if clicked fast
  });

  // 🆕  When user clicks the Exchange checkbox
  const handleInstantExchangeAdd = (product) => {
    // ❌ prevent duplicates
    const already = orderList.find((p) => p.id === product.id && p.is_exchange);
    if (already) {
      toast.warning(`${product.name} already marked as exchange.`);
      return;
    }

    // ✅ Build the base row exactly like purchase logic
    const newRow = {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      stock: product.current_stock ?? 0,
      qty: 1,
      price: parseFloat(product.purchase_price) || 0,
      have_variant: product.have_variant ? 1 : 0,
      items_values: product.items_values || [],
      purchase_price: parseFloat(product.purchase_price) || 0,
      is_exchange: true,
    };

    // ✅ Add immediately to cart
    setOrderList((prev) => [...prev, newRow]);
    toast.success(`${product.name} added as Exchange item`);

    // ✅ Trigger variant modal automatically if needed
    if (product.have_variant) {
      openExchangeVariantModal(product.id);
    }
  };

  const addToCart = (
    product,
    index = null,
    cIndex = null,
    isPurchaseChild = false,
    isSaleChild = false,
    isProductVariant = false,
  ) => {
    let cart;
    const isExist = orderList.find((item) => item.id == product.id) || null;

    // // ✅ Only run stock checks for SALES mode
    // if (!type) {
    //   if (isExist?.qty >= product.current_stock || product.current_stock < 1) {
    //     toast.error("Out of stock");
    //     return;
    //   }
    // }

    // ✅ Only run stock checks for SALES mode
    // 🆕 Skip stock checks entirely if stock_restrictions is false/0
    if (
      !type &&
      product.stock_restrictions !== 0 &&
      product.stock_restrictions !== false
    ) {
      if (isExist?.qty >= product.current_stock || product.current_stock < 1) {
        toast.error("Out of stock");
        return;
      }
    }

    // ✅ Case 1: Sales IMEI child (sales with variants by IMEI)
    if (!type && index !== null && product.imeis?.length) {
      const imeiData = product.imeis[index];

      // 🟩 Step 1: check if this IMEI already exists in cart
      const alreadyInCart = orderList.some(
        (item) => item.imei_id === imeiData.id,
      );
      if (alreadyInCart) {
        toast.error("This IMEI product is already added to the order list");
        return; // stop right here
      }

      // 🟩 Step 2: check stock
      if (!imeiData.in_stock || product.current_stock < 1) {
        toast.error("Out of stock!");
        return;
      }

      // 🟩 Step 3: continue with normal add
      cart = {
        id: product.id,
        imei_id: imeiData.id,
        name: product.name,
        barcode: imeiData.barcode,
        stock: product.current_stock - 1,
        qty: 1,
        price: imeiData.sale_price,
        subtotal: imeiData.sale_price,
        imei_purchase_price:
          parseFloat(imeiData.purchase_price) || product.purchase_price || 0,
        imei_details: {
          imei: imeiData.imei,
          color: imeiData.color,
          storage: imeiData.storage,
          battery: imeiData.battery_health || imeiData.battery,
          last_price: imeiData.last_price || "",
          sale_price: imeiData.sale_price || "",
          purchase_price: imeiData.purchase_price || "",
        },
        is_exchange: exchangeSelection[product.id] ? true : false,
        product_serial: product?.serial || "",
        last_price: product?.last_price || "",
        stock_restrictions:
          product.stock_restrictions === 0 ||
            product.stock_restrictions === false
            ? 0
            : 1,
      };

      playDeleteSound();
    }

    // ✅ Case 2: Sales mode selecting an items_values variant
    else if (!type && isSaleChild) {
      const child = product.items_values[index];
      cart = {
        id: product.id,
        child_id: child.id,
        name: `${product.name} - ${child.color?.join(", ") || ""} ${child.storage?.join("/") || ""
          }`,
        barcode: child.barcode,
        stock: child.quantity ?? product.current_stock ?? 0,
        qty: 1,
        price: parseFloat(child.sell_price) || product.retails_price || 0, // selling (retail) price
        subtotal: parseFloat(child.sell_price) || 0,
        have_variant: true,
        items_values: [], // keep empty here
        child_sell_price: parseFloat(child.sell_price) || 0, // ✅ reference for variant’s sell price
        child_purchase_price: parseFloat(child.purchase_price) || 0, // ✅ reference for variant’s purchase price (edit payload)
        is_exchange: exchangeSelection[product.id] ? true : false,
        product_serial: product?.serial || "",
        last_price: product?.last_price || "",
        stock_restrictions:
          product.stock_restrictions === 0 ||
            product.stock_restrictions === false
            ? 0
            : 1,
      };
      playDeleteSound();
    }

    // ✅ Case 3: Purchase mode selecting `items_values`
    else if (type && isPurchaseChild) {
      const child = product.items_values[index];
      cart = {
        id: product.id,
        child_id: child.id,
        name: `${product.name} - ${child.color?.join(", ")} ${child.storage?.join("/") || ""
          }`,
        barcode: child.barcode,
        stock: child.quantity ?? 0, // backend may send null
        qty: 1,
        price: parseFloat(child.purchase_price) || 0, // purchase price (what you pay)
        child_sell_price: parseFloat(child.sell_price) || 0, // ✅ retail price reference
        subtotal: parseFloat(child.purchase_price) || 0,
        have_variant: true,
        child_purchase_price: parseFloat(child.purchase_price) || 0, // ✅ store purchase price variant
        is_exchange: exchangeSelection[product.id] ? true : false,
        product_serial: product?.serial || "",
        stock_restrictions:
          product.stock_restrictions === 0 ||
            product.stock_restrictions === false
            ? 0
            : 1,
      };
      playDeleteSound();
    }

    // ✅ Case 5: Product Variants (have_product_variant === true)
    // else if (isProductVariant && product.have_product_variant) {
    //   const variant = product.product_variants[index];
    //   if (!variant) return;

    //   const existingIndex = orderList.findIndex(
    //     (item) =>
    //       item.id === product.id &&
    //       item.product_variant_id === variant.id &&
    //       item.have_product_variant === 1,
    //   );

    //   if (existingIndex !== -1) {
    //     const existingItem = orderList[existingIndex];
    //     if (!type && existingItem.qty >= (variant.quantity ?? 0)) {
    //       toast.error("Not enough stock for this variant!");
    //       return;
    //     }
    //     const updatedOrderList = [...orderList];
    //     updatedOrderList[existingIndex] = {
    //       ...existingItem,
    //       qty: existingItem.qty + 1,
    //     };
    //     setOrderList(updatedOrderList);
    //     playDeleteSound();
    //     return;
    //   }

    //   const cart = {
    //     id: product.id,
    //     child_id: variant.id,
    //     product_variant_id: variant.id,
    //     name: `${product.name} - ${variant.name}`,
    //     barcode: variant.barcode,
    //     stock: variant.quantity ?? product.current_stock ?? 0,
    //     qty: 1,
    //     have_variant: 0,
    //     have_product_variant: 1,
    //     price: type
    //       ? parseFloat(product.purchase_price)
    //       : parseFloat(variant.price),
    //     retails_price: type ? 0 : parseFloat(variant.price),
    //     purchase_price: parseFloat(product.purchase_price) || 0,
    //     is_exchange: exchangeSelection[product.id] ? true : false,
    //     product_serial: product?.serial || "",
    //   };

    //   if (!type && cart.stock <= 0) {
    //     toast.error("Out of stock!");
    //     return;
    //   }

    //   setOrderList([...orderList, cart]);
    //   playDeleteSound();
    //   return;
    // }
    else if (isProductVariant && product.have_product_variant) {
      const variant = product.product_variants[index];
      const childVariant = product.product_variants[index].child_variants[cIndex];
      if (!variant) return;

      // const existingIndex = orderList.findIndex(
      //   (item) =>
      //     item.id === product.id &&
      //     item.product_variant_id === variant.id &&
      //     item.have_product_variant === 1,
      // );

      const existingIndex = orderList.findIndex((item) => {
        const sameProduct = item.id === product.id;
        const sameVariant = item.product_variant_id === variant.id;

        const sameChild =
          (item.child_product_variant_id ?? null) ===
          (childVariant?.id ?? null);

        return (
          sameProduct &&
          sameVariant &&
          sameChild &&
          item.have_product_variant === 1
        );
      });

      if (existingIndex !== -1) {
        const existingItem = orderList[existingIndex];

        // 🆕 Skip stock limit check if stock_restrictions is false/0
        if (
          !type &&
          product.stock_restrictions !== 0 &&
          product.stock_restrictions !== false
        ) {
          if (existingItem.qty >= (variant.quantity ?? 0)) {
            toast.error("Not enough stock for this variant!");
            return;
          }
        }

        const updatedOrderList = [...orderList];
        updatedOrderList[existingIndex] = {
          ...existingItem,
          qty: existingItem.qty + 1,
        };
        setOrderList(updatedOrderList);
        playDeleteSound();
        return;
      }

      const cart = {
        id: product.id,
        child_id: variant.id,
        product_variant_id: variant.id,
        child_product_variant_id: childVariant?.id ?? null,
        name: [product?.name, variant?.name, childVariant?.name].filter(Boolean).join(" - "),
        barcode: variant.barcode,
        stock: childVariant?.quantity ?? variant?.quantity ?? product.current_stock ?? 0,
        qty: 1,
        have_variant: 0,
        have_product_variant: 1,
        price: type
          ? parseFloat(product.purchase_price)
          : parseFloat(variant.price),
        retails_price: type ? 0 : parseFloat(variant.price),
        purchase_price: parseFloat(product.purchase_price) || 0,
        is_exchange: exchangeSelection[product.id] ? true : false,
        product_serial: product?.serial || "",
        last_price: product?.last_price || "",
        stock_restrictions:
          product.stock_restrictions === 0 ||
            product.stock_restrictions === false
            ? 0
            : 1,
      };

      if (
        !type &&
        product.stock_restrictions !== 0 &&
        product.stock_restrictions !== false &&
        cart.stock <= 0
      ) {
        toast.error("Out of stock!");
        return;
      }

      setOrderList([...orderList, cart]);
      playDeleteSound();
      return;
    }

    // ✅ Case 4: Regular parent product (for both sale & purchase)
    else {
      cart = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        stock: product.current_stock ?? 0,
        qty: 1,
        price: type ? product.purchase_price : product?.retails_price || 0, // purchase cost
        subtotal:
          (isPurchaseChild || type
            ? product.purchase_price
            : product.retails_price) || 0,
        have_variant: product.have_variant,
        items_values: product.items_values || [],
        retail_price_value: product.retails_price || 0,
        purchase_price: parseFloat(product.purchase_price) || 0, // ✅ store purchase price (edit payload)
        is_exchange: exchangeSelection[product.id] ? true : false,
        product_serial: product?.serial || "",
        last_price: product?.last_price || "",
        stock_restrictions:
          product.stock_restrictions === 0 ||
            product.stock_restrictions === false
            ? 0
            : 1,
      };
      playDeleteSound();
    }

    // ✅ Update the order list
    if (!type && isExist && !index && !isPurchaseChild && !isSaleChild) {
      // Only auto-increment quantity in sales mode
      const updated = orderList.map((item) =>
        item.id === cart.id ? { ...item, qty: item.qty + 1 } : item,
      );
      setOrderList(updated);
    } else if (type && isExist && !isPurchaseChild) {
      // 🟦 Purchase mode (simple product): increment qty if already in cart
      const updated = orderList.map((item) =>
        item.id === cart.id ? { ...item, qty: item.qty + 1 } : item,
      );
      setOrderList(updated);
    } else {
      // For purchase mode, each click adds a new product row
      setOrderList([...orderList, cart]);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Enter") {
  //       discountRef.current?.focus();
  //     }
  //   };

  //   if (orderList.length > 0 && !isOpen) {
  //     document.addEventListener("keydown", handleKeyDown);
  //   }
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // }, [orderList, isOpen, discountRef]);

  // Keyboard navigation inside popup
  useEffect(() => {
    const handleKeyScroll = (e) => {
      if (!isOpen) return;
      const [p, c] = highlightedIndex;
      const currentParent = results[p];
      const hasChildren = currentParent?.imeis?.length > 0;
      if (e.key === "ArrowDown") {
        if (c === null && hasChildren) {
          setHighlightedIndex([p, 0]);
        } else if (
          c !== null &&
          hasChildren &&
          currentParent?.imeis?.length > c + 1
        ) {
          setHighlightedIndex([p, c + 1]);
        } else if (p + 1 < results.length) {
          setHighlightedIndex([p + 1, null]);
        }
      }
      if (e.key === "ArrowUp") {
        if (c !== null && c > 0) {
          setHighlightedIndex([p, c - 1]);
        } else if (c !== null && c === 0) {
          setHighlightedIndex([p, null]);
        } else if (p > 0) {
          const prevParent = results[p - 1];
          const hasPrevChildren = prevParent.imeis?.length > 0;
          setHighlightedIndex([
            p - 1,
            hasPrevChildren ? prevParent.imeis.length - 1 : null,
          ]);
        }
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      if (e.key === "Enter" && results.length > 0) {
        if (c !== null && results[p]?.imeis) {
          addToCart(results[p], c);
        } else {
          addToCart(results[p]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyScroll);
    return () => document.removeEventListener("keydown", handleKeyScroll);
  }, [results, highlightedIndex, isOpen]);

  // Auto-scroll highlighted row into view
  useEffect(() => {
    const [p, c] = highlightedIndex;
    const key = `${p}-${c}`;
    const item = itemRefs.current[key];
    if (item) {
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlightedIndex]);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="mb-0 relative">
      <div className="p-2 rounded-md">
        {/* <h2 className="text-sm font-semibold mb-2">Search Product to order</h2> */}

        <div className="relative">
          <Input
            id="productSearchInput"
            ref={inputRef}
            placeholder="Scan barcode or search product name..."
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={(e) => {
              // Enter/Escape handled in key listener
              if (e.key === "Escape") setIsOpen(false);
            }}
            className="text-base p-3 pr-10"
          />
          {searchTerm ? (
            <Button
              size="lg"
              className="absolute right-0 top-0.5 flex items-center justify-center shadow-none h-8 w-8 p-1 text-red-500 hover:text-gray-50 bg-white hover:bg-red-500 hover:shadow-none"
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setIsOpen(false);
              }}
            >
              <span className="mb-1">×</span>
            </Button>
          ) : (
            <div className="absolute right-3 top-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Popup dropdown */}
          {isOpen && (
            <Card
              ref={popupRef}
              className="md:absolute md:top-10 md:left-0 md:right-0 mt-1 z-50 shadow-sm border rounded-md">

              <CardContent className="p-0">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                ) : (
                  <div className="max-h-[60vh] md:max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar p-1 space-y-2">
                    {results.map((product, pindex) => (
                      <div key={pindex}>
                        {/* Parent item */}
                        <div
                          ref={(el) =>
                            (itemRefs.current[`${pindex}-null`] = el)
                          }
                          tabIndex={0}
                          className={`flex items-center justify-between px-3 py-2 text-sm border-b transition-colors
                            ${highlightedIndex[0] === pindex &&
                              highlightedIndex[1] === null
                              ? "bg-violet-50 border-violet-300"
                              : "bg-gray-50 hover:bg-violet-50 hover:border-violet-200"
                            }
                            ${
                            // 🔒 disable parent if it has IMEIs in sale mode OR items_values
                            (!type && product.imeis?.length > 0) ||
                              product.items_values?.length > 0 ||
                              product.have_product_variant
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer border-gray-200"
                            }`}
                          onClick={() => {
                            // 🔒 if it has IMEIs (in sale) or items_values, don't allow parent selection
                            if (
                              (!type && product.imeis?.length > 0) ||
                              product.items_values?.length > 0 ||
                              product.have_product_variant
                            )
                              return;
                            addToCart(product);
                          }}
                          onMouseEnter={() =>
                            setHighlightedIndex([pindex, null])
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (
                                (!type && product.imeis?.length > 0) ||
                                product.items_values?.length > 0
                              )
                                return;
                              addToCart(results[pindex]);
                            }
                          }}
                        >
                          {/* Parent content */}
                          {/* <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-gray-800">
                              {product?.name}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {product?.sku}
                              </span>
                              <span className="flex items-center gap-1">
                                <Barcode className="h-3 w-3" />
                                {product?.barcode}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                Stock: {product?.current_stock}
                              </span>
                            </div>
                          </div> */}
                          {/* Parent content */}
                          <div className="flex-1 min-w-0 flex items-start gap-3">
                            {/* 🖼️ Thumbnail (if available) */}
                            {(product?.image_path ||
                              product?.image_paths?.length > 0) && (
                                <img
                                  src={
                                    product.image_path || product.image_paths[0]
                                  } // ✅ primary source
                                  alt={product.name || "Product image"}
                                  className="w-10 h-10 object-cover rounded border border-gray-200 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"; // gracefully hide broken images
                                  }}
                                />
                              )}

                            {/* 📦 Product info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-gray-800">
                                {product?.name}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {product?.sku}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ImPriceTags className="h-3 w-3" />
                                  LSP: {product?.last_price || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  Stock: {product?.current_stock}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* inside ScrollListWithSearch after */}

                          <div className="flex flex-col items-end ml-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                            {!product?.imeis?.length && (
                              <span>
                                {type
                                  ? `${product?.purchase_price}`
                                  : `${product?.retails_price}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {!type && product?.have_variant ? (
                          <div className="pl-4 py-1 flex items-center justify-between text-xs bg-yellow-50 border-l-4 border-yellow-400 rounded-md shadow-sm mt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-yellow-700 font-medium">
                              <input
                                type="checkbox"
                                checked={orderList.some(
                                  (p) => p.id === product.id && p.is_exchange,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleInstantExchangeAdd(product);
                                  } else {
                                    // remove if they uncheck
                                    const rest = orderList.filter(
                                      (p) =>
                                        !(p.id === product.id && p.is_exchange),
                                    );
                                    setOrderList(rest);
                                    toast.info(
                                      `${product.name} removed from Exchange list`,
                                    );
                                  }
                                }}
                              />
                              Add as Exchange (we’ll purchase this)
                            </label>
                          </div>
                        ) : (
                          ""
                        )}

                        {/* Sale & Children items (IMEIs) — filtered by searchTerm */}
                        {!type &&
                          product.imeis?.length > 0 &&
                          (() => {
                            // Client-side filter: only show IMEIs whose imei/barcode/color/storage/region
                            // contains the search substring (case-insensitive)
                            const kw = searchTerm?.trim()?.toLowerCase() || "";
                            const filtered = kw
                              ? product.imeis.filter((imei) => {
                                const fields = [
                                  imei?.imei,
                                  imei?.barcode,
                                  imei?.color,
                                  imei?.storage,
                                  imei?.region,
                                ];
                                return fields.some(
                                  (f) => f && String(f).toLowerCase().includes(kw)
                                );
                              })
                              : product.imeis;

                            return filtered.map((imei) => {
                              // Use the original index for addToCart so the correct IMEI is selected
                              const originalIndex = product.imeis.indexOf(imei);
                              return (
                                <div
                                  ref={(el) =>
                                    (itemRefs.current[`${pindex}-${originalIndex}`] = el)
                                  }
                                  key={imei.id}
                                  className={`ml-2 md:ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                            ${highlightedIndex[0] === pindex &&
                                      highlightedIndex[1] === originalIndex
                                      ? "bg-violet-50 border-violet-300"
                                      : "bg-white hover:bg-violet-50 hover:border-violet-200"
                                    }`}
                                  onClick={() => addToCart(product, originalIndex)}
                                  onMouseEnter={() =>
                                    setHighlightedIndex([pindex, originalIndex])
                                  }
                                >
                                  <div className="flex items-center  justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-2 font-medium text-gray-700">
                                        {/* 🖼️ Thumbnail (if available) */}
                                        {imei?.image_path && (
                                          <img
                                            src={imei.image_path}
                                            alt={imei.imei || "IMEI image"}
                                            className="w-8 h-8 object-cover rounded border border-gray-200 shrink-0 transition-transform hover:scale-105"
                                            onError={(e) => {
                                              e.currentTarget.style.display =
                                                "none"; // hide broken images politely
                                            }}
                                          />
                                        )}

                                        {/* 🧾 IMEI number */}
                                        <span className="truncate">
                                          {imei?.imei}
                                        </span>
                                      </div>

                                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                                        {/* 🔋 Battery life */}
                                        {imei?.battery_life && (
                                          <span className="flex items-center gap-1">
                                            <Battery className="h-3 w-3 text-emerald-500" />
                                            {imei.battery_life}%
                                          </span>
                                        )}

                                        {/* 💾 Storage */}
                                        {imei?.storage && (
                                          <span className="flex items-center gap-1">
                                            <HardDrive className="h-3 w-3 text-indigo-500" />
                                            {imei.storage}
                                          </span>
                                        )}

                                        {/* 🌍 Region */}
                                        {imei?.region && (
                                          <span className="flex items-center gap-1">
                                            <Globe className="h-3 w-3 text-blue-500" />
                                            {imei.region}
                                          </span>
                                        )}
                                        {imei?.last_price && (
                                          <span className="flex items-center gap-1">
                                            <ImPriceTags className="h-3 w-3 text-blue-500" />
                                            {imei.last_price}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                                      {imei?.sale_price?.toLocaleString()}
                                      .00
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}

                        {/* 🔹 Sales children (items_values) */}
                        {!type &&
                          product.items_values?.length > 0 &&
                          product.items_values.map((child, cindex) => (
                            <div
                              ref={(el) =>
                              (itemRefs.current[`${pindex}-sale-${cindex}`] =
                                el)
                              }
                              key={child.id}
                              className={`ml-2 md:ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${highlightedIndex[0] === pindex &&
                                  highlightedIndex[1] === cindex
                                  ? "bg-violet-50 border-violet-300"
                                  : "bg-white hover:bg-violet-50 hover:border-violet-200"
                                }`}
                              onClick={() =>
                                addToCart(product, cindex, false, true)
                              } // 👈 sales child
                              onMouseEnter={() =>
                                setHighlightedIndex([pindex, cindex])
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-gray-700 mb-1">
                                    {product.name} - {child.color?.join(", ")}{" "}
                                    {child.storage?.join("/")}
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      {child.sku}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Barcode className="h-3 w-3" />
                                      {child.barcode}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      Stock: {child.quantity ?? 0}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                                  {/* <DollarSign className="h-3 w-3" /> */}
                                  {parseFloat(
                                    child.sell_price,
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* 🔹 Purchase children (items_values) */}
                        {type &&
                          product.items_values?.length > 0 &&
                          product.items_values.map((child, cindex) => (
                            <div
                              ref={(el) =>
                                (itemRefs.current[`${pindex}-${cindex}`] = el)
                              }
                              key={child.id}
                              className={`ml-2 md:ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${highlightedIndex[0] === pindex &&
                                  highlightedIndex[1] === cindex
                                  ? "bg-violet-50 border-violet-300"
                                  : "bg-white hover:bg-violet-50 hover:border-violet-200"
                                }`}
                              onClick={() => addToCart(product, cindex, true)}
                              onMouseEnter={() =>
                                setHighlightedIndex([pindex, cindex])
                              }
                            >
                              {/* Layout like IMEI variant card */}
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-gray-700 mb-1">
                                    {product.name} - {child.color?.join(", ")}{" "}
                                    {child.storage?.join("/")}
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      <span>{child.sku}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Barcode className="h-3 w-3" />
                                      <span>{child.barcode}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      <span>Stock: {child.quantity ?? 0}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                                  {/* <DollarSign className="h-3 w-3" /> */}
                                  {parseFloat(
                                    child.purchase_price,
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* 🔹 Purchase / Sale children (product_variants) ///////////////////////*/}
                        {product.have_product_variant &&
                          product.product_variants?.length > 0
                          ? product.product_variants.map((variant, vindex) => (
                            <React.Fragment key={variant.id}>
                              {/* Parent Variant Card */}
                              <div
                                ref={(el) =>
                                  (itemRefs.current[`${pindex}-variant-${vindex}`] = el)
                                }
                                className={`ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                                  ${highlightedIndex[0] === pindex &&
                                    highlightedIndex[1] === vindex
                                    ? "bg-violet-50 border-violet-300"
                                    : "bg-white hover:bg-violet-50 hover:border-violet-200"
                                  }`}
                                onClick={() =>
                                  addToCart(product, vindex, null, false, false, true)
                                }
                                onMouseEnter={() =>
                                  setHighlightedIndex([pindex, vindex])
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-gray-700 mb-1">
                                      {product.name} - {variant.name}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Hash className="h-3 w-3" />
                                        {variant.sku}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Barcode className="h-3 w-3" />
                                        {variant.barcode}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Package className="h-3 w-3" />
                                        Stock: {variant.quantity ?? 0}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                                    {parseFloat(variant.price).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Child Variant Cards */}
                              {variant.child_variants?.length > 0 &&
                                variant.child_variants.map((child, cindex) => (
                                  <div
                                    key={child.id}
                                    className="ml-8 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors bg-gray-50 hover:bg-violet-50 hover:border-violet-200"
                                    onClick={() =>
                                      addToCart(product, vindex, cindex, false, false, true)
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate text-gray-700 mb-1">
                                          {product.name} - {variant.name} - {child.name}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                                          <span className="flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            {child.sku}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Barcode className="h-3 w-3" />
                                            {child.barcode}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            Stock: {child.quantity ?? 0}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                                        {parseFloat(child.price).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </React.Fragment>
                          ))
                          : ""}
                      </div>
                    ))}
                  </div>
                )}

                {results.length > 0 && (
                  <div className="border-t py-2 mt-1 text-[11px] text-gray-500 text-center">
                    Use ↑↓ arrows to navigate, Enter to select, Esc to close
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollListWithSearch;
