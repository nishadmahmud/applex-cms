"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Save, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {useDeleteDeliveryInfoMutation, useDeliveryInfoSaveMutation, useEditDeliveryInfoMutation } from "@/app/store/api/deliveryApi";


export default function ViewUi({ method }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    company_name: "",
    phone_number : "",
  });
  const [editingAccount, setEditingAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({
    company_name: "",
    phone_number: "",
  });

  const [editDeliveryInfo, { isLoading }] = useEditDeliveryInfoMutation();

  const [deliveryInfoSave, { isLoading: isSubmitting }] = useDeliveryInfoSaveMutation();

  const [deleteDeliveryInfo,{isLoading : isDeleting}] = useDeleteDeliveryInfoMutation()


  if (!method) return null;

  const handleEditAccount = async (account) => {
    setEditingAccount(account.id);
    setEditFormData({
      company_name: account.company_name,
      phone_number: account.phone_number,
    });
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
  };

  const handleSaveEdit = async (account) => {
    const payload = {
      ...editFormData,
      id: account.id,
      delivery_method_id: account.delivery_method_id,
    };
    const res = await editDeliveryInfo(payload).unwrap();
    if (res.success) {
      toast.success("Info updated successfully");
      setEditingAccount(null);
      setEditFormData((prev) => ({
        ...prev,
        company_name: '',
        phone_number: '',
      }));
    } else {
      toast.error("error occured try again");
    }
  };

  const handleDeleteAccount = async (deliveryinfoId) => {
    try {
      const res = await deleteDeliveryInfo({ deliveryinfoId }).unwrap();
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success('Account deleted successfully!');
      }
      toast.dismiss();
    } catch (error) {
      console.log(error)
      toast.dismiss();
      toast.error('error occured try again');
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const payload = { ...newAccount, delivery_method_id: method.id }
    try {
      const res = await deliveryInfoSave(payload).unwrap();
      if (res.success) {
        toast.success(res.message);
        setNewAccount((prev) => ({
          ...prev,
          company_name: "",
         phone_number : ""
        }))
        setShowAddForm(false);
      }
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  };


  return (
    
        <div className="space-y-6">
          {/* Payment Method Details */}
          <div className="space-y-4">


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Name
                </label>
                <p className="text-lg font-semibold text-slate-800">
                  {method?.type_name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Type
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {/* <IconComponent className="h-4 w-4 text-slate-500" /> */}
                  <p className="text-slate-800">
                    delivery methods
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    className={
                      "active" === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    active
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Code
                </label>
                <p className="text-slate-800 font-mono">
                  {method?.icon_letter}
                </p>
              </div>
            </div>
          </div>

          {/* Account List Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Authorize Info List
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent flex items-center gap-1"
              >
                {showAddForm ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Add Authorize Info
              </Button>
            </div>

            {/* Add Account Form Dropdown */}
            {showAddForm && (
              <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 animate-in slide-in-from-top duration-300">
                <form onSubmit={handleAddAccount}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="companyName"
                        className="text-sm font-medium"
                      >
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={newAccount.company_name}
                        onChange={(e) =>
                          setNewAccount({ ...newAccount, company_name: e.target.value })
                        }
                        placeholder="Enter company name"
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone_number"
                        className="text-sm font-medium"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone_number"
                        value={newAccount.phone_number}
                        onChange={(e) =>
                          setNewAccount({
                            ...newAccount,
                            phone_number: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                        required
                        className="bg-white"
                      />
                    </div>
                    
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {
              method.delivery_infos.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg ">
                  {/* Table Header */}
                  <div className="bg-slate-50 border-b border-slate-200">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3">
                      <div className="col-span-3">
                        <span className="text-sm font-medium text-slate-700">
                          Company Name
                        </span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-sm font-medium text-slate-700">
                          Phone
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium text-slate-700">
                          Action
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-slate-100 overflow-x-hidden">
                    {method.delivery_infos?.length ? (
                      method.delivery_infos.map((account) => (
                        <div
                          key={account.id}
                          className={`grid grid-cols-12 gap-4 px-4 py-3 transition-colors ${editingAccount === account.id
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                            }`}
                        >
                          {editingAccount === account.id ? (
                            // Edit Mode
                            <>
                              <div className="col-span-3">
                                <Input
                                  value={
                                    editFormData.company_name
                                  }
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      company_name: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm"
                                  required
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  value={
                                    editFormData.phone_number
                                  }
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      phone_number: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm font-mono"
                                  required
                                />
                              </div>
                    
                              <div className="col-span-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(account)}
                                    disabled={isLoading}
                                    className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {isLoading ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isLoading}
                                    className="h-7 w-7 p-0 border-slate-300 bg-transparent"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-slate-800">
                                  {account?.company_name}
                                </p>
                              </div>
                              <div className="col-span-4">
                                <p className="text-sm text-slate-600 font-mono">
                                  {account?.phone_number}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditAccount(account)}
                                    className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    className="h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs"
                                  >
                                    {isDeleting ? '...' : <Trash2 />}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No authorize info available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-500">
                    No authorize found for this payment method
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent"
                  >
                    Add First Authorize Info
                  </Button>
                </div>
              )}
          </div>
        </div>
  );
}
