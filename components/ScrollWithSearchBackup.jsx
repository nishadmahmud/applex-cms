"use client";

import { Barcode, DollarSign, Hash, Package, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLazySearchProductQuery } from "@/app/store/api/productsApi";
import { toast } from "sonner";
import usePurchaseSearchQuery from "@/apiHooks/usePurchaseSearchQuery";
import { useQueryClient } from "@tanstack/react-query";
import useSound from "use-sound";

// eslint-disable-next-line react/prop-types
const ScrollListWithSearch = ({
  orderList,
  setOrderList,
  discountRef,
  type,
}) => {
  console.log(type);
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  console.log(results);
  const [highlightedIndex, setHighlightedIndex] = useState([0, null]);

  const itemRefs = useRef([]);
  const debounceRef = useRef(null);

  const [searchProduct] = useLazySearchProductQuery();
  const { mutateAsync, error, isPending } = usePurchaseSearchQuery();

  const handleChange = (e) => {
    setIsOpen(true);
    setSearchTerm(e.target.value);
    const keyword = e.target.value;

    const cached = queryClient.getQueryData(["PurchaseSearchQuery", keyword]);

    if (cached) {
      setResults(cached.data);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(async () => {
      if (e.target.value === "") {
        setResults([]);
        setIsOpen(false);
      } else {
        if (type) {
          const res = await mutateAsync({ keyword });
          setResults(res.data);
        } else {
          const res = await searchProduct({ keyword }).unwrap();
          setResults(res.data.data);
        }
      }
    }, 700);
  };

  const addToCart = (
    product,
    index = null,
    isPurchaseChild = false,
    isSaleChild = false
  ) => {
    let cart;
    const isExist = orderList.find((item) => item.id == product.id) || null;

    // ✅ Only run stock checks for SALES mode
    if (!type) {
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
        (item) => item.imei_id === imeiData.id
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
        },
      };

      playDeleteSound();
    }

    // ✅ Case 2: Sales mode selecting an items_values variant
    else if (!type && isSaleChild) {
      const child = product.items_values[index];
      cart = {
        id: product.id,
        child_id: child.id,
        name: `${product.name} - ${child.color?.join(", ") || ""} ${
          child.storage?.join("/") || ""
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
      };
      playDeleteSound();
    }

    // ✅ Case 3: Purchase mode selecting `items_values`
    else if (type && isPurchaseChild) {
      const child = product.items_values[index];
      cart = {
        id: product.id,
        child_id: child.id,
        name: `${product.name} - ${child.color?.join(", ")} ${
          child.storage?.join("/") || ""
        }`,
        barcode: child.barcode,
        stock: child.quantity ?? 0, // backend may send null
        qty: 1,
        price: parseFloat(child.purchase_price) || 0, // purchase price (what you pay)
        child_sell_price: parseFloat(child.sell_price) || 0, // ✅ retail price reference
        subtotal: parseFloat(child.purchase_price) || 0,
        have_variant: true,
        child_purchase_price: parseFloat(child.purchase_price) || 0, // ✅ store purchase price variant
      };
      playDeleteSound();
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
      };
      playDeleteSound();
    }

    // ✅ Update the order list
    if (!type && isExist && !index && !isPurchaseChild && !isSaleChild) {
      // Only auto-increment quantity in sales mode
      const updated = orderList.map((item) =>
        item.id === cart.id ? { ...item, qty: item.qty + 1 } : item
      );
      setOrderList(updated);
    } else {
      // For purchase mode, each click adds a new product row
      setOrderList([...orderList, cart]);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        discountRef.current?.focus();
      }
    };

    if (orderList.length > 0 && !isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [orderList, isOpen]);

  useEffect(() => {
    const handleKeyScroll = (e) => {
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
          const hasChildren = prevParent.imeis?.length > 0;
          setHighlightedIndex([
            p - 1,
            hasChildren ? prevParent.imeis.length - 1 : null,
          ]);
        }
      }
    };

    if (results.length > 1) {
      document.addEventListener("keydown", handleKeyScroll);
    }

    return () => document.removeEventListener("keydown", handleKeyScroll);
  }, [results, highlightedIndex]);

  useEffect(() => {
    const [p, c] = highlightedIndex;
    const key = `${p}-${c}`;
    const item = itemRefs.current[key];

    if (item) {
      item.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const [playDeleteSound] = useSound("/sounds/add-to-cart-sound.mp3", {
    volume: 5, // adjust sound strength
    interrupt: true, // restart sound immediately if clicked fast
  });

  // --------------------------------------------------------
  // ▼▼▼  Only the rendering has changed below this line ▼▼▼
  // --------------------------------------------------------
  return (
    <div className="h-full flex flex-col bg-gradient-to-t from-gray-50 to-white p-4 rounded-xl border shadow-sm">
      {/* header with title + loaded count */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
          Product Search
        </h2>
        <span className="text-[11px] text-gray-500">
          Loaded:{" "}
          <span className="font-semibold text-orange-500">
            {results.length}
          </span>
        </span>
      </div>

      {/* search box */}
      <div className="relative mb-3">
        <Input
          placeholder="Scan barcode or search product name..."
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              const [p, c] = highlightedIndex;
              if (c !== null && results[p]?.imeis) {
                addToCart(results[p], c); // pass product and child index
              } else {
                addToCart(results[p]); // pass just the product
              }
            }
          }}
          className="h-9 text-sm pl-8 pr-9 rounded-md border-gray-300 focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
        />
        {searchTerm ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 p-0 text-gray-500"
            onClick={() => {
              setSearchTerm("");
              setResults([]);
              setIsOpen(false);
            }}
          >
            ×
          </Button>
        ) : (
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* always visible product list instead of popup */}
      <Card className="flex-1 overflow-hidden shadow-none border-none bg-transparent">
        <CardContent className="p-0 h-full">
          {results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar p-1 space-y-2">
              {results.map((product, pindex) => (
                <div key={pindex}>
                  {/* Parent item */}
                  <div
                    ref={(el) => (itemRefs.current[`${pindex}-null`] = el)}
                    tabIndex={0}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm border transition-colors
    ${
      highlightedIndex[0] === pindex && highlightedIndex[1] === null
        ? "bg-violet-50 border-violet-300"
        : "bg-gray-50 hover:bg-violet-50 hover:border-violet-200"
    }
    ${
      // 🔒 disable parent if it has IMEIs in sale mode OR items_values
      (!type && product.imeis?.length > 0) || product.items_values?.length > 0
        ? "opacity-60 cursor-not-allowed"
        : "cursor-pointer border-gray-200"
    }`}
                    onClick={() => {
                      // 🔒 if it has IMEIs (in sale) or items_values, don't allow parent selection
                      if (
                        (!type && product.imeis?.length > 0) ||
                        product.items_values?.length > 0
                      )
                        return;
                      addToCart(product);
                    }}
                    onMouseEnter={() => setHighlightedIndex([pindex, null])}
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
                          <Barcode className="h-3 w-3" />
                          {product?.barcode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Stock: {product?.current_stock}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end ml-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {!product?.imeis?.length && (
                        <span>
                          {type
                            ? `Buy: ${product?.purchase_price}`
                            : `Sale: ${product?.retails_price}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sale & Children items (IMEIs) */}
                  {!type &&
                    product.imeis?.length > 0 &&
                    product.imeis.map((imei, cindex) => (
                      <div
                        ref={(el) =>
                          (itemRefs.current[`${pindex}-${cindex}`] = el)
                        }
                        key={imei.id}
                        className={`ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${
                            highlightedIndex[0] === pindex &&
                            highlightedIndex[1] === cindex
                              ? "bg-violet-50 border-violet-300"
                              : "bg-white hover:bg-violet-50 hover:border-violet-200"
                          }`}
                        onClick={() => addToCart(product, cindex)}
                        onMouseEnter={() =>
                          setHighlightedIndex([pindex, cindex])
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="font-medium text-gray-700 truncate">
                              {product.name} - {imei?.imei}
                            </div>

                            <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1">
                                <Barcode className="h-3 w-3" />
                                {imei?.barcode}
                              </span>
                              {imei?.region && (
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  {imei.region}
                                </span>
                              )}
                              <span
                                className={
                                  imei?.in_stock
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {imei?.in_stock ? "In Stock" : "Stock Out"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2 text-xs font-semibold text-gray-700">
                            <DollarSign className="h-3 w-3" />
                            {imei?.sale_price?.toLocaleString()}
                            .00
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* 🔹 Sales children (items_values) */}
                  {!type &&
                    product.items_values?.length > 0 &&
                    product.items_values.map((child, cindex) => (
                      <div
                        ref={(el) =>
                          (itemRefs.current[`${pindex}-sale-${cindex}`] = el)
                        }
                        key={child.id}
                        className={`ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${
                            highlightedIndex[0] === pindex &&
                            highlightedIndex[1] === cindex
                              ? "bg-violet-50 border-violet-300"
                              : "bg-white hover:bg-violet-50 hover:border-violet-200"
                          }`}
                        onClick={() => addToCart(product, cindex, false, true)} // 👈 sales child
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
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(child.sell_price).toLocaleString()}
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
                        className={`ml-4 mt-1 rounded-md border px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${
                            highlightedIndex[0] === pindex &&
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
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(child.purchase_price).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="border-t pt-1 mt-1 text-[11px] text-gray-500 text-center">
              Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollListWithSearch;
