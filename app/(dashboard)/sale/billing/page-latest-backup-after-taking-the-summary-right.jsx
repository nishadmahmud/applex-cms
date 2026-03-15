"use client";
import CustomDatePicker from "@/app/utils/CustomDatePicker";
import Modal from "@/app/utils/Modal";
import Discount from "@/components/Discount";
import { ExistingCustomerList } from "@/components/ExistingCustomerList";
import OrderList from "@/components/OrderList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BadgePercent,
  Hand,
  MessageSquare,
  Percent,
  Plus,
  PlusCircle,
  Store,
  Truck,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AddSeller } from "./AddSeller";
import { DeliveryMethod } from "@/components/DeliveryMethod";
import ScrollListWithSearch from "@/components/ScrollListWithSearch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useSaveSalesMutation } from "@/app/store/api/billingApi";
import { RiMoneyCnyBoxFill } from "react-icons/ri";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeVariation } from "@/app/store/pos/variationSlice";
import { WarehouseList } from "../../purchase/billing/WarehouseList";
import { VendorsList } from "../../purchase/billing/VendorsList";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const CustomerInfoForm = dynamic(
  () => import("@/components/CustomerInfoForm"),
  { ssr: false }
);
const PaymentMethods = dynamic(() => import("@/components/PaymentMethods"), {
  ssr: false,
});
const WarrantyUi = dynamic(() => import("@/components/WarrantyUi"), {
  ssr: false,
});
const AddVendor = dynamic(() => import("../../purchase/billing/AddVendor"), {
  ssr: false,
});

const SalePurchaseBilling = ({ editMode = false, initialInvoice = null }) => {
  const { data: session } = useSession();
  const vatPercent = Number(session?.user?.invoice_settings?.vat) || 0; // e.g. 7.5
  const taxPercent = Number(session?.user?.invoice_settings?.tax) || 0; // e.g. 2.5
  const pathname = usePathname();
  // const isPurchaseBilling = pathname.includes("purchase");
  const invoiceCode = initialInvoice?.invoice_id || "";
  const isPurchaseBilling =
    pathname.includes("purchase") || invoiceCode.startsWith("PUR-");
  const dispatch = useDispatch();
  const router = useRouter();

  // order dependencies
  const [orderType, setOrderType] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [total, setTotal] = useState(0);
  const [discountType, setDiscountType] = useState("fixed");
  const [discount, setDiscount] = useState(0);
  const [customerData, setCustomerData] = useState({
    customer_id: "",
    name: "",
    mobile_number: "",
    email: "",
    nid: "",
    blood_group: "",
    address: "",
    is_member: 0,
  });
  const [existingCustomerData, setExistingCustomerData] = useState({
    customer_id: "",
    customer_name: "",
    delivery_customer_name: "",
    delivery_customer_address: "",
    delivery_customer_phone: "",
  });
  const [vendorData, setVendorData] = useState({
    vendor_name: "",
    vendor_id: "",
  });
  const [warehouseData, setWarehouseData] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [warrantMethod, setWarrantyMethod] = useState("");
  const [warranties, setWarranties] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedSellerName, setSelectedSellerName] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [productId, setProductId] = useState(null);
  const [addVendor, setAddVendor] = useState(false);

  // modals & dropdowns
  const [customerModal, setCustomerModal] = useState(false);
  const [sellerModal, setSellerModal] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [vendorModal, setVendorModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [warrantyModal, setWarrantyModal] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState(false);

  // payment method dependencies
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payAmount, setPayAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [paymentName, setPaymentName] = useState("Cash");

  // refs for keyboard based dependencies
  const discountRef = useRef(null);
  const customerFormRef = useRef(null);
  const paymentRef = useRef(null);

  // save sales func
  const [saveSales] = useSaveSalesMutation();
  const product = useSelector((state) => state.variations.products);

  // get invoice (sale and purchase) data for editing
  useEffect(() => {
    if (editMode && initialInvoice) {
      // 🟩 Common invoice‑level data (shared for both sales & purchase)
      setDiscount(initialInvoice.discount || 0);
      setRemarks(initialInvoice.remarks || "");
      setTransactionDate(new Date(initialInvoice.created_at));
      setPaymentName(initialInvoice.pay_mode || "Cash");
      setPayAmount(parseFloat(initialInvoice.paid_amount) || 0);

      // 🟩 Sales edit  -------------------------------------------------
      if (!isPurchaseBilling) {
        // customer info
        setExistingCustomerData({
          customer_id: initialInvoice.customer_id || "",
          customer_name: initialInvoice.customer_name || "",
          delivery_customer_name: initialInvoice.delivery_customer_name || "",
          delivery_customer_address:
            initialInvoice.delivery_customer_address || "",
          delivery_customer_phone: initialInvoice.delivery_customer_phone || "",
        });

        // line items
        if (initialInvoice.sales_details?.length) {
          const preloadedCart = initialInvoice.sales_details.map((detail) => {
            const base = detail.product_info || {};
            const child = detail.product_item || null;
            const imei_product = detail?.product_imei[0] || null;

            return {
              id: base.id,
              child_id: child?.id ?? null,
              name: child ? `${base.name} - ${child.sku}` : base.name,
              barcode: child?.barcode || base.barcode,
              qty: detail.qty,
              price: parseFloat(detail.price) || 0,
              imei_product: imei_product,
              have_variant: base.have_variant,
              items_values: [],
              child_sell_price: child?.sell_price
                ? parseFloat(child.sell_price)
                : parseFloat(base.retails_price) || 0,
              child_purchase_price: child?.purchase_price
                ? parseFloat(child.purchase_price)
                : parseFloat(base.purchase_price) || 0,
              purchase_price: parseFloat(base.purchase_price) || 0,
              stock:
                child?.quantity ??
                detail.remaining_qty ??
                detail.current_stock ??
                base.current_stock,
            };
          });
          setOrderList(preloadedCart);
        }

        // payments (if any)
        if (initialInvoice.multiple_payment?.length) {
          const pm = initialInvoice.multiple_payment.map((m) => ({
            payment_type_id: m.payment_type_id,
            payment_type_category_id: m.payment_type_category_id,
            payment_amount: parseFloat(m.payment_amount),
          }));
          setPaymentMethods(pm);
        }

        toast.success("Sales invoice loaded for edit");
      }

      // 🟦 Purchase edit  ---------------------------------------------
      else if (isPurchaseBilling) {
        setVendorData({
          vendor_id: initialInvoice.vendor_id || "",
          vendor_name: initialInvoice.vendor_name || "",
        });
        setWarehouseData(initialInvoice.warehouse_id || "");

        // pre‑load payment methods
        if (initialInvoice.multiple_payments?.length) {
          const pm = initialInvoice.multiple_payments.map((m) => ({
            payment_type_id: m.payment_type_id,
            payment_type_category_id: m.payment_type_category_id,
            payment_amount: parseFloat(m.payment_amount),
          }));
          setPaymentMethods(pm);
        }

        // ✅ purchase line items
        if (initialInvoice.purchase_details?.length) {
          const preloadedCart = initialInvoice.purchase_details.map(
            (detail) => {
              const base = detail.product_info || {};
              const child = detail.product_items || null;

              // pick IMEI for THIS row
              const imeiForThisRow = Array.isArray(detail.product_imei)
                ? detail.product_imei.find(
                    (pi) => (pi.product_id ?? base.id) === base.id
                  ) ?? detail.product_imei[0]
                : null;

              const imeiDetails = imeiForThisRow
                ? {
                    imei: imeiForThisRow.imei || "",
                    color: imeiForThisRow.color || "",
                    storage: imeiForThisRow.storage || "",
                    battery: imeiForThisRow.battery_life || "",
                    last_price: imeiForThisRow.last_price || "",
                  }
                : null;

              // prefilled form for edit modal
              const imeiForm = imeiForThisRow
                ? {
                    purchase_price: Number(imeiForThisRow.purchase_price) || 0,
                    sale_price: Number(imeiForThisRow.sale_price) || 0,
                    wholesale_price:
                      Number(imeiForThisRow.wholesale_price) || 0,
                    color: imeiForThisRow.color || "",
                    color_code: imeiForThisRow.color_code || "",
                    storage: imeiForThisRow.storage || "",
                    battery_life: imeiForThisRow.battery_life || "",
                    region: imeiForThisRow.region || "",
                    image_path: imeiForThisRow.image_path || "",
                    product_condition: imeiForThisRow.product_condition || "",
                    note: imeiForThisRow.note || "",
                    serial: imeiForThisRow.imei || "",
                    original_serial: imeiForThisRow.imei || "",
                    imei_id: imeiForThisRow.id,
                  }
                : null;

              return {
                id: base.id,
                child_id: child?.id ?? null,
                name: child ? `${base.name} - ${child.sku}` : base.name,
                barcode: child?.barcode || base.barcode,
                qty: detail.qty, // IMEI row will be 1
                price: parseFloat(detail.price) || 0,
                have_variant: base.have_variant,
                product_imei: Array.isArray(detail.product_imei)
                  ? detail.product_imei
                  : [],
                imei_details: imeiDetails,

                // 🔑 unique row key to avoid collisions if same product appears in multiple rows
                line_key: detail.id,
                imei_id: imeiForThisRow?.id ?? null,
                imei_form: imeiForm,

                // 🔢 show subtotal of IMEI row = purchase_price
                imeiSubtotal:
                  imeiForThisRow?.purchase_price != null
                    ? Number(imeiForThisRow.purchase_price)
                    : undefined,

                items_values: [],
                child_sell_price: child?.sell_price
                  ? parseFloat(child.sell_price)
                  : parseFloat(base.retails_price) || 0,
                child_purchase_price: child?.purchase_price
                  ? parseFloat(child.purchase_price)
                  : parseFloat(base.purchase_price) || 0,
                purchase_price: parseFloat(base.purchase_price) || 0,
                stock:
                  detail.remaining_qty ||
                  detail.current_stock ||
                  base.current_stock ||
                  0,
              };
            }
          );
          setOrderList(preloadedCart);
        }

        toast.success("Purchase invoice loaded for edit");
      }
    }
  }, [editMode, initialInvoice, isPurchaseBilling]);

  // save purchase func
  const savePurchase = useMutation({
    mutationFn: async (payload) => {
      return api.post("/save-purchase", payload);
    },
    onSuccess: (response) => {
      console.log(response);
      toast.success("Purchased Successfully");
      setPaymentModal(false);
      setOrderList([]);
      setWarranties([]);
      setCustomerData({
        customer_id: "",
        name: "",
        mobile_number: "",
        email: "",
        nid: "",
        blood_group: "",
        address: "",
        is_member: 0,
      });
      setExistingCustomerData({
        customer_id: "",
        customer_name: "",
        delivery_customer_name: "",
        delivery_customer_address: "",
        delivery_customer_phone: "",
      });
      setRemarks("");
      setSelectedDeliveryMethod(null);
      setSelectedSeller(null);
      setDiscount(0);
      setDeliveryModal(false);
      setSellerModal(false);
      setCustomerModal(false);
      setVendorData({
        vendor_id: "",
        vendor_name: "",
      });
      setWarehouseData("");
      setVendorModal(false);
    },
  });

  const handleRemoveCart = ({ id, child_id = null, imei_id = null }) => {
    const remaining = orderList.filter((item) => {
      if (imei_id) return item.imei_id !== imei_id;
      if (child_id) return !(item.id === id && item.child_id === child_id);
      return item.id !== id;
    });

    setOrderList(remaining);
    dispatch(removeVariation(id));

    const remainingWarranties = warranties.filter((w) => w.product_id !== id);
    setWarranties(remainingWarranties);
  };

  const handleDiscount = (e) => {
    if (e.key == "Enter") {
      const customerFields = Object.values(customerData);
      const allFields = customerFields.filter(Boolean);

      if (customerFields.length - 2 === allFields.length) {
        setPaymentModal(true);
      } else {
        setCustomerModal(true);
      }
    }
  };

  const handleDate = (fieldName, date) => {
    setTransactionDate(date);
  };

  // const handleComplete = async (status) => {
  //   try {
  //     // --- 1️⃣ Validate IMEI/serial only for products that truly require it
  //     const imeiRequiredItems = orderList.filter(
  //       (item) => item.have_variant && !item.child_id && !item.product_item_id
  //     );

  //     // if (isPurchaseBilling) {
  //     //   if (!editMode) {
  //     //     // original check for creation flow
  //     //     const isVariationEntried = Object.entries(product);
  //     //     if (imeiRequiredItems.length !== isVariationEntried.length) {
  //     //       toast.error("missing imei/serial number Test");
  //     //       return;
  //     //     }
  //     //   } else {
  //     //     // edit flow: ensure every IMEI row has imei_id (already from API)
  //     //     const anyMissing = imeiRequiredItems.some((item) => !item.imei_id);
  //     //     if (anyMissing) {
  //     //       toast.error("missing imei/serial number fsfds");
  //     //       return;
  //     //     }
  //     //   }
  //     // }

  //     // --- 2️⃣ Prepare selected payment methods

  //     if (isPurchaseBilling) {
  //       if (!editMode) {
  //         // original check for creation flow
  //         const isVariationEntried = Object.entries(product);
  //         if (imeiRequiredItems.length !== isVariationEntried.length) {
  //           toast.error("missing imei/serial number");
  //           return;
  //         }
  //       } else {
  //         // EDIT flow:
  //         // Allow either an existing IMEI (imei_id) OR a brand-new IMEI with serial + purchase_price
  //         const anyInvalid = imeiRequiredItems.some((item) => {
  //           if (item.imei_id) return false; // existing IMEI row is valid
  //           const f = item.imei_form || {};
  //           const hasSerial = Boolean(f.serial && String(f.serial).trim());
  //           const hasPurchasePrice = Number(f.purchase_price) > 0;
  //           return !(hasSerial && hasPurchasePrice);
  //         });

  //         if (anyInvalid) {
  //           toast.error("Provide serial and purchase price for new IMEI rows.");
  //           return;
  //         }
  //       }
  //     }

  //     const firstMethod = selectedGateway
  //       ? selectedGateway.payment_type_category.find(
  //           (m) => m.id == selectedAccount
  //         )
  //       : null;

  //     const selectedMethods = [
  //       ...paymentMethods.map(({ id, methodName, ...rest }) => rest),
  //       {
  //         payment_type_id: firstMethod?.payment_type_id || "",
  //         payment_type_category_id: firstMethod?.id || "",
  //         payment_amount: firstMethod?.id ? parseInt(payAmount) : 0,
  //       },
  //     ];

  //     const paidAmount = selectedMethods?.length
  //       ? selectedMethods.reduce((prev, curr) => prev + curr.payment_amount, 0)
  //       : 0;

  //     // --- 3️⃣ Prepare transformed order products list
  //     // const transformedArray = orderList.map((item) => {
  //     //   const baseData = {
  //     //     product_id: item.id,
  //     //     qty: item.qty || 1,
  //     //     retails_price:
  //     //       item.child_id && item.child_sell_price
  //     //         ? item.child_sell_price
  //     //         : item.retail_price_value ??
  //     //           product[item.id]?.retails_price ??
  //     //           item.price,
  //     //     price: item.price,
  //     //     // ✅ NEW: purchase_price logic unified here
  //     //     ...(editMode
  //     //       ? {
  //     //           // ✅ send purchase_price only when editing
  //     //           purchase_price:
  //     //             item.child_purchase_price ??
  //     //             item.imei_purchase_price ??
  //     //             item.purchase_price ??
  //     //             product[item.id]?.purchase_price ??
  //     //             0,
  //     //         }
  //     //       : {}),
  //     //     mode: 1,
  //     //     size: 1,
  //     //     sales_id: 1,
  //     //     imei_id: item.imei_id || null,
  //     //   };

  //     //   // 🟩 SALES VERSION
  //     //   if (!isPurchaseBilling) {
  //     //     if (item.child_id) {
  //     //       return {
  //     //         ...baseData,
  //     //         product_item_id: item.child_id,
  //     //         retails_price: item.child_sell_price ?? item.price,
  //     //         price: item.child_sell_price ?? item.price,
  //     //         have_variant: item.have_variant ? 1 : 0,
  //     //         have_product_variant: 0,
  //     //         product_variant_id: null,
  //     //       };
  //     //     }

  //     //     return {
  //     //       ...baseData,
  //     //       have_variant: item.have_variant ? 1 : 0,
  //     //       have_product_variant: 0,
  //     //       product_variant_id: null,
  //     //     };
  //     //   }

  //     //   // 🟦 PURCHASE VERSION
  //     //   if (item.child_id) {
  //     //     return {
  //     //       ...baseData,
  //     //       product_item_id: item.child_id,
  //     //       have_variant: 0,
  //     //       have_product_variant: 0,
  //     //     };
  //     //   }

  //     //   return {
  //     //     ...baseData,
  //     //     purchase_price: item.price,
  //     //     have_variant: item.have_variant ? 1 : 0,
  //     //     have_product_variant: 0,
  //     //   };
  //     // });

  //     // --- 3️⃣ Prepare transformed order products list
  //     const transformedArray = orderList.map((item) => {
  //       const baseData = {
  //         product_id: item.id,
  //         qty: item.qty || 1,
  //         retails_price:
  //           item.child_id && item.child_sell_price
  //             ? item.child_sell_price
  //             : item.retail_price_value ??
  //               product[item.id]?.retails_price ??
  //               item.price,
  //         price: item.price,
  //         ...(editMode
  //           ? {
  //               // retain for sales; overridden for purchase below if needed
  //               purchase_price:
  //                 item.child_purchase_price ??
  //                 item.imei_purchase_price ??
  //                 item.purchase_price ??
  //                 product[item.id]?.purchase_price ??
  //                 0,
  //             }
  //           : {}),
  //         mode: 1,
  //         size: 1,
  //         sales_id: 1,
  //         imei_id: item.imei_id || null,
  //       };

  //       // 🟩 SALES VERSION (unchanged)
  //       if (!isPurchaseBilling) {
  //         if (item.child_id) {
  //           return {
  //             ...baseData,
  //             product_item_id: item.child_id,
  //             retails_price: item.child_sell_price ?? item.price,
  //             price: item.child_sell_price ?? item.price,
  //             have_variant: item.have_variant ? 1 : 0,
  //             have_product_variant: 0,
  //             product_variant_id: null,
  //           };
  //         }
  //         return {
  //           ...baseData,
  //           have_variant: item.have_variant ? 1 : 0,
  //           have_product_variant: 0,
  //           product_variant_id: null,
  //         };
  //       }

  //       // 🟦 PURCHASE VERSION
  //       if (item.child_id) {
  //         return {
  //           ...baseData,
  //           product_item_id: item.child_id,
  //           have_variant: 0,
  //           have_product_variant: 0,
  //         };
  //       }

  //       // IMEI row handling
  //       const imeiForm = item.imei_form || {};
  //       const isImeiRow = Boolean(item.imei_id);

  //       // default row structure
  //       const rowObj = {
  //         ...baseData,
  //         have_variant: item.have_variant ? 1 : 0,
  //         have_product_variant: 0,
  //       };

  //       // Non-IMEI row: keep original behavior
  //       if (!isImeiRow) {
  //         return {
  //           ...rowObj,
  //           purchase_price: item.price,
  //         };
  //       }

  //       // IMEI row: set per-row fields like your sample payload
  //       return {
  //         ...rowObj,
  //         product_variant_id: null,
  //         retails_price: 0, // as per your sample
  //         purchase_price: Number(imeiForm.purchase_price ?? item.price ?? 0),
  //         imei: "", // as per your sample (kept blank)
  //         sale_price: imeiForm.sale_price || "",
  //         wholesale_price: imeiForm.wholesale_price || "",
  //         color: imeiForm.color || "",
  //         color_code: imeiForm.color_code || "",
  //         storage: imeiForm.storage || "",
  //         battery_life: imeiForm.battery_life || "",
  //         region: imeiForm.region || "",
  //         image_path: imeiForm.image_path || "",
  //         product_condition: imeiForm.product_condition || "",
  //         note: imeiForm.note || "",
  //       };
  //     });

  //     // --- 4️⃣ Build payload
  //     const payload = {
  //       pay_mode: paymentName,
  //       paid_amount: paidAmount,
  //       // cash_change: paidAmount > total ? paidAmount - total : paidAmount,
  //       cash_change: payAmount > total ? payAmount - total : 0,
  //       sub_total: subTotal,
  //       vat: vatAmount || 0,
  //       tax: taxAmount || 0,
  //       discount: discountAmount || 0,
  //       remarks: remarks,
  //       order_type: orderType,
  //       product: transformedArray,
  //       delivery_method_id: selectedDeliveryMethod,
  //       delivery_info_id: "",
  //       delivery_customer_name:
  //         existingCustomerData.customer_name || customerData.name,
  //       delivery_customer_address:
  //         existingCustomerData.delivery_customer_address ||
  //         customerData.address,
  //       delivery_customer_phone:
  //         existingCustomerData.delivery_customer_phone ||
  //         customerData.mobile_number,
  //       delivery_fee: 0,
  //       payment_method: selectedMethods,
  //       table_id: null,
  //       warranty: warranties.length
  //         ? warranties.map((item) => ({
  //             product_id: item.product_id,
  //             warranty_id: item.warranty_id,
  //             default_warranties_count: item.default_warranties_count,
  //           }))
  //         : orderList.map((p) => ({
  //             product_id: p.id,
  //             warranty_id: "",
  //             default_warranties_count: "",
  //           })),
  //       variants: !isPurchaseBilling
  //         ? []
  //         : editMode
  //         ? [] // editing purchase: per-row IMEI data is sent via product[]
  //         : imeiRequiredItems.map((item) => product[item.id].variants).flat(),
  //       imeis: orderList.map((item) => item.imei_id).filter(Boolean),
  //       created_at: transactionDate.toISOString(),
  //       ...(!isPurchaseBilling && {
  //         customer_id:
  //           existingCustomerData.customer_id || customerData.customer_id,
  //         customer_name:
  //           existingCustomerData.customer_name || customerData.name,
  //         sales_id: selectedSeller,
  //       }),
  //       ...(isPurchaseBilling && {
  //         warehouse_id: warehouseData,
  //         vendor_id: vendorData.vendor_id,
  //         vendor_name: vendorData.vendor_name,
  //       }),
  //       status: status,
  //     };

  //     // ✅ ⟶  ADD INVOICE ID IF EDIT MODE
  //     if (editMode && initialInvoice?.invoice_id) {
  //       payload.invoice_id = initialInvoice.invoice_id;
  //     }

  //     // --- 5️⃣ Basic validations
  //     if (!isPurchaseBilling && !payload.customer_id && paidAmount == 0) {
  //       toast.error("Please add a customer for due payments.");
  //       return;
  //     } else if (isPurchaseBilling && !payload.vendor_id) {
  //       toast.error("Select vendor first");
  //       return;
  //     }

  //     // --- 6️⃣ Save / Update via API dynamically
  //     let res;
  //     let apiUrl;

  //     if (isPurchaseBilling) {
  //       apiUrl = editMode ? "/update-purchase" : "/save-purchase";
  //     } else {
  //       apiUrl = editMode ? "/update-sales" : "/save-sales";
  //     }

  //     res = await api.post(apiUrl, payload);

  //     // --- 7️⃣ Handle success
  //     if (res?.data?.success) {
  //       toast.success("Order saved successfully");

  //       // ✅ use existing invoice id if update API doesn't return one
  //       const invoiceId =
  //         res?.data?.data?.invoice_id ||
  //         initialInvoice?.invoice_id ||
  //         payload?.invoice_id;

  //       router.push(
  //         !isPurchaseBilling ? `/invoice/${invoiceId}` : `/invoice/${invoiceId}`
  //       );

  //       // ✅ Reset after completion
  //       setPaymentModal(false);
  //       setOrderList([]);
  //       setWarranties([]);
  //       setCustomerData({
  //         customer_id: "",
  //         name: "",
  //         mobile_number: "",
  //         email: "",
  //         nid: "",
  //         blood_group: "",
  //         address: "",
  //         is_member: 0,
  //       });
  //       setExistingCustomerData({
  //         customer_id: "",
  //         customer_name: "",
  //         delivery_customer_name: "",
  //         delivery_customer_address: "",
  //         delivery_customer_phone: "",
  //       });
  //       setRemarks("");
  //       setSelectedDeliveryMethod(null);
  //       setSelectedSeller(null);
  //       setDiscount(0);
  //       setDeliveryModal(false);
  //       setSellerModal(false);
  //       setCustomerModal(false);
  //       setVendorData({
  //         vendor_id: "",
  //         vendor_name: "",
  //       });
  //       setWarehouseData("");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleComplete = async (status) => {
    try {
      // --- 1️⃣ Validate IMEI/serial only for products that truly require it
      const imeiRequiredItems = orderList.filter(
        (item) => item.have_variant && !item.child_id && !item.product_item_id
      );

      if (isPurchaseBilling) {
        if (!editMode) {
          // original check for creation flow
          const isVariationEntried = Object.entries(product);
          if (imeiRequiredItems.length !== isVariationEntried.length) {
            toast.error("missing imei/serial number");
            return;
          }
        } else {
          // EDIT flow: allow either an existing IMEI (imei_id) OR a brand-new IMEI with serial + purchase_price
          const anyInvalid = imeiRequiredItems.some((item) => {
            if (item.imei_id) return false; // existing IMEI row is valid
            const f = item.imei_form || {};
            const hasSerial = Boolean(f.serial && String(f.serial).trim());
            const hasPurchasePrice = Number(f.purchase_price) > 0;
            return !(hasSerial && hasPurchasePrice);
          });

          if (anyInvalid) {
            toast.error("Provide serial and purchase price for new IMEI rows.");
            return;
          }
        }
      }

      // --- 2️⃣ Prepare selected payment methods
      const firstMethod = selectedGateway
        ? selectedGateway.payment_type_category.find(
            (m) => m.id == selectedAccount
          )
        : null;

      const selectedMethods = [
        ...paymentMethods.map(({ id, methodName, ...rest }) => rest),
        {
          payment_type_id: firstMethod?.payment_type_id || "",
          payment_type_category_id: firstMethod?.id || "",
          payment_amount: firstMethod?.id ? parseInt(payAmount) : 0,
        },
      ];

      const paidAmount = selectedMethods?.length
        ? selectedMethods.reduce((prev, curr) => prev + curr.payment_amount, 0)
        : 0;

      // --- 3️⃣ Prepare transformed order products list
      const transformedArray = orderList.map((item) => {
        const baseData = {
          product_id: item.id,
          qty: item.qty || 1,
          retails_price:
            item.child_id && item.child_sell_price
              ? item.child_sell_price
              : item.retail_price_value ??
                product[item.id]?.retails_price ??
                item.price,
          price: item.price,
          ...(editMode
            ? {
                // retain for sales; overridden for purchase below if needed
                purchase_price:
                  item.child_purchase_price ??
                  item.imei_purchase_price ??
                  item.purchase_price ??
                  product[item.id]?.purchase_price ??
                  0,
              }
            : {}),
          mode: 1,
          size: 1,
          sales_id: 1,
          imei_id: item.imei_id || null,
        };

        // 🟩 SALES VERSION (unchanged)
        if (!isPurchaseBilling) {
          if (item.child_id) {
            return {
              ...baseData,
              product_item_id: item.child_id,
              retails_price: item.child_sell_price ?? item.price,
              price: item.child_sell_price ?? item.price,
              have_variant: item.have_variant ? 1 : 0,
              have_product_variant: 0,
              product_variant_id: null,
            };
          }
          return {
            ...baseData,
            have_variant: item.have_variant ? 1 : 0,
            have_product_variant: 0,
            product_variant_id: null,
          };
        }

        // 🟦 PURCHASE VERSION
        if (item.child_id) {
          return {
            ...baseData,
            product_item_id: item.child_id,
            have_variant: 0,
            have_product_variant: 0,
          };
        }

        // Determine IMEI row in EDIT: existing imei_id OR new serial from imei_form
        const imeiForm = item.imei_form || {};
        const isImeiRow =
          item.have_variant &&
          (Boolean(item.imei_id) || Boolean(imeiForm.serial));

        const rowObj = {
          ...baseData,
          have_variant: item.have_variant ? 1 : 0,
          have_product_variant: 0,
        };

        // Non-IMEI row (normal product)
        if (!isImeiRow) {
          return {
            ...rowObj,
            purchase_price: item.price,
          };
        }

        // IMEI row: include per-IMEI fields (match your sample)
        const pp = Number(imeiForm.purchase_price ?? item.price ?? 0);
        // existing IMEI -> keep imei: "" ; new IMEI -> send serial
        const serialToSend = item.imei_id ? "" : imeiForm.serial || "";

        return {
          ...rowObj,
          product_variant_id: null,
          // keep parity with your sample payload
          price: pp,
          retails_price: 0,
          purchase_price: pp,
          imei: serialToSend,
          sale_price: imeiForm.sale_price || "",
          wholesale_price: imeiForm.wholesale_price || "",
          color: imeiForm.color || "",
          color_code: imeiForm.color_code || "",
          storage: imeiForm.storage || "",
          battery_life: imeiForm.battery_life || "",
          region: imeiForm.region || "",
          image_path: imeiForm.image_path || "",
          product_condition: imeiForm.product_condition || "",
          note: imeiForm.note || "",
        };
      });

      // --- 4️⃣ Build payload
      const payload = {
        pay_mode: paymentName,
        paid_amount: paidAmount,
        cash_change: payAmount > total ? payAmount - total : 0,
        sub_total: subTotal,
        vat: vatAmount || 0,
        tax: taxAmount || 0,
        discount: discountAmount || 0,
        remarks: remarks,
        order_type: orderType,
        product: transformedArray,
        delivery_method_id: selectedDeliveryMethod,
        delivery_info_id: "",
        delivery_customer_name:
          existingCustomerData.customer_name || customerData.name,
        delivery_customer_address:
          existingCustomerData.delivery_customer_address ||
          customerData.address,
        delivery_customer_phone:
          existingCustomerData.delivery_customer_phone ||
          customerData.mobile_number,
        delivery_fee: 0,
        payment_method: selectedMethods,
        table_id: null,
        warranty: warranties.length
          ? warranties.map((item) => ({
              product_id: item.product_id,
              warranty_id: item.warranty_id,
              default_warranties_count: item.default_warranties_count,
            }))
          : orderList.map((p) => ({
              product_id: p.id,
              warranty_id: "",
              default_warranties_count: "",
            })),
        variants: !isPurchaseBilling
          ? []
          : editMode
          ? [] // purchase edit: per-row IMEI data sent inside product[]
          : imeiRequiredItems.map((item) => product[item.id].variants).flat(),
        imeis: orderList.map((item) => item.imei_id).filter(Boolean),
        created_at: transactionDate.toISOString(),
        ...(!isPurchaseBilling && {
          customer_id:
            existingCustomerData.customer_id || customerData.customer_id,
          customer_name:
            existingCustomerData.customer_name || customerData.name,
          sales_id: selectedSeller,
        }),
        ...(isPurchaseBilling && {
          warehouse_id: warehouseData,
          vendor_id: vendorData.vendor_id,
          vendor_name: vendorData.vendor_name,
        }),
        status: status,
      };

      // ✅ ⟶  ADD INVOICE ID IF EDIT MODE
      if (editMode && initialInvoice?.invoice_id) {
        payload.invoice_id = initialInvoice.invoice_id;
      }

      // --- 5️⃣ Basic validations
      if (!isPurchaseBilling && !payload.customer_id && paidAmount == 0) {
        toast.error("Please add a customer for due payments.");
        return;
      } else if (isPurchaseBilling && !payload.vendor_id) {
        toast.error("Select vendor first");
        return;
      }

      // --- 6️⃣ Save / Update via API dynamically
      let apiUrl;
      if (isPurchaseBilling) {
        apiUrl = editMode ? "/update-purchase" : "/save-purchase";
      } else {
        apiUrl = editMode ? "/update-sales" : "/save-sales";
      }

      const res = await api.post(apiUrl, payload);

      // --- 7️⃣ Handle success
      if (res?.data?.success) {
        toast.success("Order saved successfully");

        // ✅ use existing invoice id if update API doesn't return one
        const invoiceId =
          res?.data?.data?.invoice_id ||
          initialInvoice?.invoice_id ||
          payload?.invoice_id;

        router.push(`/invoice/${invoiceId}`);

        // ✅ Reset after completion
        setPaymentModal(false);
        setOrderList([]);
        setWarranties([]);
        setCustomerData({
          customer_id: "",
          name: "",
          mobile_number: "",
          email: "",
          nid: "",
          blood_group: "",
          address: "",
          is_member: 0,
        });
        setExistingCustomerData({
          customer_id: "",
          customer_name: "",
          delivery_customer_name: "",
          delivery_customer_address: "",
          delivery_customer_phone: "",
        });
        setRemarks("");
        setSelectedDeliveryMethod(null);
        setSelectedSeller(null);
        setDiscount(0);
        setDeliveryModal(false);
        setSellerModal(false);
        setCustomerModal(false);
        setVendorData({
          vendor_id: "",
          vendor_name: "",
        });
        setWarehouseData("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // helper: line subtotal (handles IMEI subtotal for purchase)
  const getLineSubtotal = (item) => {
    // For PURCHASE + IMEI rows where imeiSubtotal is set
    if (isPurchaseBilling && item.imeiSubtotal != null) {
      return Number(item.imeiSubtotal) || 0;
    }

    // default: price * qty
    const linePrice = Number(item.price) || 0;
    const lineQty = Number(item.qty) || 0;
    return linePrice * lineQty;
  };

  useEffect(() => {
    // 1) Subtotal: sum of line items (IMEI‑aware)
    let sub = orderList.reduce((prev, curr) => prev + getLineSubtotal(curr), 0);

    // 2) Discount amount
    const discNum = Number(discount) || 0;
    const discountAmount =
      discountType === "fixed" ? discNum : (sub * discNum) / 100;

    // 3) Amount after discount (taxable base)
    const taxable = Math.max(sub - discountAmount, 0);

    // 4) VAT and Tax amounts
    let vatAmount = 0;
    let taxAmountLocal = 0;

    // For SALES only:
    if (!isPurchaseBilling) {
      vatAmount = (taxable * vatPercent) / 100;
    }

    // For PURCHASE only:
    if (isPurchaseBilling) {
      taxAmountLocal = (taxable * taxPercent) / 100;
    }

    // 5) Grand total = taxable + VAT + Tax
    const grandTotal = taxable + vatAmount + taxAmountLocal;

    setTotal(grandTotal);
    // 🟩 Do NOT auto‑set payAmount unless there's an edit invoice
    if (editMode && initialInvoice?.paid_amount) {
      setPayAmount(parseFloat(initialInvoice.paid_amount));
    } else if (payAmount === 0) {
      // leave as 0 until user adds payment
    }
  }, [orderList, discountType, discount, vatPercent, taxPercent]);

  // simple summary helpers (VAT & Tax aware)
  const subTotal = orderList.reduce(
    (prev, curr) => prev + getLineSubtotal(curr),
    0
  );

  const discountNum = Number(discount) || 0;
  const discountAmount =
    discountType === "fixed" ? discountNum : (subTotal * discountNum) / 100;

  const taxableAmount = Math.max(subTotal - discountAmount, 0);
  const vatAmount = !isPurchaseBilling ? (taxableAmount * vatPercent) / 100 : 0;

  const taxAmount = isPurchaseBilling ? (taxableAmount * taxPercent) / 100 : 0;

  const totalItems = orderList.reduce(
    (prev, curr) => prev + (curr.qty || 0),
    0
  );

  return (
    <div className="container mx-auto">
      <div
        className="flex h-[calc(100vh)] overflow-hidden bg-gray-50"
        style={{ gap: "12px" }}
      >
        <div className="flex flex-col w-[65%] h-full bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-violet-100">
          {/* 🔝 HEADER SECTION (Always fixed at top) */}
          {!isPurchaseBilling ? (
            <div className="sticky top-0 z-20 bg-white border-b border-violet-200 shadow-sm">
              <div className="flex flex-1 items-center justify-between py-2 px-3 gap-4">
                {/* Left Section – Seller + Customer */}
                <div className="flex flex-1 items-center gap-4">
                  {/* Seller dropdown */}
                  <AddSeller
                    selectedSeller={selectedSeller}
                    setSelectedSeller={setSelectedSeller}
                    setSelectedSellerName={setSelectedSellerName}
                  />

                  {/* Customer dropdown + add button */}
                  <div className="flex items-center gap-0.5">
                    <ExistingCustomerList
                      orderSchema={existingCustomerData}
                      setOrderSchema={setExistingCustomerData}
                    />

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-md border-violet-300 bg-violet-50 text-violet-600 
                       hover:bg-violet-100 hover:text-violet-700 transition-colors"
                      title="Add new customer"
                      onClick={() => setCustomerModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Right Section – Date */}
                <div className="flex flex-1 items-center justify-end">
                  <CustomDatePicker
                    fieldName="created_at"
                    setValue={handleDate}
                    type="normal"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-0 z-20 bg-white border-b border-violet-200 shadow-sm">
              <div className="flex flex-1 items-center justify-between py-2 px-3 gap-4">
                {/* Left Section – Seller + Customer */}
                <div className="flex flex-1 items-center gap-4">
                  {/* Seller dropdown */}
                  <div className="flex items-center gap-0.5 flex-1">
                    <VendorsList
                      setOrderSchema={setVendorData}
                      selectedVendor={selectedVendor}
                      setSelectedVendor={setSelectedVendor}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-md border-violet-300 bg-violet-50 text-violet-600 
                       hover:bg-violet-100 hover:text-violet-700 transition-colors"
                      title="Add new Vendor"
                      onClick={() => setAddVendor(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Customer dropdown + add button */}
                  <div className="flex items-center gap-0.5">
                    <WarehouseList
                      setOrderSchema={setWarehouseData}
                      setWarehouseName={setWarehouseName}
                    />
                  </div>
                </div>

                {/* Right Section – Date */}
                <div className="flex flex-1 items-center justify-end">
                  <CustomDatePicker
                    fieldName="created_at"
                    setValue={handleDate}
                    type="normal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🧾 SCROLLABLE ORDER AREA (middle) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto bg-white rounded-none p-2 custom-scrollbar">
            <OrderList
              type={isPurchaseBilling}
              setProductId={setProductId}
              cart={orderList}
              setCart={setOrderList}
              removeFromCart={handleRemoveCart}
              setWarrantyModal={setWarrantyModal}
              editMode={editMode}
            />
          </div>

          {/*______________________________________________________________________________________________________________________________________
          _______________________ 🔢 BOTTOM SECTION (Always fixed at bottom of viewport)----------------------------------------------- ___________________________________________________________
          _________*/}
          <div className="sticky bottom-0 z-20 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-200 shadow-inner">
            {/* date */}
            <div className="flex items-center gap-2 px-3 py-0 bg-white/40 backdrop-blur-sm">
              {!isPurchaseBilling
                ? // <ExistingCustomerList
                  //   orderSchema={existingCustomerData}
                  //   setOrderSchema={setExistingCustomerData}
                  // />
                  ""
                : // <WarehouseList setOrderSchema={setWarehouseData} />
                  ""}
            </div>

            {/* Discount Type */}
            {/* <Discount
      discountRef={discountRef}
      discountType={discountType}
      setDiscountType={setDiscountType}
      discount={discount}
      setDiscount={setDiscount}
      handleDiscount={handleDiscount}
    /> */}

            {/* remarks */}
            {/* <Input
      placeholder="Remarks"
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
    /> */}

            {/* radio buttons */}
            {!isPurchaseBilling &&
              // <RadioGroup
              //   className="flex"
              //   value={orderType}
              //   onValueChange={(value) => setOrderType(value)}
              // >
              //   <div className="flex items-center space-x-2">
              //     <RadioGroupItem value={true} id="shop" />
              //     <Label htmlFor="shop">Shop</Label>
              //   </div>
              //   <div className="flex items-center space-x-2">
              //     <RadioGroupItem value={false} id="online" />
              //     <Label htmlFor="online">Online</Label>
              //   </div>
              // </RadioGroup>
              ""}

            {/* checkboxes */}
            {!isPurchaseBilling
              ? // <div className="flex items-center gap-3 ">
                //   <div className="flex flex-1 gap-2 items-center">
                //     <Checkbox
                //       checked={deliveryModal}
                //       onCheckedChange={setDeliveryModal}
                //     />
                //     <Label>Delivery Method</Label>
                //   </div>
                // </div>
                ""
              : // <div className="flex flex-1 gap-2 items-center px-4 py-0">
                //   <Checkbox
                //     checked={vendorModal}
                //     onCheckedChange={setVendorModal}
                //   />
                //   <Label>Add Vendor</Label>
                // </div>
                ""}

            {/* delivery & seller modals */}
            <div className="flex items-center gap-3 px-4 pb-2">
              {deliveryModal ? (
                <DeliveryMethod
                  selectedMethod={selectedDeliveryMethod}
                  setSelectedMethod={setSelectedDeliveryMethod}
                />
              ) : (
                ""
              )}
              {sellerModal ? (
                <AddSeller
                  selectedSeller={selectedSeller}
                  setSelectedSeller={setSelectedSeller}
                  setSelectedSellerName={setSelectedSellerName}
                />
              ) : (
                ""
              )}
              {vendorModal
                ? // <div className="flex items-center gap-3 flex-1">
                  //   <VendorsList
                  //     setOrderSchema={setVendorData}
                  //     selectedVendor={selectedVendor}
                  //     setSelectedVendor={setSelectedVendor}
                  //   />
                  //   <PlusCircle
                  //     onClick={() => setAddVendor(true)}
                  //     className="cursor-pointer text-violet-600 hover:text-violet-800"
                  //   />
                  // </div>
                  ""
                : ""}
            </div>

            {/* Totals */}
            {/* Bottom Summary Card */}
            <div className="rounded-t-xl border-t bg-white shadow-lg">
              {/* Top icon row */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-violet-50 to-indigo-50 text-xs text-gray-700">
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-2">
                    {/* Discount icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setDiscountModalOpen(true)}
                        >
                          <BadgePercent className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Discount</TooltipContent>
                    </Tooltip>

                    {/* Delivery Method icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setDeliveryModal(true)}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Delivery Method
                      </TooltipContent>
                    </Tooltip>

                    {/* Tax view icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setTaxModalOpen(true)}
                        >
                          <Percent className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Tax (View)</TooltipContent>
                    </Tooltip>

                    {/* Remarks icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setRemarksModalOpen(true)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Remarks</TooltipContent>
                    </Tooltip>

                    {/* Order Type icon (sales only) */}
                    {!isPurchaseBilling && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                            onClick={() => setOrderTypeModalOpen(true)}
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Order Type
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>

                <div className="flex items-center gap-4">
                  <span className="text-[11px]">
                    Items:{" "}
                    <span className="font-semibold text-gray-800">
                      {totalItems}
                    </span>
                  </span>
                  <span className="text-[11px]">
                    Subtotal:{" "}
                    <span className="font-semibold text-gray-800">
                      {subTotal.toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Middle summary grid */}
              <div className="grid grid-cols-3 gap-12 px-4 py-3 text-sm text-gray-700">
                <div className="space-y-1">
                  <div className="flex gap-4">
                    <span className="font-semibold">Subtotal</span>
                    <span>{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-semibold">Discount</span>
                    <span>{discountAmount.toFixed(2)}</span>
                  </div>
                  {!isPurchaseBilling && (
                    <div className="flex gap-4">
                      <span className="font-semibold">
                        VAT ({vatPercent || 0}%)
                      </span>
                      <span>{vatAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {isPurchaseBilling && (
                    <div className="flex gap-4">
                      <span className="font-semibold">
                        Tax ({taxPercent || 0}%)
                      </span>
                      <span>{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {/* <div className="flex gap-4">
                        <span>Total Items</span>
                        <span>{totalItems}</span>
                      </div> */}
                  {!isPurchaseBilling && (
                    <div className="flex gap-4">
                      <span className="font-semibold">Order Type</span>
                      <span className="capitalize">
                        {orderType ? "Shop" : "Online"}
                      </span>
                    </div>
                  )}
                  {isPurchaseBilling && (
                    <>
                      <div className="flex gap-4">
                        <span className="font-semibold">Vendor</span>
                        <span className="truncate max-w-[120px]">
                          {vendorData.vendor_name || "-"}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span className="font-semibold">Warehouse</span>
                        <span className="truncate max-w-[120px]">
                          {warehouseName || "-"}
                        </span>
                      </div>
                    </>
                  )}
                  {!isPurchaseBilling && (
                    <div className="flex gap-4">
                      <span className="font-semibold">Customer</span>
                      <span className="truncate max-w-[120px]">
                        {existingCustomerData.customer_name || "-"}
                      </span>
                    </div>
                  )}
                  {!isPurchaseBilling && (
                    <div className="flex gap-4">
                      <span className="font-semibold">Seller</span>
                      <span className="truncate max-w-[120px]">
                        {selectedSellerName || "-"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Pay Mode</span>
                    <span>{paymentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Paid</span>
                    <span>{payAmount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Due</span>
                    <span>{Math.max(total - payAmount, 0).toFixed(2)}</span>
                  </div>
                  {payAmount > total && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Change</span>
                      <span>{(payAmount - total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total payable bar */}
              <div className="px-4 py-2 bg-violet-100 text-center text-lg font-semibold text-gray-800 border-t border-violet-200">
                Total Payable:{" "}
                <span className="text-violet-700">
                  ৳{total?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 px-4 py-3 bg-white border-t">
                <Button
                  onClick={() => handleComplete(0)}
                  variant="outline"
                  className="flex-1 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  <Hand className="w-4 h-4 mr-2" />
                  Hold
                </Button>

                <Button
                  onClick={() => setPaymentModal(true)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <RiMoneyCnyBoxFill className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>

                <Button
                  onClick={() => handleComplete(1)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Complete Order
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 👉 RIGHT PANEL: product search list */}
        {/* <div className="flex flex-col w-[35%] h-full bg-white rounded-lg shadow-sm border overflow-hidden">
          <ScrollListWithSearch
            type={isPurchaseBilling}
            orderList={orderList}
            setOrderList={setOrderList}
            discountRef={discountRef}
          />
        </div> */}
        {/* 👉 RIGHT PANEL: product search + order summary */}
        <div className="flex flex-col w-[35%] h-full bg-white rounded-lg border shadow-md overflow-hidden">
          {/* 🔍 PRODUCT SEARCH SECTION */}
          <div className="border-b bg-gray-50">
            <ScrollListWithSearch
              type={isPurchaseBilling}
              orderList={orderList}
              setOrderList={setOrderList}
              discountRef={discountRef}
            />
          </div>

          {/* 🧾 ORDER SUMMARY + ACTIONS */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-violet-50 to-indigo-50 custom-scrollbar">
            {/* 🧮 Totals Summary Card */}
            <div className="m-3 rounded-xl bg-white shadow-md border border-violet-100 overflow-hidden">
              {/* Header with icons and quick info */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-violet-50 to-indigo-50 text-xs text-gray-700">
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-2">
                    {/* Discount icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setDiscountModalOpen(true)}
                        >
                          <BadgePercent className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Discount</TooltipContent>
                    </Tooltip>

                    {/* Delivery Method */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setDeliveryModal(true)}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Delivery Method
                      </TooltipContent>
                    </Tooltip>

                    {/* Tax */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setTaxModalOpen(true)}
                        >
                          <Percent className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Tax (View)</TooltipContent>
                    </Tooltip>

                    {/* Remarks */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          onClick={() => setRemarksModalOpen(true)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Remarks</TooltipContent>
                    </Tooltip>

                    {/* Order Type (only sales) */}
                    {!isPurchaseBilling && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full border-violet-300 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                            onClick={() => setOrderTypeModalOpen(true)}
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Order Type
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>

                <div className="flex items-center gap-4">
                  <span className="text-[11px]">
                    Items:{" "}
                    <span className="font-semibold text-gray-800">
                      {totalItems}
                    </span>
                  </span>
                  <span className="text-[11px]">
                    Subtotal:{" "}
                    <span className="font-semibold text-gray-800">
                      {subTotal.toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-6 px-4 py-3 text-sm text-gray-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Subtotal</span>
                    <span>{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Discount</span>
                    <span>{discountAmount.toFixed(2)}</span>
                  </div>
                  {!isPurchaseBilling && (
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        VAT ({vatPercent || 0}%)
                      </span>
                      <span>{vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {isPurchaseBilling && (
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Tax ({taxPercent || 0}%)
                      </span>
                      <span>{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {!isPurchaseBilling && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold">Order Type</span>
                        <span className="capitalize">
                          {orderType ? "Shop" : "Online"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Customer</span>
                        <span className="truncate max-w-[100px]">
                          {existingCustomerData.customer_name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Seller</span>
                        <span className="truncate max-w-[100px]">
                          {selectedSellerName || "-"}
                        </span>
                      </div>
                    </>
                  )}
                  {isPurchaseBilling && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold">Vendor</span>
                        <span className="truncate max-w-[100px]">
                          {vendorData.vendor_name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Warehouse</span>
                        <span className="truncate max-w-[100px]">
                          {warehouseName || "-"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t px-4 py-3 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Pay Mode</span>
                  <span>{paymentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Paid</span>
                  <span>{payAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Due</span>
                  <span>{Math.max(total - payAmount, 0).toFixed(2)}</span>
                </div>
                {payAmount > total && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Change</span>
                    <span>{(payAmount - total).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* 💰 Total Payable */}
              <div className="px-4 py-3 text-center text-lg font-bold text-violet-700 border-t bg-violet-50 shadow-inner">
                Total Payable: ৳{total?.toFixed(2) || "0.00"}
              </div>
            </div>

            {/* 🎯 Action Buttons */}
            <div className="flex gap-3 px-3 pt-2 pb-4">
              <Button
                onClick={() => handleComplete(0)}
                variant="outline"
                className="flex-1 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium"
              >
                <Hand className="w-4 h-4 mr-2" />
                Hold
              </Button>

              <Button
                onClick={() => setPaymentModal(true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              >
                <RiMoneyCnyBoxFill className="w-4 h-4 mr-2" />
                Make Payment
              </Button>

              <Button
                onClick={() => handleComplete(1)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium"
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* customer info modal */}
      <Modal
        title={"Add New Customer"}
        onClose={setCustomerModal}
        open={customerModal}
        content={
          <CustomerInfoForm
            setCustomerModal={setCustomerModal}
            formRef={customerFormRef}
            formData={customerData}
            setFormData={setCustomerData}
            setPaymentModal={setPaymentModal}
          />
        }
      />

      {/* vendor modal info */}
      <Modal
        title={"Add New Vendor"}
        onClose={setAddVendor}
        open={addVendor}
        content={
          <AddVendor
            setVendorModal={setAddVendor}
            setOrderSchema={setVendorData}
            setSelectedVendor={setSelectedVendor}
          />
        }
      />

      {/* warranty modal */}
      <Modal
        title={"Warranty"}
        open={warrantyModal}
        onClose={setWarrantyModal}
        content={
          <WarrantyUi
            selectedMethod={warrantMethod}
            setSelectedMethod={setWarrantyMethod}
            warranties={warranties}
            setWarranties={setWarranties}
            setWarrantyModal={setWarrantyModal}
            productId={productId}
            setProductId={setProductId}
          />
        }
      />

      {/* payment modal */}
      <Modal
        title={"Payment Method"}
        onClose={setPaymentModal}
        open={paymentModal}
        content={
          <PaymentMethods
            ref={paymentRef}
            type={"billing"}
            setPaymentName={setPaymentName}
            paymentMethods={paymentMethods}
            setPaymentMethods={setPaymentMethods}
            payAmount={payAmount}
            setPayAmount={setPayAmount}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            selectedGateway={selectedGateway}
            setSelectedGateway={setSelectedGateway}
            onOrderComplete={handleComplete}
            onClose={() => setPaymentModal(false)} //added newly to close the payment methods
            total={total}
          />
        }
      />

      {/* Discount settings modal */}
      <Modal
        title={"Discount"}
        onClose={setDiscountModalOpen}
        open={discountModalOpen}
        content={
          <Discount
            discountRef={discountRef}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discount={discount}
            setDiscount={setDiscount}
            handleDiscount={handleDiscount}
          />
        }
      />

      {/* Delivery method modal (reusing existing deliveryModal state) */}
      <Modal
        title={"Delivery Method"}
        onClose={setDeliveryModal}
        open={deliveryModal}
        content={
          <DeliveryMethod
            selectedMethod={selectedDeliveryMethod}
            setSelectedMethod={setSelectedDeliveryMethod}
          />
        }
      />

      {/* Tax view modal */}
      <Modal
        title={"Tax Details"}
        onClose={setTaxModalOpen}
        open={taxModalOpen}
        content={
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subTotal.toFixed(2)} BDT</span>
            </div>

            {!isPurchaseBilling && (
              <>
                <div className="flex justify-between">
                  <span>VAT Rate</span>
                  <span>{vatPercent || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Amount</span>
                  <span>{vatAmount.toFixed(2)} BDT</span>
                </div>
              </>
            )}

            {isPurchaseBilling && (
              <>
                <div className="flex justify-between">
                  <span>Tax Rate</span>
                  <span>{taxPercent || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>{taxAmount.toFixed(2)} BDT</span>
                </div>
              </>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {isPurchaseBilling
                ? "Tax is applied only for purchases."
                : "VAT is applied only for sales."}
            </p>
          </div>
        }
      />
      {/* Remarks modal */}
      <Modal
        title={"Remarks"}
        onClose={setRemarksModalOpen}
        open={remarksModalOpen}
        content={
          <div className="space-y-4">
            <Input
              placeholder="Enter remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRemarksModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => setRemarksModalOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        }
      />

      {/* Order type modal (sales only) */}
      {!isPurchaseBilling && (
        <Modal
          title={"Order Type"}
          onClose={setOrderTypeModalOpen}
          open={orderTypeModalOpen}
          content={
            <div className="space-y-4">
              <RadioGroup
                className="flex gap-4"
                value={orderType}
                onValueChange={(value) => setOrderType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={true} id="shop-modal" />
                  <Label htmlFor="shop-modal">Shop</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={false} id="online-modal" />
                  <Label htmlFor="online-modal">Online</Label>
                </div>
              </RadioGroup>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOrderTypeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setOrderTypeModalOpen(false)}>
                  Save
                </Button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};

export default SalePurchaseBilling;
