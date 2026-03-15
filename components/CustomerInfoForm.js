"use client";
import React from "react";
import { useUpdateCustomerDetailsMutation, useSearchCustomerQuery } from "@/app/store/api/saleCustomerApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gift, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CustomerInfoForm({
  formData,
  setFormData,
  formRef,
  setCustomerModal,
  setPaymentModal,
  setExistingCustomerData,
}) {
  const [membershipEnabled, setMembershipEnabled] = useState(0);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);

  const [updateCustomerDetails, { isLoading }] =
    useUpdateCustomerDetailsMutation();

  // Search for existing customers when phone number reaches 11 digits
  const { data: searchResults } = useSearchCustomerQuery(
    formData.mobile_number || "",
    {
      skip: !formData.mobile_number || formData.mobile_number.length !== 11,
    }
  );

  // Update existing customers and show warning when search results change
  useEffect(() => {
    if (searchResults?.data?.data?.length > 0) {
      setExistingCustomers(searchResults.data.data);
      setShowPhoneWarning(true);
    } else {
      setExistingCustomers([]);
      setShowPhoneWarning(false);
    }
  }, [searchResults]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // stop default page reload

    try {
      const res = await updateCustomerDetails(formData).unwrap();
      if (res.success) {
        const savedCustomer = res.data;

        // Update formData so it's reusable
        setFormData((prev) => ({ ...prev, customer_id: savedCustomer.id }));

        // ✅ Tell parent dropdown to select this new customer
        setExistingCustomerData({
          customer_id: savedCustomer.id,
          customer_name: savedCustomer.name,
          delivery_customer_name: savedCustomer.name,
          delivery_customer_address: savedCustomer.address ?? "",
          delivery_customer_phone: savedCustomer.mobile_number ?? "",
        });

        toast.success("Customer added successfully!");
        setCustomerModal(false);
        // setPaymentModal(true); // go directly to payment next if desired
      }
    } catch (err) {
      console.error("Failed to save customer:", err);
      toast.error("Error saving customer");
    }
  };

  const handleNextInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const customerFields = Object.values(formData);
      const allFields = customerFields.filter(Boolean);
      const inputs = formRef.current.querySelectorAll("input");
      const selectedIdx = Array.from(inputs).indexOf(e.target);

      if (selectedIdx >= 0 && selectedIdx < inputs.length - 2) {
        inputs[selectedIdx + 1].focus();
      } else {
        if (allFields.length) {
          handleSubmit();
        }
        setCustomerModal(false);
        setPaymentModal(true);
        formRef.current = null;
      }
    }
  };

  const membershipUpdate = () => {
    setMembershipEnabled((prev) => {
      const toggled = prev ^ 1;
      setFormData((form) => ({
        ...form,
        is_member: toggled,
      }));
      return toggled;
    });
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full shadow-none border-none">
        <CardContent className="space-y-4 ">
          <form
            ref={formRef}
            // onSubmit={(e) => e.preventDefault()}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="sr-only">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Customer Name"
                  onKeyDown={handleNextInput}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="sr-only">
                  Customer Email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Customer Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onKeyDown={handleNextInput}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="sr-only">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Phone Number"
                value={formData.mobile_number}
                onChange={(e) =>
                  handleInputChange("mobile_number", e.target.value)
                }
                onKeyDown={handleNextInput}
                className={`rounded-lg border-gray-200 ${showPhoneWarning ? "border-amber-400" : ""
                  }`}
              />
              {showPhoneWarning && existingCustomers.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-amber-800 font-medium pt-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Customer(s) with this phone already exist:</span>
                  </div>
                  {existingCustomers.slice(0, 2).map((customer) => (
                    <div key={customer.id} className="text-xs text-amber-700 ml-6">
                      • {customer.name}
                    </div>
                  ))}
                  {existingCustomers.length > 2 && (
                    <div className="text-xs text-amber-600 ml-6">
                      ...and {existingCustomers.length - 2} more
                    </div>
                  )}
                  <div className="text-xs text-amber-600 ml-6 mt-1 italic">
                    You can still proceed to add this customer if needed.
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerNID" className="sr-only">
                Customer NID
              </Label>
              <Input
                id="customerNID"
                placeholder="Customer NID"
                value={formData.nid}
                onChange={(e) => handleInputChange("nid", e.target.value)}
                onKeyDown={handleNextInput}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="sr-only">
                Customer Address
              </Label>
              <Input
                id="customerAddress"
                placeholder="Customer Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                onKeyDown={handleNextInput}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-600 rounded">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Membership</div>
                  <div className="text-sm text-gray-600">
                    Members can get additional discount and...
                  </div>
                </div>
              </div>
              <Switch
                checked={membershipEnabled}
                onCheckedChange={membershipUpdate}
              />
            </div>

            <Button
              type="submit"
              onClick={handleSubmit} // extra safety
              className={`w-full ${isLoading ? "bg-blue-500/80" : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-lg py-3 font-medium`}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
