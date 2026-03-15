"use client";
import CustomDatePicker from "@/app/utils/CustomDatePicker";
import Modal from "@/app/utils/Modal";
import Discount from "@/components/Discount";
import { ExistingCustomerList } from "@/components/ExistingCustomerList";
import OrderList from "@/components/OrderList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Hand, PlusCircle } from "lucide-react";
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
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [warrantMethod, setWarrantyMethod] = useState("");
  const [warranties, setWarranties] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
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

            return {
              id: base.id,
              child_id: child?.id ?? null,
              name: child ? `${base.name} - ${child.sku}` : base.name,
              barcode: child?.barcode || base.barcode,
              qty: detail.qty,
              price: parseFloat(detail.price) || 0,
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
        console.log({ isPurchaseBilling }, "inside purchase edit");
        console.log("inside purchase edit");
        // vendor info
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

        // purchase line items
        if (initialInvoice.purchase_details?.length) {
          const preloadedCart = initialInvoice.purchase_details.map(
            (detail) => {
              const base = detail.product_info || {};
              const child = detail.product_items || null;

              return {
                id: base.id,
                child_id: child?.id ?? null,
                name: child ? `${base.name} - ${child.sku}` : base.name,
                barcode: child?.barcode || base.barcode,
                qty: detail.qty,
                price: parseFloat(detail.price) || 0,
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

  const handleComplete = async (status) => {
    try {
      // --- 1️⃣ Validate IMEI/serial only for products that truly require it
      const imeiRequiredItems = orderList.filter(
        (item) => item.have_variant && !item.child_id && !item.product_item_id
      );
      const isVariationEntried = Object.entries(product);

      if (
        isPurchaseBilling &&
        imeiRequiredItems.length !== isVariationEntried.length
      ) {
        toast.error("missing imei/serial number");
        return;
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
          // ✅ NEW: purchase_price logic unified here
          ...(editMode
            ? {
                // ✅ send purchase_price only when editing
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

        // 🟩 SALES VERSION
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

        return {
          ...baseData,
          purchase_price: item.price,
          have_variant: item.have_variant ? 1 : 0,
          have_product_variant: 0,
        };
      });

      // --- 4️⃣ Build payload
      const payload = {
        pay_mode: paymentName,
        paid_amount: paidAmount,
        cash_change: paidAmount > total ? paidAmount - total : paidAmount,
        sub_total: total,
        vat: 0,
        tax: 0,
        discount,
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

      // ✅ ⟶  ADD INVOICE ID IF EDIT MODE
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
      let res;
      let apiUrl;

      if (isPurchaseBilling) {
        apiUrl = editMode ? "/update-purchase" : "/save-purchase";
      } else {
        apiUrl = editMode ? "/update-sales" : "/save-sales";
      }

      res = await api.post(apiUrl, payload);

      // --- 7️⃣ Handle success
      if (res?.data?.success) {
        toast.success("Order saved successfully");

        // ✅ use existing invoice id if update API doesn't return one
        const invoiceId =
          res?.data?.data?.invoice_id ||
          initialInvoice?.invoice_id ||
          payload?.invoice_id;

        router.push(
          !isPurchaseBilling ? `/invoice/${invoiceId}` : `/invoice/${invoiceId}`
        );

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

  useMemo(() => {
    let amount = orderList.reduce(
      (prev, curr) => prev + curr.price * curr.qty,
      0
    );
    amount =
      discountType === "fixed"
        ? amount - discount
        : amount - (amount * discount) / 100;
    setTotal(amount);
    setPayAmount(amount);
  }, [orderList, discountType, discount]);

  return (
    <div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3">
          <ScrollListWithSearch
            type={isPurchaseBilling}
            orderList={orderList}
            setOrderList={setOrderList}
            discountRef={discountRef}
          />

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

        <div className="col-span-2 space-y-5">
          {/* date */}
          <div className="flex items-center gap-2">
            <CustomDatePicker
              fieldName={"created_at"}
              setValue={handleDate}
              type={"normal"}
            />
            {!isPurchaseBilling ? (
              <ExistingCustomerList
                orderSchema={existingCustomerData}
                setOrderSchema={setExistingCustomerData}
              />
            ) : (
              <WarehouseList setOrderSchema={setWarehouseData} />
            )}
          </div>

          {/* Discount Type */}
          <Discount
            discountRef={discountRef}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discount={discount}
            setDiscount={setDiscount}
            handleDiscount={handleDiscount}
          />

          {/* remarks */}
          <Input
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          {/* radio buttons */}
          {!isPurchaseBilling && (
            <RadioGroup
              className="flex"
              value={orderType}
              onValueChange={(value) => setOrderType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={true} id="shop" />
                <Label htmlFor="shop">Shop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={false} id="online" />
                <Label htmlFor="online">Online</Label>
              </div>
            </RadioGroup>
          )}

          {/* checkboxes */}
          {!isPurchaseBilling ? (
            <div className="flex items-center gap-3 ">
              <div className="flex flex-1 gap-2 items-center">
                <Checkbox
                  checked={deliveryModal}
                  onCheckedChange={setDeliveryModal}
                />
                <Label>Delivery Method</Label>
              </div>
              <div className="flex flex-1 gap-2 items-center">
                <Checkbox
                  checked={sellerModal}
                  onCheckedChange={setSellerModal}
                />
                <Label>Add Seller</Label>
              </div>
              <div className="flex flex-1 gap-2 items-center">
                <Checkbox
                  checked={customerModal}
                  onCheckedChange={setCustomerModal}
                />
                <Label>Add Customer</Label>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 gap-2 items-center">
              <Checkbox
                checked={vendorModal}
                onCheckedChange={setVendorModal}
              />
              <Label>Add Vendor</Label>
            </div>
          )}

          {/* delivery & seller modals */}
          <div className="flex items-center gap-3">
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
              />
            ) : (
              ""
            )}
            {vendorModal ? (
              <div className="flex items-center gap-3 flex-1">
                <VendorsList
                  setOrderSchema={setVendorData}
                  selectedVendor={selectedVendor}
                  setSelectedVendor={setSelectedVendor}
                />
                <PlusCircle
                  onClick={() => setAddVendor(true)}
                  className="cursor-pointer"
                />
              </div>
            ) : (
              ""
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 ">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>{total?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              {/* <span>${tax?.toFixed(2) || "0.00"}</span> */}
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>৳{total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setPaymentModal(true)}
              variant="outline"
              className="flex-1"
            >
              <RiMoneyCnyBoxFill className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
            <Button
              onClick={() => handleComplete(0)}
              variant="outline"
              className="flex-1"
            >
              <Hand className="w-4 h-4 mr-2" />
              Hold
            </Button>
            <Button onClick={() => handleComplete(1)} className="flex-1">
              Complete Order
            </Button>
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
          />
        }
      />
    </div>
  );
};

export default SalePurchaseBilling;
