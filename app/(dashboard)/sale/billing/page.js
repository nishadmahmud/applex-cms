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
  Loader2,
  MessageSquare,
  Paperclip,
  Percent,
  Plus,
  PlusCircle,
  Store,
  Truck,
  Search as SearchIcon,
  ShoppingCart,
  Receipt,
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
import { removeVariation, clearAllVariations } from "@/app/store/pos/variationSlice";
import { apiSlice } from "@/app/store/apiSlice";
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
import PathaoOrderForm from "../pathao/pathao-order-form";
import { formatBangladeshiAmount } from "@/lib/format-display-bdt";
import { useGetPaymentListQuery } from "@/app/store/api/paymentApi";
import { ExistingWholeSellerList } from "../../wholesale/billing/components/ExistingWholeSellerList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useCreateSteadfastOrderMutation,
  useSaveSteadfastToCourierLogMutation,
} from "@/app/store/api/steadfastApi";
import SteadfastDeliveryForm from "../steadfast/SteadfastDeliveryForm";

const CustomerInfoForm = dynamic(
  () => import("@/components/CustomerInfoForm"),
  { ssr: false },
);
const PaymentMethods = dynamic(
  () => import("@/components/PaymentMethods-SalePurchaseBilling"),
  {
    ssr: false,
  },
);
const WarrantyUi = dynamic(() => import("@/components/WarrantyUi"), {
  ssr: false,
});
const AddVendor = dynamic(() => import("../../purchase/billing/AddVendor"), {
  ssr: false,
});

const AddWholeSeller = dynamic(
  () => import("../../wholesale/billing/components/AddWholeSeller"),
  { ssr: false },
);

const SalePurchaseBilling = ({ editMode = false, initialInvoice = null }) => {
  const { data: session, status } = useSession();
  const { data: paymentGateways } = useGetPaymentListQuery(undefined, {
    skip: status !== "authenticated",
  });
  const vatPercent = Number(session?.user?.invoice_settings?.vat) || 0; // e.g. 7.5
  const taxPercent = Number(session?.user?.invoice_settings?.tax) || 0; // e.g. 2.5
  const pathname = usePathname();
  // const isPurchaseBilling = pathname.includes("purchase");
  const invoiceCode = initialInvoice?.invoice_id || "";
  const isPurchaseBilling =
    pathname.includes("purchase") || invoiceCode.startsWith("PUR-");

  let isWholeSaleBilling =
    !isPurchaseBilling &&
    (pathname.includes("wholesale") || invoiceCode.startsWith("WHOLE-"));

  // 🔹 Adjust dynamically if the invoice data itself tells us it's wholesale
  if (editMode && initialInvoice?.sales_type === "wholesale") {
    isWholeSaleBilling = true;
  }

  const featureName = isPurchaseBilling
    ? "Purchase"
    : isWholeSaleBilling
      ? "Wholesale"
      : "Sale";

  const optionName = isPurchaseBilling
    ? editMode
      ? "Purchase Edit"
      : "Purchase Billing"
    : isWholeSaleBilling
      ? editMode
        ? "Wholesale Edit"
        : "Wholesale Billing"
      : editMode
        ? "Sale Edit"
        : "Sale Billing";

  const dispatch = useDispatch();
  const router = useRouter();

  // order dependencies
  const [orderType, setOrderType] = useState("shop");
  const [mobileTab, setMobileTab] = useState("search"); // "search" | "cart" | "summary"
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
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [paymentName, setPaymentName] = useState("Cash");

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [pathaoDelivery, setPathaoDelivery] = useState({
    store: "",
    city: "",
    zone: "",
  });

  const [pathaoModalOpen, setPathaoModalOpen] = useState(false);
  const [pathaoPendingInvoice, setPathaoPendingInvoice] = useState(null);
  const [deliveryMethodName, setDeliveryMethodName] = useState("");

  const [steadfastModalOpen, setSteadfastModalOpen] = useState(false);
  const [steadfastPendingInvoice, setSteadfastPendingInvoice] = useState(null);

  // optional if you want RTK hooks
  const [createSteadfastOrder] = useCreateSteadfastOrderMutation();
  const [saveSteadfastLog] = useSaveSteadfastToCourierLogMutation();

  const [addWholeSeller, setAddWholeSeller] = useState(false);
  const [wholeSellerData, setWholeSellerData] = useState({
    wholeseller_id: "",
    wholeseller_name: "",
  });

  // 🆕 exchange helpers
  const [exchangeVendor, setExchangeVendor] = useState({
    vendor_id: "",
    vendor_name: "",
  });
  const [exchangePaymentMethods, setExchangePaymentMethods] = useState([]);
  const [exchangePaymentModal, setExchangePaymentModal] = useState(false);

  const [vendorModalTarget, setVendorModalTarget] = useState(null); // "exchange" | "purchase" | null

  // Bill attachment state
  const [billCopyUrl, setBillCopyUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      setBillCopyUrl(initialInvoice.bill_copy || "");
      // setPayAmount(parseFloat(initialInvoice.paid_amount) || 0);
      if (
        !initialInvoice.multiple_payment?.length ||
        (initialInvoice.multiple_payment &&
          initialInvoice.multiple_payment.find(
            (p) =>
              p.payment_type?.type_name?.toLowerCase() == "cash" ||
              p.payment_type_id == 99,
          ))
      ) {
        // skip: because cash will be handled in the multiple_payment block
      } else {
        setPayAmount(parseFloat(initialInvoice.paid_amount) || 0);
      }
      // 🟩 Sales edit  -------------------------------------------------
      if (!isPurchaseBilling) {
        setOrderType(initialInvoice.order_type || "shop");
        // 🔹 Detect wholesale invoices both from flag and API data
        const isThisWholesale =
          isWholeSaleBilling || initialInvoice.sales_type === "wholesale";

        if (isThisWholesale) {
          // 🟣 WHOLESALE EDIT
          setWholeSellerData({
            wholeseller_id:
              initialInvoice.wholeseller_id ||
              initialInvoice.wholeseller?.id ||
              "",
            wholeseller_name:
              initialInvoice.wholeseller_name ||
              initialInvoice.wholeseller?.name ||
              "",
          });

          // NEW: prefill delivery method + fee
          setSelectedDeliveryMethod(initialInvoice.delivery_method_id || null);
          setDeliveryFee(Number(initialInvoice.delivery_fee) || 0);
          setDeliveryMethodName(
            initialInvoice?.delivery_method?.type_name || "",
          );

          // Optional: keep DeliveryMethod/Pathao form in sync if opened during edit
          if (typeof window !== "undefined") {
            window.deliverySelection = {
              ...(window.deliverySelection || {}),
              deliveryFee: Number(initialInvoice.delivery_fee) || 0,
              // If your API returns these later, seed them too:
              // selectedStore: initialInvoice.delivery_store_id || "",
              // selectedCity: initialInvoice.delivery_city_id || "",
              // selectedZone: initialInvoice.delivery_zone_id || "",
            };
          }

          // line items (same logic as sales)
          if (initialInvoice.sales_details?.length) {
            const preloadedCart = initialInvoice.sales_details.map((detail) => {
              const base = detail.product_info || {};
              const child = detail.product_item || null;
              const imei_product = detail?.product_imei?.[0] || null;
              const variant = detail.product_variant || null; // 👈 NEW
              const childVariant = detail.child_product_variant || null;
              // detect variant vs. item vs. base
              if (variant) {
                // 🟣 product variant line
                return {
                  id: base.id,
                  product_variant_id: variant.id,
                  child_product_variant_id: childVariant?.id ?? null,
                  have_product_variant: 1,
                  name: `${base.name} - ${variant.name}${childVariant?.name ? ` - ${childVariant.name}` : ""}`,
                  barcode: variant.barcode || base.barcode,
                  qty: detail.qty,
                  price: parseFloat(detail.price) || 0,
                  have_variant: 0,
                  stock:
                    variant.quantity ??
                    detail.current_stock ??
                    base.current_stock,
                };
              }

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
          if (
            paymentGateways?.data?.data &&
            initialInvoice.multiple_payment?.length
          ) {
            const allPayments = initialInvoice.multiple_payment.map((m) => ({
              payment_type_id: m.payment_type_id,
              payment_type_category_id: m.payment_type_category_id,
              payment_amount: Number(m.payment_amount) || 0,
              methodName: m.payment_type?.type_name || "",
            }));

            const primary =
              allPayments.find((p) => p.methodName?.toLowerCase() === "cash") ||
              allPayments[0];

            const extras = allPayments.filter(
              (p) =>
                p.payment_type_id !== primary.payment_type_id ||
                p.payment_type_category_id !== primary.payment_type_category_id,
            );

            // --- Primary payment (main Cash) setup
            setPayAmount(primary.payment_amount);
            setSelectedGateway(
              paymentGateways.data.data.find(
                (g) => g.id === primary.payment_type_id,
              ) || null,
            );
            setSelectedAccount(primary.payment_type_category_id);
            setPaymentName(
              [primary.methodName, ...extras.map((e) => e.methodName)].join(
                " + ",
              ),
            );

            // --- Extra methods
            setPaymentMethods(extras);

            // --- Total Paid tracker
            const totalPaid = allPayments.reduce(
              (sum, p) => sum + (Number(p.payment_amount) || 0),
              0,
            );
            setTotalPaidAmount(totalPaid);
          }

          if (initialInvoice.saler) {
            setSelectedSeller(initialInvoice.saler.id);
            setSelectedSellerName(initialInvoice.saler.name || "");
          }

          toast.success("Wholesale invoice loaded for edit");
        } else {
          // 🟩 RETAIL SALES EDIT  -------------------------------------------------
          // customer info
          setExistingCustomerData({
            customer_id: initialInvoice.customer_id || "",
            customer_name: initialInvoice.customer_name || "",
            delivery_customer_name: initialInvoice.delivery_customer_name || "",
            delivery_customer_address:
              initialInvoice.delivery_customer_address || "",
            delivery_customer_phone:
              initialInvoice.delivery_customer_phone || "",
          });

          // NEW: prefill delivery method + fee
          setSelectedDeliveryMethod(initialInvoice.delivery_method_id || null);
          setDeliveryFee(Number(initialInvoice.delivery_fee) || 0);
          setDeliveryMethodName(
            initialInvoice?.delivery_method?.type_name || "",
          );

          // Optional: keep DeliveryMethod/Pathao form in sync if opened during edit
          if (typeof window !== "undefined") {
            window.deliverySelection = {
              ...(window.deliverySelection || {}),
              deliveryFee: Number(initialInvoice.delivery_fee) || 0,
            };
          }

          // line items
          if (initialInvoice.sales_details?.length) {
            const preloadedCart = initialInvoice.sales_details.map((detail) => {
              const base = detail.product_info || {};
              const child = detail.product_item || null;
              const imei_product = detail?.product_imei?.[0] || null;
              const variant = detail.product_variant || null; // 👈 NEW
              const childVariant = detail.child_product_variant || null;

              // 🟣 product_variant line
              if (variant) {
                return {
                  id: base.id,
                  product_variant_id: variant.id,
                  child_product_variant_id: childVariant?.id ?? null,
                  have_product_variant: 1,
                  name: `${base.name} - ${variant.name}${childVariant?.name ? ` - ${childVariant.name}` : ""}`, // 👈 this will show Small/Large
                  barcode: variant.barcode || base.barcode,
                  qty: detail.qty,
                  price: parseFloat(detail.price) || 0,
                  have_variant: 0,
                  items_values: [],
                  purchase_price:
                    parseFloat(detail.purchase_price) ||
                    parseFloat(base.purchase_price) ||
                    0,
                  stock:
                    variant.quantity ??
                    detail.current_stock ??
                    base.current_stock,
                };
              }

              return {
                id: base.id,
                child_id: child?.id ?? null,
                name: child ? `${base.name} - ${child.sku}` : base.name,
                barcode: child?.barcode || base.barcode,
                qty: detail.qty,
                price: parseFloat(detail.price) || 0,
                imei_product: imei_product,
                imei_id: imei_product?.id || null,
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
          // 🟩 Load multiple payment methods correctly for edit mode (final fixed)
          if (
            paymentGateways?.data?.data &&
            initialInvoice.multiple_payment?.length
          ) {
            const allPayments = initialInvoice.multiple_payment.map((m) => ({
              payment_type_id: m.payment_type_id,
              payment_type_category_id: m.payment_type_category_id,
              payment_amount: Number(m.payment_amount) || 0,
              methodName: m.payment_type?.type_name || "",
            }));

            // Pick "Cash" as main if present; otherwise first one
            const primary =
              allPayments.find((p) => p.methodName?.toLowerCase() === "cash") ||
              allPayments[0];

            const extras = allPayments.filter(
              (p) =>
                p.payment_type_id !== primary.payment_type_id ||
                p.payment_type_category_id !== primary.payment_type_category_id,
            );

            // --- Primary payment (main Cash) setup
            setPayAmount(primary.payment_amount);
            setSelectedGateway(
              paymentGateways.data.data.find(
                (g) => g.id === primary.payment_type_id,
              ) || null,
            );
            setSelectedAccount(primary.payment_type_category_id);
            setPaymentName(
              [primary.methodName, ...extras.map((e) => e.methodName)].join(
                " + ",
              ),
            );

            // --- Extra methods (Bkash etc.)
            setPaymentMethods(extras);

            // --- Track Total Paid (if using totalPaidAmount)
            const totalPaid = allPayments.reduce(
              (sum, p) => sum + (Number(p.payment_amount) || 0),
              0,
            );
            setTotalPaidAmount(totalPaid);
          }

          if (initialInvoice.saler) {
            setSelectedSeller(initialInvoice.saler.id);
            setSelectedSellerName(initialInvoice.saler.name || "");
          }

          toast.success("Sales invoice loaded for edit");
        }
      }

      // 🟦 Purchase edit  ---------------------------------------------
      else if (isPurchaseBilling) {
        setVendorData({
          vendor_id: initialInvoice.vendor_id || "",
          vendor_name: initialInvoice.vendor_name || "",
        });
        setWarehouseData(initialInvoice.warehouse_id || "");

        // 🟣 Load purchase multiple payments -------------
        if (
          paymentGateways?.data?.data &&
          initialInvoice.multiple_payments?.length
        ) {
          const allPayments = initialInvoice.multiple_payments.map((m) => ({
            payment_type_id: m.payment_type_id,
            payment_type_category_id: m.payment_type_category_id,
            payment_amount: Number(m.payment_amount) || 0,
            methodName: m.payment_type?.type_name || "",
          }));

          // Pick "Cash" as main, or first one if no cash
          const primary =
            allPayments.find((p) => p.methodName?.toLowerCase() === "cash") ||
            allPayments[0];

          const extras = allPayments.filter(
            (p) =>
              p.payment_type_id !== primary.payment_type_id ||
              p.payment_type_category_id !== primary.payment_type_category_id,
          );

          // --- Primary payment setup
          setPayAmount(primary.payment_amount);
          setSelectedGateway(
            paymentGateways.data.data.find(
              (g) => g.id === primary.payment_type_id,
            ) || null,
          );
          setSelectedAccount(primary.payment_type_category_id);
          setPaymentName(
            [primary.methodName, ...extras.map((e) => e.methodName)].join(
              " + ",
            ),
          );

          // --- Remaining extra methods
          setPaymentMethods(extras);

          // --- Total paid tracker
          const totalPaid = allPayments.reduce(
            (sum, p) => sum + (Number(p.payment_amount) || 0),
            0,
          );
          setTotalPaidAmount(totalPaid);
        }

        // ✅ purchase line items
        if (initialInvoice.purchase_details?.length) {
          const preloadedCart = initialInvoice.purchase_details.map(
            (detail) => {
              const base = detail.product_info || {};
              const child = detail.product_items || null;
              const variant = detail.product_variant || null; // 🆕
              console.log(variant);

              if (variant) {
                return {
                  id: base.id,
                  product_variant_id: variant.id,
                  have_product_variant: 1,
                  name: `${base.name} - ${variant.name}`,
                  barcode: variant.barcode || base.barcode,
                  qty: detail.qty,
                  price: parseFloat(detail.price) || 0,
                  stock:
                    variant.quantity ??
                    detail.remaining_qty ??
                    detail.current_stock ??
                    base.current_stock,
                };
              }

              // pick IMEI for THIS row
              const imeiForThisRow = Array.isArray(detail.product_imei)
                ? (detail.product_imei.find(
                  (pi) => (pi.product_id ?? base.id) === base.id,
                ) ?? detail.product_imei[0])
                : null;

              const imeiDetails = imeiForThisRow
                ? {
                  imei: imeiForThisRow.imei || "",
                  color: imeiForThisRow.color || "",
                  storage: imeiForThisRow.storage || "",
                  battery: imeiForThisRow.battery_life || "",
                  model: imeiForThisRow.model || "",
                  warranty: imeiForThisRow.warranty || "",
                  last_price: imeiForThisRow.last_price || "",
                }
                : null;

              // prefilled form for edit modal
              const imeiForm = imeiForThisRow
                ? {
                  purchase_price: Number(imeiForThisRow.purchase_price) || 0,
                  sale_price: Number(imeiForThisRow.sale_price) || 0,
                  last_price: Number(imeiForThisRow.last_price) || 0,
                  wholesale_price:
                    Number(imeiForThisRow.wholesale_price) || 0,
                  color: imeiForThisRow.color || "",
                  color_code: imeiForThisRow.color_code || "",
                  storage: imeiForThisRow.storage || "",
                  battery_life: imeiForThisRow.battery_life || "",
                  model: imeiForThisRow.model || "",
                  warranty: imeiForThisRow.warranty || "",
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
            },
          );
          setOrderList(preloadedCart);
        }

        toast.success("Purchase invoice loaded for edit");
      }
    }
  }, [editMode, initialInvoice, isPurchaseBilling, paymentGateways]);

  useEffect(() => {
    if (!addVendor) setVendorModalTarget(null);
  }, [addVendor]);

  // to fix arif's issue
  useEffect(() => {
    if (orderList.length === 0) {
      setPayAmount(0);
      setTotalPaidAmount(0);
      setPaymentMethods([]);
      setPaymentName("Cash");
    }
  }, [orderList]);

  // save purchase func
  const savePurchase = useMutation({
    mutationFn: async (payload) => {
      return api.post("/save-purchase", payload);
    },
    onSuccess: (response) => {
      console.log(response);
      dispatch(
        apiSlice.util.invalidateTags([
          "HoldInvoice",
          "CompleteInvoice",
          "HeldPurchaseInvoice",
        ]),
      );
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

  const handleRemoveCart = ({
    id,
    child_id = null,
    imei_id = null,
    product_variant_id = null,
    child_product_variant_id = null,
  }) => {
    // const remaining = orderList.filter((item) => {
    //   if (imei_id) return item.imei_id !== imei_id;
    //   // delete specific variant row
    //   if (product_variant_id != null && item.have_product_variant) {
    //     return !(
    //       item.id === id && item.product_variant_id === product_variant_id
    //     );
    //   }
    //   if (child_id) return !(item.id === id && item.child_id === child_id);
    //   return item.id !== id;
    // });

    const remaining = orderList.filter((item) => {
      // 🔹 IMEI removal (highest priority)
      if (imei_id) {
        return item.imei_id !== imei_id;
      }

      // 🔹 Remove specific child variant row
      if (
        product_variant_id != null &&
        child_product_variant_id != null
      ) {
        return !(
          item.id === id &&
          item.product_variant_id === product_variant_id &&
          item.child_product_variant_id === child_product_variant_id
        );
      }

      // 🔹 Remove variant without child
      if (
        product_variant_id != null &&
        child_product_variant_id == null
      ) {
        return !(
          item.id === id &&
          item.product_variant_id === product_variant_id &&
          item.child_product_variant_id == null
        );
      }

      // 🔹 Remove non-variant child (legacy support)
      if (child_id) {
        return !(item.id === id && item.child_id === child_id);
      }

      // 🔹 Remove simple product
      return item.id !== id;
    });

    setOrderList(remaining);
    dispatch(removeVariation(id));

    const remainingWarranties = warranties.filter((w) => w.product_id !== id);
    setWarranties(remainingWarranties);
  };

  // const handleDiscount = (e) => {
  //   if (e.key == "Enter") {
  //     const customerFields = Object.values(customerData);
  //     const allFields = customerFields.filter(Boolean);

  //     if (customerFields.length - 2 === allFields.length) {
  //       setPaymentModal(true);
  //     } else {
  //       setCustomerModal(true);
  //     }
  //   }
  // };

  const handleDiscount = () => { };

  const handleDate = (fieldName, date) => {
    setTransactionDate(date);
  };

  // Handle bill copy file upload
  const handleBillCopyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file_name", file);

    try {
      const res = await api.post("/file-upload", formData);
      if (res.status === 200) {
        setBillCopyUrl(res.data.path);
        toast.success("Bill copy uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload bill copy");
    }
  };

  const handleComplete = async (arg) => {
    if (isProcessing) return; // prevent double-click
    const status = typeof arg === "object" ? arg.status : arg;
    const paidFromModal = typeof arg === "object" ? arg.paidAmount : null;
    setIsProcessing(true);
    try {
      // 🚫 Prevent completing empty order
      if (!orderList.length) {
        toast.error("No products added to the order. Please add items first.");
        return;
      }
      // --- 1️⃣ Validate IMEI/serial only for products that truly require it
      const imeiRequiredItems = orderList.filter(
        (item) => item.have_variant && !item.child_id && !item.product_item_id,
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

      // --- 2️⃣ Prepare selected payment methods (fixed logic)
      let selectedMethods = [];

      // Add main method
      if (selectedGateway && selectedAccount) {
        selectedMethods.push({
          payment_type_id: selectedGateway.id,
          payment_type_category_id: Number(selectedAccount),
          payment_amount: Number(payAmount) || 0,
        });
      }

      // Append extra methods if any
      if (paymentMethods?.length) {
        selectedMethods = selectedMethods.concat(
          paymentMethods
            .filter((m) => m.payment_amount > 0)
            .map((m) => ({
              payment_type_id: m.payment_type_id,
              payment_type_category_id: m.payment_type_category_id,
              payment_amount: Number(m.payment_amount),
            })),
        );
      }

      // Total paid sum
      // const paidAmount =
      //   (Number(totalPaidAmount) || 0) > 0
      //     ? Number(totalPaidAmount)
      //     : selectedMethods.reduce(
      //         (sum, pm) => sum + (Number(pm.payment_amount) || 0),
      //         0,
      //       );

      const paidAmount =
        paidFromModal != null
          ? Number(paidFromModal)
          : (Number(totalPaidAmount) || 0) > 0
            ? Number(totalPaidAmount)
            : selectedMethods.reduce(
              (sum, pm) => sum + (Number(pm.payment_amount) || 0),
              0,
            );

      // --- 3️⃣ Prepare transformed order products list
      const transformedArray = orderList
        .filter((item) => !item.is_exchange) // ✅ exclude exchange rows here
        .map((item) => {
          const baseData = {
            product_id: item.id,
            qty: item.qty || 1,
            retails_price:
              item.child_id && item.child_sell_price
                ? item.child_sell_price
                : (item.retail_price_value ??
                  product[item.id]?.retails_price ??
                  item.price),
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

          // ✅ NEW: product_variants (both sales and purchase)
          if (item.have_product_variant) {
            return {
              ...baseData,
              product_variant_id: item.product_variant_id,
              child_product_variant_id: item.child_product_variant_id ?? null,
              have_variant: 0,
              have_product_variant: 1,
              price: item.price,
              retails_price: item.retails_price || 0,
            };
          }

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
            last_price: imeiForm.last_price || "",
            wholesale_price: imeiForm.wholesale_price || "",
            color: imeiForm.color || "",
            color_code: imeiForm.color_code || "",
            storage: imeiForm.storage || "",
            battery_life: imeiForm.battery_life || "",
            model: imeiForm.model || "",
            warranty: imeiForm.warranty || "",
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
        delivery_fee: deliveryFee || 0,
        ...(window.deliverySelection && {
          delivery_store_id: window.deliverySelection.selectedStore || null,
          delivery_city_id: window.deliverySelection.selectedCity || null,
          delivery_zone_id: window.deliverySelection.selectedZone || null,
        }),
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
        ...(!isPurchaseBilling &&
          !isWholeSaleBilling && {
          // regular sale billing
          customer_id:
            existingCustomerData.customer_id || customerData.customer_id,
          customer_name:
            existingCustomerData.customer_name || customerData.name,
          sales_id: selectedSeller,
        }),
        ...(isWholeSaleBilling && {
          wholeseller_id: wholeSellerData.wholeseller_id,
          wholeseller_name: wholeSellerData.wholeseller_name,
          sales_id: selectedSeller,
          sales_type: "wholesale",
        }),
        ...(isPurchaseBilling && {
          warehouse_id: warehouseData,
          vendor_id: vendorData.vendor_id,
          vendor_name: vendorData.vendor_name,
        }),
        bill_copy: billCopyUrl || "",
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

      // 🟣  If Pathao is selected, skip calling save-sales now.
      //     We’ll call it later from the Pathao modal after collecting receiver info.
      // 🟣  If Pathao is selected by name, skip calling save-sales now.
      const allMethods = window?.deliverySelection?.allMethods || [];
      const methodObj = allMethods.find(
        (m) => String(m.id) === String(selectedDeliveryMethod),
      );
      const methodName = methodObj?.type_name?.toLowerCase() || "";

      // 2️⃣ Pathao check
      if (methodName === "pathao") {
        setPathaoPendingInvoice({ payload, orderList, total });
        setPathaoModalOpen(true);
        return; // stop normal API call
      }
      if (methodName === "steadfast") {
        setSteadfastPendingInvoice({ payload, orderList, total });
        setSteadfastModalOpen(true);
        return;
      }
      const res = await api.post(apiUrl, payload);

      // --- 7️⃣ Handle success
      if (res?.data?.success) {
        dispatch(
          apiSlice.util.invalidateTags([
            "HoldInvoice",
            "CompleteInvoice",
            "HeldPurchaseInvoice",
            "AllSellInvoice",
          ]),
        );
        toast.success("Order saved successfully");

        // 🆕 after saving sales, now handle exchange purchase if any
        await handleExchangePurchase(res?.data?.data);

        // ✅ use existing invoice id if update API doesn't return one
        const invoiceId =
          res?.data?.data?.invoice_id ||
          initialInvoice?.invoice_id ||
          payload?.invoice_id;

        router.push(`/invoice/${invoiceId}`);

        // ✅ Reset after completion
        setPaymentModal(false);
        setOrderList([]);
        dispatch(clearAllVariations());
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExchangePurchase = async (salesResponse) => {
    try {
      const exchangeItems = orderList.filter((p) => p.is_exchange);
      if (!exchangeItems.length) return;

      // --- mandatory vendor
      if (!exchangeVendor.vendor_id) {
        toast.error("Please select a vendor for the exchange purchase first.");
        setExchangePaymentModal(true);
        return;
      }

      // Build variants from Redux VariationForm when available
      // Fallback to previous item.imei_form/item fields if not
      const variants = [];
      let variantsSubtotal = 0;

      exchangeItems.forEach((item) => {
        const storeProd = product?.[item.id]; // from Redux: state.variations.products
        const vList = storeProd?.variants || [];

        if (item.have_variant && !item.child_id && vList.length > 0) {
          // Use values from VariationForm (Redux)
          vList.forEach((v) => {
            const row = {
              product_id: item.id,
              name: item.name,
              serial: v.serial || "",
              purchase_price: Number(v.purchase_price || item.price || 0),
              wholesale_price: Number(
                v.wholesale_price || v.purchase_price || 0,
              ),
              // VariationForm uses "retails_price" for sale price
              retails_price: Number(v.retails_price || v.purchase_price || 0),
              last_price: Number(v.last_price || 0),
              storage: v.storage || "",
              color: v.color || "",
              color_code: v.color_code || "",
              battery_life: v.battery_life || "",
              model: v.model || "",
              warranty: v.warranty || "",
              region: v.region || "",
              image_path: v.image_path || "",
              product_condition: v.product_condition || "",
              note: v.note || "",
              quantity: Number(v.quantity || 1),
              sales_id: salesResponse?.invoice_id,
              exchange: 1,
            };
            variants.push(row);
            variantsSubtotal +=
              Number(row.purchase_price) * Number(row.quantity);
          });
        } else {
          // Fallback (previous behavior): use item.imei_form or item fields
          const f = item.imei_form || {};
          const row = {
            product_id: item.id,
            name: item.name,
            serial: f.serial || item.imei_details?.imei || "",
            purchase_price: Number(f.purchase_price || item.price || 0),
            wholesale_price: Number(
              f.wholesale_price || f.purchase_price || item.price || 0,
            ),
            retails_price: Number(
              f.retails_price ||
              f.sale_price ||
              f.purchase_price ||
              item.price ||
              0,
            ),
            last_price: Number(f.last_price || 0),
            storage: f.storage || "",
            color: f.color || "",
            color_code: f.color_code || "",
            battery_life: f.battery_life || "",
            model: f.model || "",
            warranty: f.warranty || "",
            region: f.region || "",
            image_path: f.image_path || "",
            product_condition: f.product_condition || "",
            note: f.note || "",
            quantity: Number(item.qty || 1),
            sales_id: salesResponse?.invoice_id,
            exchange: 1,
          };
          variants.push(row);
          variantsSubtotal += Number(row.purchase_price) * Number(row.quantity);
        }
      });

      // --- payment methods (use exchange modal ones if exist)
      const paymentPayload =
        exchangePaymentMethods.length > 0
          ? exchangePaymentMethods
          : [
            {
              payment_type_id: 99,
              payment_type_category_id: 103,
              payment_amount: variantsSubtotal,
            },
          ];

      const payload = {
        pay_mode: "Cash",
        paid_amount: variantsSubtotal,
        sub_total: variantsSubtotal,
        vat: 0,
        tax: 0,
        discount: 0,
        product: [], // keep intact as in your current implementation
        payment_method: paymentPayload,
        variants, // now populated from VariationForm when available
        created_at: new Date().toISOString(),
        warehouse_id: null,
        imeis: [],
        vendor_id: exchangeVendor.vendor_id,
        vendor_name: exchangeVendor.vendor_name,
        delivery_customer_name:
          existingCustomerData.customer_name || customerData.name,
        delivery_customer_address:
          existingCustomerData.delivery_customer_address ||
          customerData.address,
        delivery_customer_phone:
          existingCustomerData.delivery_customer_phone ||
          customerData.mobile_number,
      };

      const res = await api.post("/save-purchase", payload);
      if (res?.data?.success) {
        dispatch(
          apiSlice.util.invalidateTags([
            "HoldInvoice",
            "CompleteInvoice",
            "HeldPurchaseInvoice",
          ]),
        );
        toast.success("Exchange purchase recorded successfully.");
      } else {
        toast.error("Exchange purchase failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Exchange purchase error.");
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
    // 1️⃣ Split sale vs exchange
    const saleItems = orderList.filter((p) => !p.is_exchange);
    const exchangeItems = orderList.filter((p) => p.is_exchange);

    // 2️⃣ Sum each type
    const saleSub = saleItems.reduce(
      (prev, curr) => prev + getLineSubtotal(curr),
      0,
    );
    const exchangeSub = exchangeItems.reduce(
      (prev, curr) => prev + getLineSubtotal(curr),
      0,
    );

    // 3️⃣ Net subtotal (sales − exchange)
    let sub = Math.max(saleSub - exchangeSub, 0);

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
    const grandTotal =
      taxable +
      vatAmount +
      taxAmountLocal +
      Math.max(Number(deliveryFee || 0), 0);

    setTotal(grandTotal);
    // 🟩 Do NOT auto‑set payAmount unless there's an edit invoice
    if (
      editMode &&
      initialInvoice?.paid_amount &&
      !initialInvoice.multiple_payment?.length
    ) {
      setPayAmount(parseFloat(initialInvoice.paid_amount));
    } else if (payAmount === 0) {
      // leave as 0 until user adds payment
    }
  }, [orderList, discountType, discount, vatPercent, taxPercent, deliveryFee]);

  const subTotal = orderList
    .filter((item) => !item.is_exchange)
    .reduce((prev, curr) => prev + getLineSubtotal(curr), 0);

  // CUstomer panel

  const discountNum = Number(discount) || 0;
  const discountAmount =
    discountType === "fixed" ? discountNum : (subTotal * discountNum) / 100;

  const taxableAmount = Math.max(subTotal - discountAmount, 0);
  const vatAmount = !isPurchaseBilling ? (taxableAmount * vatPercent) / 100 : 0;

  const taxAmount = isPurchaseBilling ? (taxableAmount * taxPercent) / 100 : 0;

  const totalItems = orderList.reduce(
    (prev, curr) => prev + (curr.qty || 0),
    0,
  );

  // 🚀 Send live updates to customer display
  useEffect(() => {
    const summary = {
      subTotal,
      total,
      discount: discountAmount,
      vat: vatAmount,
    };

    if (window.customerDisplayRef && !window.customerDisplayRef.closed) {
      window.customerDisplayRef.postMessage(
        { type: "POS_UPDATE", payload: { cart: orderList, summary } },
        "*",
      );
    }
  }, [orderList, subTotal, total, discountAmount, vatAmount]);

  // Handle keyboard shortcuts aND Enter key navigation
  useEffect(() => {
    const handleShortcuts = (e) => {
      // ⌨️ Ctrl+P opens Payment
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaymentModal(true);
      }

      // ⌨️ Enter inside Payment Modal = complete order
      // if (e.key === "Enter" && paymentModal) {
      //   e.preventDefault();
      //   handleComplete(1);
      // }
    };

    document.addEventListener("keydown", handleShortcuts);
    return () => document.removeEventListener("keydown", handleShortcuts);
  }, [paymentModal]);

  return (
    <ProtectedRoute featureName={featureName} optionName={optionName}>
      <div className="container mx-auto">
        {/* === MOBILE TAB BAR === */}
        <div className="md:hidden sticky top-0 z-[60] flex border-b border-violet-200 bg-white shadow-sm">
          {["search", "cart", "summary"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors
                ${mobileTab === tab
                  ? "text-violet-700 border-b-2 border-violet-600 bg-violet-50/60"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              {tab === "search" && <SearchIcon className="w-4 h-4" />}
              {tab === "cart" && (
                <span className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {orderList.length > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-violet-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {orderList.length}
                    </span>
                  )}
                </span>
              )}
              {tab === "summary" && <Receipt className="w-4 h-4" />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row h-[calc(100vh-100px)] md:h-[calc(100vh-60px)] overflow-hidden bg-gray-50"
          style={{ gap: "12px" }}
        >
          {/* Left Panel – Cart & Order List */}
          <div className={`flex flex-col w-full md:w-[65%] h-full bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-violet-100
            ${mobileTab === "cart" ? "flex" : "hidden md:flex"}`}>
            {/* 🔝 HEADER SECTION (Always fixed at top) */}
            {!isPurchaseBilling ? (
              // 🟣 SALES HEADER
              <div
                className="sticky top-0 z-20 bg-gradient-to-r from-violet-50 via-indigo-50 to-fuchsia-50 
                  border-b border-violet-200 shadow-sm backdrop-blur-[2px]"
              >
                <div className="flex flex-wrap items-center justify-between py-2.5 px-2 md:px-4 gap-2 md:gap-4">
                  {/* LEFT SECTION – Seller + Customer */}
                  <div className="flex flex-col md:flex-row flex-1 w-full md:w-auto items-stretch md:items-center gap-2 md:gap-3">
                    {/* Seller dropdown */}
                    <div className="flex-1 w-full">
                      <AddSeller
                        selectedSeller={selectedSeller}
                        setSelectedSeller={setSelectedSeller}
                        setSelectedSellerName={setSelectedSellerName}
                      />
                    </div>

                    {isWholeSaleBilling ? (
                      <>
                        <div className="flex-1 w-full flex items-center gap-1">
                          <ExistingWholeSellerList
                            schema={wholeSellerData}
                            setSchema={setWholeSellerData}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-lg border-violet-300 bg-violet-100/80 text-violet-700 
                hover:bg-violet-200 hover:text-violet-800"
                            title="Add new whole seller"
                            onClick={() => setAddWholeSeller(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Customer dropdown + add button */}
                        <div className="flex-1 w-full flex items-center gap-1">
                          <ExistingCustomerList
                            orderSchema={existingCustomerData}
                            setOrderSchema={setExistingCustomerData}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-lg border-violet-300 bg-violet-100/80 text-violet-700 
                       hover:bg-violet-200 hover:text-violet-800 transition-all shadow-[0_1px_4px_rgba(138,43,226,0.2)]"
                            title="Add new customer"
                            onClick={() => setCustomerModal(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* RIGHT – DATE PICKER */}
                  <div className="w-[160px] flex items-center justify-end">
                    <CustomDatePicker
                      fieldName="created_at"
                      setValue={handleDate}
                      type="normal"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // 💜 PURCHASE HEADER
              <div
                className="sticky top-0 z-20 bg-gradient-to-r from-violet-50 via-indigo-50 to-fuchsia-50 
                  border-b border-violet-200 shadow-sm backdrop-blur-[2px]"
              >
                <div className="flex flex-wrap items-center justify-between py-2.5 px-2 md:px-4 gap-2 md:gap-4">
                  {/* LEFT SECTION – Vendor + Warehouse */}
                  <div className="flex flex-col md:flex-row flex-1 w-full md:w-auto items-stretch md:items-center gap-2 md:gap-3">
                    {/* Vendor dropdown + add */}
                    <div className="flex-1 min-w-0 md:min-w-[210px] flex items-center gap-1">
                      <VendorsList
                        setOrderSchema={setVendorData}
                        selectedVendor={selectedVendor}
                        setSelectedVendor={setSelectedVendor}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 rounded-lg border-violet-300 bg-violet-100/80 text-violet-700 
                       hover:bg-violet-200 hover:text-violet-800 transition-all shadow-[0_1px_4px_rgba(138,43,226,0.2)]"
                        title="Add new vendor"
                        onClick={() => {
                          setVendorModalTarget("purchase");
                          setAddVendor(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Warehouse dropdown */}
                    <div className="flex-1 min-w-[210px]">
                      <WarehouseList
                        setOrderSchema={setWarehouseData}
                        setWarehouseName={setWarehouseName}
                      />
                    </div>
                  </div>

                  {/* RIGHT – DATE PICKER */}
                  <div className="w-[160px] flex items-center justify-end">
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
            {/* <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto bg-white rounded-none p-2 custom-scrollbar"> */}
            <div className="flex-1 min-h-0 bg-white rounded-none p-2">
              {console.log("orderList........... ", orderList)}
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
            {/* 🧮 FOOTER: Remarks + Total Payable */}
            {/* 🧮 FOOTER: Remarks + Total Payable */}
            <div className="border-t border-violet-100 bg-gradient-to-r from-violet-50 via-indigo-50 to-fuchsia-50 px-2 md:px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between shadow-[0_-2px_6px_rgba(138,43,226,0.12)] z-[50] relative rounded-t-xl gap-2">
              {/* Remarks input */}
              <div className="flex-1 md:mr-3">
                <Input
                  placeholder="Write a quick remark..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="h-8 w-full text-sm bg-white/80 border border-violet-200 rounded-md focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Total Payable section */}
              <div className="relative flex items-center justify-end min-w-0 md:min-w-[220px] px-3 py-2 bg-white rounded-lg border border-violet-200 shadow-[0_0_8px_rgba(167,139,250,0.25)]">
                {/* 🧾 total items badge — now top-left */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -left-2 flex items-center gap-1 bg-gradient-to-r from-violet-100 via-indigo-100 to-fuchsia-100 border border-violet-200 text-[10px] font-medium text-violet-600 px-2 py-[1px] rounded-full shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path d="M6 6a2 2 0 00-2 2v7.5A2.5 2.5 0 006.5 18H15a2 2 0 002-2V6a2 2 0 00-2-2H6z" />
                    </svg>
                    {totalItems} item{totalItems > 1 ? "s" : ""}
                  </span>
                )}

                <span className="text-[11px] uppercase tracking-wide text-violet-500 font-semibold mr-2">
                  Total Payable
                </span>
                <span className="text-lg md:text-2xl font-extrabold text-violet-700 leading-none drop-shadow-[0_1px_1px_rgba(138,43,226,0.25)]">
                  ৳{formatBangladeshiAmount(total?.toFixed(2)) || "0.00"}
                </span>
              </div>
            </div>
          </div>
          {/* 👉 RIGHT PANEL: product search + order summary */}
          <div className={`flex flex-col w-full md:w-[35%] h-full bg-white rounded-lg border shadow-md
            ${mobileTab === "search" || mobileTab === "summary" ? "flex" : "hidden md:flex"}`}>
            {/* 🔍 PRODUCT SEARCH SECTION */}
            <div className={`border-b bg-gray-50 py-1
              ${mobileTab === "search" ? "flex flex-col" : "hidden md:block"}`}>
              <ScrollListWithSearch
                type={isPurchaseBilling}
                orderList={orderList}
                setOrderList={setOrderList}
                discountRef={discountRef}
              />
            </div>

            {/* 🧾 ORDER SUMMARY + ACTIONS */}
            <div className={`flex flex-col flex-1 bg-gradient-to-b from-violet-50 to-indigo-50 min-h-0
              ${mobileTab === "summary" ? "flex" : "hidden md:flex"}`}>
              {/* 🧾 Inline Discount & Order Type */}
              <div className="px-3 pt-2 pb-2 bg-white border-b border-violet-100">
                <div className="flex gap-3 w-full">
                  {/* --- Discount (Left 50%) --- */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Discount
                    </label>
                    <Discount
                      discountRef={discountRef}
                      discountType={discountType}
                      setDiscountType={setDiscountType}
                      discount={discount}
                      setDiscount={setDiscount}
                      handleDiscount={handleDiscount}
                    />
                  </div>

                  {/* --- Inline Order Type Toggle (Right 50%) --- */}
                  {!isPurchaseBilling && (
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Order Type
                      </label>

                      <Select
                        value={orderType}
                        onValueChange={(value) => setOrderType(value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shop">Shop</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              {/* 🧮 Totals Summary Card */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
                <div className="rounded-xl bg-white shadow-sm border border-violet-100 overflow-hidden">
                  {/* Header with icons and quick info */}
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-violet-50 to-indigo-50 text-xs text-gray-700">
                    <TooltipProvider delayDuration={200}>
                      <div className="flex items-center gap-2">
                        {/* Delivery Method */}
                        {!isPurchaseBilling && (
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
                        )}

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
                          <TooltipContent side="bottom">
                            {isPurchaseBilling ? "Tax" : "VAT"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Bill Attachment */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className={`h-8 w-8 rounded-full border-violet-300 ${billCopyUrl
                                ? "bg-green-50 text-green-600 border-green-300"
                                : "bg-white text-violet-600"
                                } hover:bg-violet-50 hover:text-violet-700`}
                              onClick={() =>
                                document
                                  .getElementById("bill-copy-input")
                                  .click()
                              }
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {billCopyUrl ? "Bill Attached ✓" : "Attach Bill"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Hidden file input */}
                        <input
                          id="bill-copy-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleBillCopyUpload}
                        />
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
                          {formatBangladeshiAmount(subTotal.toFixed(2))}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 gap-1 px-4 py-1 pt-2 text-sm text-gray-700">
                    {isPurchaseBilling && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-semibold">Vendor</span>
                          <span className="truncate max-w-[100px] font-semibold">
                            {vendorData.vendor_name || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Warehouse</span>
                          <span className="truncate max-w-[100px] font-semibold">
                            {warehouseName || "-"}
                          </span>
                        </div>
                      </>
                    )}
                    {!isPurchaseBilling && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-semibold">Order Type</span>
                          <span className="capitalize font-semibold">
                            {orderType}
                          </span>
                        </div>
                        {isWholeSaleBilling ? (
                          <div className="flex justify-between">
                            <span className="font-semibold">WholeSeller</span>
                            <span className="  font-semibold">
                              {wholeSellerData.wholeseller_name || "-"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className="font-semibold">Customer</span>
                            <span className="  font-semibold">
                              {existingCustomerData.customer_name || "-"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-semibold">Seller</span>
                          <span className="  font-semibold">
                            {selectedSellerName || "-"}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold">Pay Mode</span>
                      <span className="font-semibold">{paymentName}</span>
                    </div>
                    <div className="space-y-1 border-t border-dashed">
                      <div className="flex justify-between">
                        <span className="font-semibold">Subtotal</span>
                        {(() => {
                          const saleSub = orderList
                            .filter((p) => !p.is_exchange)
                            .reduce(
                              (s, i) =>
                                s + Number(i.price || 0) * Number(i.qty || 1),
                              0,
                            );
                          const exchSub = orderList
                            .filter((p) => p.is_exchange)
                            .reduce(
                              (s, i) =>
                                s + Number(i.price || 0) * Number(i.qty || 1),
                              0,
                            );
                          const net = saleSub - exchSub;
                          return (
                            <span className="font-semibold">
                              {formatBangladeshiAmount(net.toFixed(2))}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Discount</span>
                        <span className="font-semibold">
                          {formatBangladeshiAmount(discountAmount.toFixed(2))}
                        </span>
                      </div>
                      {!isPurchaseBilling && (
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            VAT ({vatPercent || 0}%)
                          </span>
                          <span className="font-semibold">
                            {formatBangladeshiAmount(vatAmount.toFixed(2))}
                          </span>
                        </div>
                      )}
                      {!isPurchaseBilling && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Delivery Fee</span>
                          <span className="font-semibold">
                            {formatBangladeshiAmount(deliveryFee.toFixed(2))}
                          </span>
                        </div>
                      )}
                      {isPurchaseBilling && (
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            Tax ({formatBangladeshiAmount(taxPercent) || 0}%)
                          </span>
                          <span className="font-semibold">
                            {formatBangladeshiAmount(taxAmount.toFixed(2))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border-t border-dashed px-4 py-1 pb-2 text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">Paid</span>
                      <span className="font-semibold">
                        {formatBangladeshiAmount(
                          totalPaidAmount || payAmount || 0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Due</span>
                      <span className="font-semibold">
                        {formatBangladeshiAmount(
                          Math.max(
                            total - (totalPaidAmount || payAmount || 0),
                            0,
                          ).toFixed(2),
                        )}
                      </span>
                    </div>
                    {(totalPaidAmount || payAmount) > total && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Change</span>
                        <span className="font-semibold">
                          {formatBangladeshiAmount(
                            ((totalPaidAmount || payAmount) - total).toFixed(2),
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 💰 Total Payable */}
                  {/* <div className="px-4 py-3 text-center text-lg font-bold text-violet-700 border-t bg-violet-50 shadow-inner">
                  Total Payable: ৳{total?.toFixed(2) || "0.00"}
                </div> */}
                </div>
              </div>

              {/* 🆕 Exchange vendor + payment section */}
              {orderList.some((p) => p.is_exchange) && (
                <div className="border-t mt-3 pt-3 space-y-2 px-4 pb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Exchange Vendor
                  </label>

                  <div className="flex items-center gap-1">
                    <VendorsList
                      setOrderSchema={setExchangeVendor}
                      selectedVendor={exchangeVendor}
                      setSelectedVendor={setExchangeVendor}
                      placeholder="Select Vendor"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-lg border-yellow-300 bg-yellow-100/80 text-yellow-700 
          hover:bg-yellow-200 hover:text-yellow-800"
                      title="Add new vendor"
                      onClick={() => {
                        setVendorModalTarget("exchange");
                        setAddVendor(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => setExchangePaymentModal(true)}
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-400 text-yellow-700 mt-1 hover:bg-yellow-50"
                  >
                    Add Exchange Payment
                  </Button>

                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Total Exchange Value</span>
                    <span className="font-semibold text-red-600">
                      −
                      {formatBangladeshiAmount(
                        orderList
                          .filter((p) => p.is_exchange)
                          .reduce(
                            (sum, i) =>
                              sum + Number(i.price || 0) * Number(i.qty || 1),
                            0,
                          )
                          .toFixed(2),
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* 🎯 Action Buttons */}
              <div className="p-2 md:p-3 bg-white border-t shadow-inner flex flex-wrap md:flex-nowrap gap-2 md:gap-3 sticky bottom-0 z-10">
                <Button
                  onClick={() => handleComplete(0)}
                  variant="outline"
                  disabled={isProcessing}
                  className="flex-1 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hand className="w-4 h-4 mr-2" />}
                  {isProcessing ? "Processing..." : "Hold"}
                </Button>

                <Button
                  onClick={() => setPaymentModal(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RiMoneyCnyBoxFill className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>

                <Button
                  onClick={() => handleComplete(1)}
                  disabled={isProcessing}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isProcessing ? "Processing..." : "Complete"}
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
              setExistingCustomerData={setExistingCustomerData}
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
              setOrderSchema={
                vendorModalTarget === "exchange"
                  ? setExchangeVendor
                  : setVendorData
              }
              setSelectedVendor={
                vendorModalTarget === "exchange"
                  ? // keep exchange state shape consistent (vendor_id/vendor_name)
                  (opt) =>
                    setExchangeVendor((prev) => ({
                      ...prev,
                      vendor_id: opt?.value || "",
                      vendor_name: opt?.label || "",
                    }))
                  : setSelectedVendor
              }
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
              setTotalPaidAmount={setTotalPaidAmount}
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
              setDeliveryFee={setDeliveryFee} // ✅ send parent setter
              setDeliveryModal={setDeliveryModal} // ✅ allow child to close itself
            />
          }
        />

        {/* Tax view modal */}
        <Modal
          title={isPurchaseBilling ? "Tax Details" : "VAT Details"}
          onClose={setTaxModalOpen}
          open={taxModalOpen}
          content={
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatBangladeshiAmount(subTotal.toFixed(2))} BDT</span>
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

        {/* Pathao Create Order modal */}
        <Modal
          title="Pathao Order Details"
          onClose={setPathaoModalOpen}
          open={pathaoModalOpen}
          content={
            pathaoPendingInvoice && (
              <PathaoOrderForm
                orderList={pathaoPendingInvoice.orderList}
                total={pathaoPendingInvoice.total}
                customerData={{ ...existingCustomerData, ...customerData }}
                onSubmit={async (formValues) => {
                  // merge form values into payload before calling APIs
                  const payload = {
                    ...pathaoPendingInvoice.payload,
                    delivery_customer_name: formValues.recipient_name,
                    delivery_customer_address: formValues.recipient_address,
                    delivery_customer_phone: formValues.recipient_phone,
                    delivery_fee: Number(formValues.delivery_fee) || 0,
                  };

                  // 1️⃣ Save sales first — needs receiver info in payload
                  const res = await api.post("/save-sales", payload);
                  if (!res?.data?.success) {
                    toast.error("Failed to save sales before Pathao order");
                    return;
                  }
                  dispatch(
                    apiSlice.util.invalidateTags([
                      "HoldInvoice",
                      "CompleteInvoice",
                      "AllSellInvoice",
                    ]),
                  );
                  const invoiceId = res.data.data.invoice_id;

                  // 2️⃣ Then create Pathao order using invoiceId
                  const orderPayload = {
                    store_id: formValues.store_id,
                    merchant_order_id: invoiceId,
                    recipient_name: formValues.recipient_name,
                    recipient_phone: formValues.recipient_phone,
                    recipient_address: formValues.recipient_address,
                    special_instruction: formValues.special_instruction || "",
                    recipient_city: formValues.city_id,
                    recipient_zone: formValues.zone_id,
                    item_quantity: orderList.length,
                    item_description: orderList.map((p) => p.name).join(", "),
                    amount_to_collect: Math.round(
                      Math.max(total - payAmount, 0),
                    ), // ← only due
                  };

                  const orderRes = await api.post(
                    "/pathao/create-order",
                    orderPayload,
                  );
                  if (orderRes?.data?.code === 200) {
                    toast.success("Pathao order created successfully!");

                    // 🔹 extract Pathao response
                    const consignment = orderRes.data.data || {};

                    // 🔹 prepare payload for steadfast‑couriers
                    const courierPayload = {
                      consignment_id: String(consignment.consignment_id),
                      invoice: String(consignment.merchant_order_id),
                      sale_id: res?.data?.data?.sales_id, // from save-sales response already returned earlier
                      recipient_name: formValues.recipient_name,
                      recipient_phone: formValues.recipient_phone,
                      recipient_address: formValues.recipient_address,
                      cod_amount: String((0.0).toFixed(2)),
                      delivery_status: "pending",
                      note: formValues.special_instruction || "",
                    };

                    try {
                      await api.post("steadfast-couriers", courierPayload);
                      console.log(
                        "📦 steadfast-couriers log saved successfully",
                      );
                    } catch (err) {
                      console.warn("steadfast courier log failed", err);
                    }

                    setPathaoModalOpen(false);
                    router.push(`/invoice/${invoiceId}`);
                  } else {
                    toast.error("Pathao order creation failed.");
                  }
                }}
              />
            )
          }
        />

        {/* 🧾 Steadfast Create Order modal */}
        <Modal
          title="Steadfast Delivery Details"
          onClose={setSteadfastModalOpen}
          open={steadfastModalOpen}
          content={
            steadfastPendingInvoice && (
              <SteadfastDeliveryForm
                orderList={steadfastPendingInvoice.orderList}
                total={steadfastPendingInvoice.total}
                customerData={{ ...existingCustomerData, ...customerData }}
                onSubmit={async (formValues) => {
                  const payload = {
                    ...steadfastPendingInvoice.payload,
                    delivery_customer_name: formValues.recipient_name,
                    delivery_customer_address: formValues.recipient_address,
                    delivery_customer_phone: formValues.recipient_phone,
                  };

                  // 1️⃣ Save sale first
                  const res = await api.post("/save-sales", payload);
                  if (!res?.data?.success) {
                    toast.error("Failed to save sales before Steadfast order");
                    return;
                  }
                  dispatch(
                    apiSlice.util.invalidateTags([
                      "HoldInvoice",
                      "CompleteInvoice",
                      "AllSellInvoice",
                    ]),
                  );
                  const invoiceId =
                    res.data?.data?.invoice_id || payload?.invoice_id || "";

                  // 2️⃣ Create order on courier/create-order
                  const createPayload = {
                    invoice: invoiceId,
                    recipient_name: formValues.recipient_name,
                    recipient_phone: formValues.recipient_phone,
                    recipient_address: formValues.recipient_address,
                    cod_amount: total.toFixed(2),
                    note: formValues.note || "",
                  };

                  const createRes = await api.post(
                    "courier/create-order",
                    createPayload,
                  );
                  if (createRes?.data?.status === "success") {
                    const consignment = createRes.data.data.consignment;

                    // 3️⃣ Log to steadfast-couriers
                    const logPayload = {
                      consignment_id: String(consignment.consignment_id), // ensure string as error said
                      invoice: consignment.invoice,
                      sale_id: res?.data?.data?.sales_id, // extract numeric part if needed
                      tracking_code: consignment.tracking_code,
                      recipient_name: consignment.recipient_name,
                      recipient_phone: consignment.recipient_phone,
                      recipient_address: consignment.recipient_address,
                      cod_amount: String(consignment.cod_amount?.toFixed(2)),
                      note: consignment.note || "",
                    };

                    try {
                      await api.post("steadfast-couriers", logPayload);
                    } catch (err) {
                      console.warn("Steadfast log error", err);
                    }

                    toast.success("Steadfast order created successfully!");
                    setSteadfastModalOpen(false);
                    router.push(`/invoice/${invoiceId}`);
                  } else {
                    toast.error("Steadfast order creation failed.");
                  }
                }}
              />
            )
          }
        />

        <Modal
          title={"Add New Whole Seller"}
          onClose={setAddWholeSeller}
          open={addWholeSeller}
          content={
            <AddWholeSeller
              setModalOpen={setAddWholeSeller}
              setSchema={setWholeSellerData}
            />
          }
        />

        {/* 🆕 Exchange payment modal */}
        <Modal
          title={"Exchange Payment Method"}
          onClose={setExchangePaymentModal}
          open={exchangePaymentModal}
          content={
            <PaymentMethods
              ref={paymentRef} // enables keyboard navigation
              type={"billing"} // ✅ use same logic as normal
              setPaymentName={() => { }} // exchange modal doesn’t change main label
              paymentMethods={exchangePaymentMethods}
              setPaymentMethods={setExchangePaymentMethods}
              payAmount={
                orderList
                  .filter((p) => p.is_exchange)
                  .reduce(
                    (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
                    0,
                  ) || 0
              }
              setPayAmount={() => { }} // no need to alter parent payAmount
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              selectedGateway={selectedGateway}
              setSelectedGateway={setSelectedGateway}
              onOrderComplete={() => setExchangePaymentModal(false)}
              onClose={() => setExchangePaymentModal(false)}
              total={
                orderList
                  .filter((p) => p.is_exchange)
                  .reduce(
                    (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
                    0,
                  ) || 0
              }
              setTotalPaidAmount={() => { }}
            />
          }
        />
      </div>
    </ProtectedRoute>
  );
};

export default SalePurchaseBilling;
