/* eslint-disable react/prop-types */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Box,
  Layers,
  Minus,
  Plus,
  Scan,
  ShieldCheck,
  Trash2,
  Info,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import Modal from "@/app/utils/Modal";
import VariationForm from "@/app/(dashboard)/purchase/billing/VariationForm";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { initializeVariants } from "@/app/store/pos/variationSlice";
import React from "react";
import ItemsValueModal from "@/app/(dashboard)/purchase/billing/ItemsValueModal";
import { useSession } from "next-auth/react";
import useSound from "use-sound";
import VariationFormEdit from "@/app/(dashboard)/purchase/billing/VariationFormEdit";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import ExchangeCartBadge from "./exchange/ExchangeCartBadge";

const OrderList = ({
  cart,
  removeFromCart,
  setCart,
  setWarrantyModal,
  setProductId,
  type,
  editMode,
}) => {
  const { data: session } = useSession();
  const [openVariation, setOpenVariation] = useState({});
  const dispatch = useDispatch();
  const [sameForAll, setSameForAll] = useState(false);
  const [itemValuesModal, setItemValuesModal] = useState({
    open: false,
    items: [],
  });

  // for keyboard navigation
  const qtyRefs = useRef([]);
  const priceRefs = useRef([]);

  useEffect(() => {
    const handleEnterNav = (e) => {
      if (e.key !== "Enter") return;

      const active = document.activeElement;

      // 1️⃣ From Search -> jump to last product qty
      if (active?.id === "productSearchInput") {
        const last = cart.length - 1;
        if (last >= 0) {
          qtyRefs.current[last]?.focus();
        }
      }

      // 2️⃣ From Qty -> go to Price
      const qIndex = qtyRefs.current.findIndex((el) => el === active);
      if (qIndex !== -1) {
        e.preventDefault();
        priceRefs.current[qIndex]?.focus();
        return;
      }

      // 3️⃣ From Price -> back to search
      const pIndex = priceRefs.current.findIndex((el) => el === active);
      if (pIndex !== -1) {
        e.preventDefault();
        const searchInput = document.getElementById("productSearchInput");
        searchInput?.focus();
        searchInput?.select();
        return;
      }
    };

    document.addEventListener("keydown", handleEnterNav);
    return () => document.removeEventListener("keydown", handleEnterNav);
  }, [cart]);

  useEffect(() => {
    const handleOpenExchangeVariant = (e) => {
      const productId = e.detail;
      // find cart item that was just added as exchange
      const target = cart.find(
        (item) => item.id === productId && item.is_exchange,
      );
      if (!target) return;

      // show variant modal exactly like purchase flow
      handleVariationModal(productId);
      dispatch(
        initializeVariants({
          id: productId,
          qty: target.qty,
          sameForAll,
        }),
      );
    };

    window.addEventListener("OPEN_EXCHANGE_VARIANT", handleOpenExchangeVariant);
    return () =>
      window.removeEventListener(
        "OPEN_EXCHANGE_VARIANT",
        handleOpenExchangeVariant,
      );
  }, [cart, sameForAll]);

  console.log(editMode); //use editMode to hide any fields later
  console.log({ cart });

  // 🔹 Helper - match by product and child_id (uniquely identifies item line)
  // const isSameItem = (a, id, childId = null) =>
  //   a.id === id && (a.child_id ? a.child_id === childId : true);

  // const isSameItem = (a, id, childId = null, productVariantId = null) => {
  //   // if this row is a product_variant row, match on product_id + variant_id
  //   if (a.have_product_variant && productVariantId != null) {
  //     return a.id === id && a.product_variant_id === productVariantId;
  //   }

  //   // otherwise, match on product + child_id (existing behaviour)
  //   return a.id === id && (a.child_id ? a.child_id === childId : true);
  // };

  const isSameItem = (
    item,
    id,
    childId = null,
    productVariantId = null,
    childProductVariantId = null
  ) => {
    // Product variant row with optional child variant
    if (item.have_product_variant && productVariantId != null) {
      return (
        item.id === id &&
        item.product_variant_id === productVariantId &&
        (item.child_product_variant_id ?? null) === (childProductVariantId ?? null)
      );
    }

    // Non-variant row, match product + child_id if exists
    return item.id === id && (item.child_id ?? null) === (childId ?? null);
  };

  // const updatePrice = (e, id, childId = null) => {
  //   const val = e.target.value;
  //   // Allow only valid numeric patterns (including partial decimals)
  //   if (/^\d*\.?\d*$/.test(val)) {
  //     const updatedOrderList = cart.map((item) =>
  //       isSameItem(item, id, childId)
  //         ? {
  //             ...item,
  //             price: val === "" ? "" : val, // keep as string until used
  //           }
  //         : item
  //     );
  //     setCart(updatedOrderList);
  //   }
  // };

  // 🔹 Update quantity

  // ✅ New version — scopes update to the exact line (unique combination)
  const updatePrice = (e, id, childId = null, imeiId = null, index = null) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      const updatedOrderList = cart.map((item, idx) => {
        const sameRow =
          item.id === id &&
          (item.child_id ? item.child_id === childId : true) &&
          (item.imei_id ? item.imei_id === imeiId : true) &&
          (index !== null ? idx === index : true);

        return sameRow ? { ...item, price: val === "" ? "" : val } : item;
      });

      setCart(updatedOrderList);
    }
  };

  const updateQuantity = (e, id, childId = null, productVariantId = null, childProductVariantId = null) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) value = 0;

    const updatedOrderList = cart.map((item) => {
      if (isSameItem(item, id, productVariantId, childProductVariantId)) {
        if (!type) {
          if (
            item.stock_restrictions === 0 ||
            item.stock_restrictions === false
          ) {
            return { ...item, qty: value };
          }

          if (item.stock >= value) {
            return { ...item, qty: value };
          } else {
            toast.error("Out of stock!");
            return item;
          }
        }

        return { ...item, qty: value };
      }

      return item;
    });

    setCart(updatedOrderList);
  };

  // previous working version

  // const handleQuantiyInc = (id, childId = null, productVariantId = null) => {
  //   const updatedOrderList = cart.map((item) => {
  //     if (!type) {
  //       // check  is same item & type sales mode
  //       if (isSameItem(item, id, childId, productVariantId)) {
  //         if (item.stock <= 0) {
  //           toast.error("Out of stock!");
  //           return item;
  //         } else if (item.qty < item.stock) {
  //           return { ...item, qty: item.qty + 1 };
  //         } else {
  //           toast.warning("You've reached maximum stock!");
  //           return item;
  //         }
  //       }
  //       return item;
  //     } else {
  //       // purchase mode
  //       return isSameItem(item, id, childId, productVariantId)
  //         ? { ...item, qty: item.qty + 1 }
  //         : item;
  //     }
  //   });

  //   setCart(updatedOrderList);
  // };

  // const handleQuantiyInc = (id, childId = null, productVariantId = null) => {
  //   const updatedOrderList = cart.map((item) => {
  //     if (!type) {
  //       // check  is same item & type sales mode
  //       // if (isSameItem(item, id, childId, productVariantId)) {
  //       //   if (item.stock <= 0) {
  //       //     toast.error("Out of stock!");
  //       //     return item;
  //       //   } else if (item.qty < item.stock) {
  //       //     return { ...item, qty: item.qty + 1 };
  //       //   } else {
  //       //     toast.warning("You've reached maximum stock!");
  //       //     return item;
  //       //   }
  //       // }
  //       if (isSameItem(item, id, childId, productVariantId)) {
  //         // 🆕 Skip all stock limits if stock_restrictions disabled
  //         // if (
  //         //   item.stock_restrictions === 0 ||
  //         //   item.stock_restrictions === false
  //         // )

  //         if (
  //           item.stock_restrictions === 0 ||
  //           item.stock_restrictions === false ||
  //           (item.have_product_variant == 1 &&
  //             (item.stock_restrictions === 0 ||
  //               item.stock_restrictions === false))
  //         ) {
  //           return { ...item, qty: item.qty + 1 };
  //         }

  //         if (item.stock <= 0) {
  //           toast.error("Out of stock!");
  //           return item;
  //         } else if (item.qty < item.stock) {
  //           return { ...item, qty: item.qty + 1 };
  //         } else {
  //           toast.warning("You've reached maximum stock!");
  //           return item;
  //         }
  //       }
  //       return item;
  //     } else {
  //       // purchase mode
  //       return isSameItem(item, id, childId, productVariantId)
  //         ? { ...item, qty: item.qty + 1 }
  //         : item;
  //     }
  //   });

  //   setCart(updatedOrderList);
  // };

  const handleQuantiyInc = (
    id,
    childId = null,
    productVariantId = null,
    childProductVariantId = null
  ) => {
    const updatedOrderList = cart.map((item) => {
      if (!type) {
        // Sales mode
        if (isSameItem(item, id, childId, productVariantId, childProductVariantId)) {
          // Skip stock limits if stock_restrictions disabled
          if (
            item.stock_restrictions === 0 ||
            item.stock_restrictions === false
          ) {
            return { ...item, qty: item.qty + 1 };
          }

          if (item.stock <= 0) {
            toast.error("Out of stock!");
            return item;
          } else if (item.qty < item.stock) {
            return { ...item, qty: item.qty + 1 };
          } else {
            toast.warning("You've reached maximum stock!");
            return item;
          }
        }
        return item;
      } else {
        // Purchase mode: just increment
        return isSameItem(item, id, childId, productVariantId, childProductVariantId)
          ? { ...item, qty: item.qty + 1 }
          : item;
      }
    });

    setCart(updatedOrderList);
  };

  // 🔹 Quantity decrement
  // const handleQuantiyDec = (id, childId = null, productVariantId = null) => {
  //   const updatedOrderList = cart.map((item) =>
  //     isSameItem(item, id, childId, productVariantId) && item.qty > 0
  //       ? { ...item, qty: item.qty - 1 }
  //       : item,
  //   );
  //   setCart(updatedOrderList);
  // };
  const handleQuantiyDec = (
    id,
    childId = null,
    productVariantId = null,
    childProductVariantId = null
  ) => {
    const updatedOrderList = cart.map((item) =>
      isSameItem(item, id, childId, productVariantId, childProductVariantId) &&
        item.qty > 1 // don't go below 1
        ? { ...item, qty: item.qty - 1 }
        : item
    );

    setCart(updatedOrderList);
  };

  // 🔹 Variation modal open/close
  const handleVariationModal = (key) => {
    setOpenVariation((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleModalClose = () => {
    setOpenVariation({});
  };

  // 🔹 Products item values modal
  const handleItemsValueModal = (product) => {
    setItemValuesModal({ open: true, items: product.items_values });
  };

  const handleQtyChange = (id, type) => {
    setItemValuesModal((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const newQty =
            type === "inc"
              ? (item.quantity || 0) + 1
              : Math.max((item.quantity || 0) - 1, 0);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const [playDeleteSound] = useSound("/sounds/delete-sound.mp3", {
    volume: 4, // adjust sound strength
    interrupt: true, // restart sound immediately if clicked fast
  });

  // ===============================================================================

  return (
    <Card className="rounded-md">
      {/* <CardHeader>
        <CardTitle>Current Order</CardTitle>
      </CardHeader> */}
      <CardContent className="p-2 rounded-md">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Scan className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No items in cart</p>
            <p className="text-sm">Scan barcode or search products above</p>
          </div>
        ) : (
          <>
            {/* ========== MOBILE CARD LAYOUT ========== */}
            <div className="md:hidden max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar space-y-2 p-1">
              {cart.map((item, index) => {
                const subtotal =
                  (type || item.is_exchange) && item.imeiSubtotal != null
                    ? Number(item.imeiSubtotal)
                    : !isNaN(item?.price * item?.qty)
                      ? item.price * item.qty
                      : 0;
                return (
                  <div
                    key={`mobile-${item.id}-${item.child_id || index}`}
                    className={`rounded-lg border p-3 bg-white shadow-sm ${item.is_exchange ? "border-red-200 bg-red-50/30" : "border-violet-100"
                      }`}
                  >
                    {/* Row 1: Name + Delete */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 truncate flex items-center gap-1">
                          <span>{index + 1}. {item?.name}</span>
                          {item?.child_id && (
                            <span className="text-gray-400 text-xs"> (variant)</span>
                          )}
                          {item.is_exchange && (
                            <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Exchange</span>
                          )}
                          {item?.last_price != null && item?.imei_id == null && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Info size={14} />
                                </button>
                              </DialogTrigger>

                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle className='font-bold'>Price Details</DialogTitle>
                                </DialogHeader>

                                <div className="text-sm text-gray-700 space-y-1">
                                  <div>
                                    <span className="text-gray-500">Last Price:</span>{" "}
                                    <span className="font-medium">
                                      {item.last_price}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Sale Price:</span>{" "}
                                    <span className="font-medium">
                                      {item.sale_price}
                                    </span>
                                  </div>
                                  <div className="hidden md:block">
                                    <span className="text-gray-500">Purchase Price:</span>{" "}
                                    <span className="font-medium">
                                      {item.purchase_price}
                                    </span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        {item?.imei_details && (
                          <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                            <span>
                              IMEI:{" "}
                              <span className="font-medium text-gray-700">
                                {item.imei_details.imei}
                              </span>
                            </span>
                            {item?.imei_details?.last_price != null && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <Info size={14} />
                                  </button>
                                </DialogTrigger>

                                <DialogContent className="max-w-sm">
                                  <DialogHeader>
                                    <DialogTitle className='font-bold'>Price Details</DialogTitle>
                                  </DialogHeader>

                                  <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                      <span className="text-gray-500">Last Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.last_price}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Sale Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.sale_price}
                                      </span>
                                    </div>
                                    <div className="hidden md:block">
                                      <span className="text-gray-500">Purchase Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.purchase_price}
                                      </span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                        {!type && item?.imei_product && (
                          <div className="text-[11px] text-gray-500 mt-0.5 flex gap-2">
                            <span>
                              IMEI: <span className="font-medium text-gray-700">{item?.imei_product?.imei}</span>
                            </span>
                          </div>
                        )}
                        {item?.product_serial && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">[{item.product_serial}]</div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          playDeleteSound();
                          removeFromCart?.({
                            id: item.id,
                            child_id: item.child_id || null,
                            imei_id: item.imei_id || null,
                            product_variant_id: item.product_variant_id || null,
                          });
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Row 2: Qty + Price + Subtotal */}
                    <div className="flex items-center gap-2">
                      {/* Qty Controls */}
                      <div className="flex items-center bg-violet-50 rounded-md border border-violet-200 overflow-hidden shadow-sm">
                        {!type && item.imei_id ? (
                          <>
                            <button type="button" disabled className="px-2 py-1.5 text-violet-600 opacity-50 cursor-not-allowed">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-700 border-x border-violet-200">{item?.qty}</span>
                            <button type="button" disabled className="px-2 py-1.5 text-violet-600 opacity-50 cursor-not-allowed">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleQuantiyDec(item.id, item.child_id, item.product_variant_id)}
                              disabled={(editMode && item.have_variant) || item?.qty <= 1}
                              className={`px-2 py-1.5 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors ${item?.qty <= 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={!isNaN(item?.qty) ? item?.qty : ""}
                              onChange={(e) => updateQuantity(e, item.id, item.child_id, item.product_variant_id)}
                              className="w-8 text-center text-xs font-semibold text-gray-700 bg-transparent border-x border-violet-200 focus:outline-none"
                              disabled={editMode && item.have_variant}
                            />
                            <button
                              onClick={() => handleQuantiyInc(item.id, item.child_id, item.product_variant_id)}
                              disabled={(editMode && item.have_variant) || (!type && item?.stock == 0)}
                              className={`px-2 py-1.5 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors ${(editMode && item.have_variant) || (!type && item?.stock == 0) ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400">×</span>
                        <Input
                          className="h-7 text-right bg-violet-50/50 border border-violet-200 rounded-md focus:ring-violet-400 font-semibold text-gray-700 text-xs flex-1 min-w-0"
                          value={!isNaN(item.price) ? item.price : ""}
                          onChange={(e) => updatePrice(e, item.id, item.child_id, item.imei_id, index)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={item.have_variant && type}
                        />
                      </div>

                      {/* Subtotal */}
                      <div className={`text-right font-bold text-sm whitespace-nowrap ${item.is_exchange ? "text-red-600" : "text-gray-800"
                        }`}>
                        {item.is_exchange && "−"}
                        ৳{subtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Stock info (non-edit mode) */}
                    {!editMode && (
                      <div className="mt-1.5 text-[10px] text-gray-400">
                        Stock: {!type ? item?.stock - item.qty : item?.stock + item.qty}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ========== DESKTOP TABLE LAYOUT ========== */}
            <div className="hidden md:block max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto custom-scrollbar">
              <Table className="">
                <TableHeader className="bg-violet-100 text-violet-700 sticky top-0 z-10 rounded-md">
                  <TableRow className="rounded-md">
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Name</TableHead>
                    {/* <TableHead className="w-32">Barcode</TableHead> */}
                    {!editMode && (
                      <TableHead className="w-16 text-center">Stock</TableHead>
                    )}
                    <TableHead className="w-24 text-center">Qty</TableHead>
                    <TableHead className="w-20 text-right">Price</TableHead>
                    <TableHead className="w-24 text-right">Subtotal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={`${item.id}-${item.product_variant_id ?? "nv"}-${item.child_product_variant_id ?? "nc"}-${index}`}>
                      {console.log("item in orderlist........ ", item)}
                      <TableCell className="font-medium">{index + 1}</TableCell>

                      {/* 🔹 Product Name */}
                      <TableCell>
                        <div className="font-medium text-xs flex items-center gap-1">
                          <h2>
                            {item?.name}{" "}
                            {item?.child_id ? (
                              <span className="text-gray-500"> (variant)</span>
                            ) : (
                              ""
                            )}
                            {item.is_exchange && <ExchangeCartBadge />}
                            {item?.product_serial ? (
                              <span className="ml-1 font-mono text-[10px] text-gray-400">
                                [{item.product_serial}]
                              </span>
                            ) : (
                              ""
                            )}
                            {/* {item?.last_price != null && (
                              <span className="ml-1 font-mono text-[10px] text-gray-800">
                                [<span className="text-gray-500">Last Price:</span>{" "}
                                {item.last_price}]
                              </span>
                            )} */}
                            {item?.last_price != null && item?.imei_id == null && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                  >
                                    <Info size={16} />
                                  </button>
                                </DialogTrigger>

                                <DialogContent className="max-w-sm">
                                  <DialogHeader>
                                    <DialogTitle className='font-bold'>Price Details</DialogTitle>
                                  </DialogHeader>

                                  <div className="text-sm text-gray-700 space-y-1">

                                    <div>
                                      <span className="text-gray-500">Last Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.last_price}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-gray-500">Sale Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.sale_price}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-gray-500">Purchase Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.purchase_price}
                                      </span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </h2>

                          {/* 🔹 Show cube icon for purchase item if it has variants OR came from items_values */}

                          <span>
                            {(type || item.is_exchange) &&
                              Boolean(item.have_variant) ? (
                              session?.user?.id !== 215 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Box
                                      onClick={() => {
                                        const rowKey =
                                          item.line_key ??
                                          `${item.id}-${item.child_id ?? index
                                          }`;
                                        if (editMode) {
                                          handleVariationModal(rowKey);
                                        } else {
                                          handleVariationModal(item.id);
                                          dispatch(
                                            initializeVariants({
                                              id: item.id,
                                              qty: item.qty,
                                              sameForAll,
                                            }),
                                          );
                                        }
                                      }}
                                      className="mt-0 cursor-pointer h-6 w-6 flex items-center justify-center"
                                      aria-label={
                                        item.child_id
                                          ? "Purchased sub-item variant"
                                          : "Variant configuration"
                                      }
                                    />
                                  </TooltipTrigger>

                                  <TooltipContent
                                    side="top"
                                    align="center"
                                    className="w-auto p-1"
                                  >
                                    <span className="text-sm">
                                      {item.child_id
                                        ? "Purchased sub-item variant"
                                        : "Variant configuration"}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            ) : !type ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ShieldCheck
                                    onClick={() => {
                                      setWarrantyModal(true);
                                      setProductId(item.id);
                                    }}
                                    className="mt-0 cursor-pointer h-6 w-6"
                                    aria-label="Warranty"
                                  />
                                </TooltipTrigger>

                                <TooltipContent
                                  side="top"
                                  align="center"
                                  className="w-auto p-1"
                                >
                                  <span className="text-sm">
                                    Add / view warranty
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                        {/* 🟩 IMEI / variant details */}
                        {item?.imei_details ? (
                          <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                            <span>
                              IMEI:{" "}
                              <span className="font-medium text-gray-700">
                                {item.imei_details.imei}
                              </span>
                            </span>

                            {/* {item?.imei_details?.last_price != null && (
                              <span className="font-medium text-gray-700">
                                <span className="text-gray-500">Last Price:</span>{" "}
                                {item.imei_details.last_price}
                              </span>
                            )} */}
                            {item?.imei_details?.last_price != null && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700"
                                  >
                                    <Info size={16} />
                                  </button>
                                </DialogTrigger>

                                <DialogContent className="max-w-sm">
                                  <DialogHeader>
                                    <DialogTitle className='font-bold'>Price Details</DialogTitle>
                                  </DialogHeader>

                                  <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                      <span className="text-gray-500">Last Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.last_price}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Sale Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.sale_price}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Purchase Price:</span>{" "}
                                      <span className="font-medium">
                                        {item.imei_details.purchase_price}
                                      </span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ) : (
                          ""
                        )}
                        {!type && item?.imei_product && (
                          <div className="text-[11px] text-gray-500 mt-0.5 space-x-2">
                            <span className="inline-block">
                              IMEI:{" "}
                              <span className="font-medium text-gray-700">
                                {item?.imei_product?.imei}
                              </span>
                            </span>
                          </div>
                        )}

                        {/* Variation modal */}
                        {/* Purchase + Edit: per-row IMEI editor */}
                        {type &&
                          editMode &&
                          item.have_variant &&
                          openVariation[
                          item.line_key ??
                          `${item.id}-${item.child_id ?? index}`
                          ] ? (
                          <Modal
                            title={item.name}
                            content={
                              <VariationFormEdit
                                item={item}
                                onClose={handleModalClose}
                                onSubmit={(updated) => {
                                  // Update ONLY this row
                                  const targetKey =
                                    item.line_key ??
                                    `${item.id}-${item.child_id ?? index}`;
                                  setCart((prev) =>
                                    prev.map((row, rowIndex) =>
                                      (row.line_key ??
                                        `${row.id}-${row.child_id ?? rowIndex
                                        }`) === targetKey
                                        ? {
                                          ...row,
                                          imei_form: {
                                            ...row.imei_form,
                                            ...updated,
                                          },
                                          imeiSubtotal:
                                            Number(updated.purchase_price) ||
                                            0,
                                          imei_details: {
                                            imei:
                                              updated.serial ||
                                              row.imei_details?.imei ||
                                              "",
                                            color:
                                              updated.color ||
                                              row.imei_details?.color ||
                                              "",
                                            storage:
                                              updated.storage ||
                                              row.imei_details?.storage ||
                                              "",
                                            battery:
                                              updated.battery_life ||
                                              row.imei_details?.battery ||
                                              "",
                                            model:
                                              updated.model ||
                                              row.imei_details?.model ||
                                              "",
                                            warranty:
                                              updated.warranty ||
                                              row.imei_details?.warranty ||
                                              "",
                                          },
                                        }
                                        : row,
                                    ),
                                  );
                                }}
                              />
                            }
                            open={true}
                            onClose={handleModalClose}
                            customDesignFor="variation_modal"
                          />
                        ) : (
                          ""
                        )}
                        {/* Purchase + Create (existing behavior): product-level variant modal */}
                        {(type || item.is_exchange) &&
                          !editMode &&
                          openVariation[item.id] && (
                            <Modal
                              title={item.name}
                              content={
                                <VariationForm
                                  id={item.id}
                                  onClose={handleModalClose}
                                  sameForAll={sameForAll}
                                  setSameForAll={setSameForAll}
                                  onSubtotalUpdate={(
                                    totalPurchasePrice /*, imeiCount */,
                                  ) => {
                                    setCart((prev) =>
                                      prev.map((row) =>
                                        row.id === item.id && !row.child_id
                                          ? {
                                            ...row,
                                            imeiSubtotal: totalPurchasePrice,
                                            price: row.is_exchange
                                              ? Number(totalPurchasePrice)
                                              : row.price, // keep latest purchase price base
                                          }
                                          : row,
                                      ),
                                    );
                                  }}
                                />
                              }
                              open={true}
                              onClose={handleModalClose}
                              customDesignFor="variation_modal"
                            />
                          )}
                      </TableCell>

                      {/* 🔹 Barcode */}
                      {/* <TableCell>
                        <span className="text-xs font-mono text-gray-600">
                          {item.barcode}
                        </span>
                      </TableCell> */}

                      {/* 🔹 Stock */}
                      {!editMode && (
                        <TableCell className="text-center text-sm">
                          {!type
                            ? item?.stock - item.qty
                            : item?.stock + item.qty}
                        </TableCell>
                      )}

                      {/* 🔹 Quantity Controls */}
                      <TableCell>
                        {!type && item.imei_id ? (
                          <div className="flex items-center justify-center">
                            <div className="flex items-center bg-violet-50 rounded-md border border-violet-200 overflow-hidden shadow-sm">
                              {/* Minus button (visual only; same disabled logic as before) */}
                              <button
                                type="button"
                                disabled={item?.imei_id}
                                className={`px-2 py-1 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors focus:outline-none ${item?.imei_id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                  }`}
                                aria-label="decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              {/* Qty display (kept as span like your original) */}
                              <span
                                className="w-10 text-center text-sm font-semibold text-gray-700 bg-transparent 
                 border-x border-violet-200"
                              >
                                {item?.qty}
                              </span>

                              {/* Plus button (visual only; same disabled logic as before) */}
                              <button
                                type="button"
                                disabled={item?.imei_id}
                                className={`px-2 py-1 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors focus:outline-none ${item?.imei_id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                  }`}
                                aria-label="increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="flex items-center bg-violet-50 rounded-md border border-violet-200 overflow-hidden shadow-sm">
                              {/* Minus button */}
                              <button
                                onClick={() =>
                                  handleQuantiyDec(
                                    item.id,
                                    item.child_id,
                                    item.product_variant_id,
                                    item.child_product_variant_id
                                  )
                                }
                                disabled={
                                  (editMode && item.have_variant) ||
                                  item?.qty <= 1
                                }
                                className={`px-2 py-1 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors ${item?.qty <= 1
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                  }`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              {/* Qty Input */}
                              <input
                                ref={(el) => (qtyRefs.current[index] = el)}
                                type="number"
                                min="0"
                                value={!isNaN(item?.qty) ? item?.qty : ""}
                                onChange={(e) =>
                                  updateQuantity(
                                    e,
                                    item.id,
                                    item.product_variant_id,
                                    item.child_product_variant_id
                                  )
                                }
                                className="w-10 text-center font-semibold text-gray-700 bg-transparent border-x border-violet-200 focus:outline-none focus:ring-1 focus:ring-violet-400"
                                disabled={editMode && item.have_variant}
                              />

                              {/* Plus button */}
                              <button
                                onClick={() =>
                                  handleQuantiyInc(
                                    item.id,
                                    item.child_id,
                                    item.product_variant_id,
                                    item.child_product_variant_id
                                  )
                                }
                                disabled={
                                  (editMode && item.have_variant) ||
                                  (!type && item?.stock == 0)
                                }
                                className={`px-2 py-1 text-violet-600 hover:text-white hover:bg-violet-500 transition-colors ${(editMode && item.have_variant) ||
                                  (!type && item?.stock == 0)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                  }`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* 🔹 Price */}
                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          {/* <Input
                            className="w-[90px] h-7 text-right bg-violet-50/50 border border-violet-200 rounded-md focus:ring-violet-400 focus:border-violet-400 font-semibold text-gray-700"
                            value={!isNaN(item.price) ? item.price : ""}
                            onChange={(e) =>
                              updatePrice(e, item.id, item.child_id)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={editMode && item.have_variant && type}
                          /> */}
                          <Input
                            ref={(el) => (priceRefs.current[index] = el)}
                            className="w-[90px] h-7 text-right bg-violet-50/50 border border-violet-200 rounded-md focus:ring-violet-400 focus:border-violet-400 font-semibold text-gray-700"
                            value={!isNaN(item.price) ? item.price : ""}
                            onChange={(e) =>
                              updatePrice(
                                e,
                                item.id,
                                item.child_id,
                                item.imei_id,
                                index, // fallback if IMEI missing
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            // 🟦 Disable when IMEI exists OR per existing logic
                            disabled={item.have_variant && type}
                          />
                        </div>
                      </TableCell>

                      {/* 🔹 Subtotal */}
                      {/* 🔹 Subtotal */}
                      {/* <TableCell className="text-right font-bold">
                        {type && item.imeiSubtotal != null
                          ? Number(item.imeiSubtotal).toFixed(2) // 🔹 purchase IMEI subtotal
                          : !isNaN(item?.price * item?.qty)
                            ? (item?.price * item?.qty).toFixed(2)
                            : "0.00"}
                      </TableCell> */}

                      <TableCell
                        className={`text-right font-bold ${item.is_exchange ? "text-red-600" : ""
                          }`}
                      >
                        {(type || item.is_exchange) &&
                          item.imeiSubtotal != null ? (
                          // 🔹 For purchase or exchange variant rows with imeiSubtotal
                          <>
                            {item.is_exchange && "−"}
                            {Number(item.imeiSubtotal).toFixed(2)}
                          </>
                        ) : !isNaN(item?.price * item?.qty) ? (
                          // 🔹 Simple sales or non‑variant exchange
                          <>
                            {item.is_exchange && "−"}
                            {(item?.price * item?.qty).toFixed(2)}
                          </>
                        ) : (
                          "0.00"
                        )}
                      </TableCell>

                      {/* 🔹 Delete Button */}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            playDeleteSound(); // 🔥 plays the sound instantly

                            removeFromCart?.({
                              id: item.id,
                              child_id: item.child_id || null,
                              imei_id: item.imei_id || null,
                              product_variant_id: item.product_variant_id || null,
                              child_product_variant_id: item.child_product_variant_id || null,
                            });
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 🔹 Modal for product items list */}
            <ItemsValueModal
              open={itemValuesModal.open}
              items={itemValuesModal.items}
              onClose={() => setItemValuesModal({ open: false, items: [] })}
              onQtyChange={handleQtyChange}
            />
            <Separator className="my-0" />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderList;
