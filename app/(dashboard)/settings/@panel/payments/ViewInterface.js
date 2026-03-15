"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Save, Check, X, Trash2 } from "lucide-react";
import {
  useDeletePaymentTypeCategoryMutation,
  useEditPaymentTypeCategoryListMutation,
  usePaymentTypeCategorySaveMutation,
} from "@/app/store/api/paymentApi";
import { toast } from "sonner";

export default function ViewInterface({ method }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    payment_category_name: "",
    account_number: "",
    branch_name: "",
  });
  const [editingAccount, setEditingAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({
    payment_category_name: "",
    account_number: "",
    branch_name: "",
  });

  const [editPaymentTypeCategoryList, { isLoading }] =
    useEditPaymentTypeCategoryListMutation();

  const [paymentTypeCategorySave, { isLoading: isSubmitting }] =
    usePaymentTypeCategorySaveMutation();

  const [deletePaymentTypeCategory, { isLoading: isDeleting }] =
    useDeletePaymentTypeCategoryMutation();

  if (!method) return null;

  const handleEditAccount = async (account) => {
    setEditingAccount(account.id);
    setEditFormData({
      payment_category_name: account.payment_category_name,
      account_number: account.account_number,
      branch_name: account.branch_name,
    });
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
  };

  const handleSaveEdit = async (account) => {
    const payload = {
      ...editFormData,
      id: account.id,
      payment_type_id: account.payment_type_id,
    };
    const res = await editPaymentTypeCategoryList(payload).unwrap();
    if (res.success) {
      toast.success("Account updated successfully");
      setEditingAccount(null);
      setEditFormData((prev) => ({
        ...prev,
        account_number: "",
        branch_name: "",
        payment_category_name: "",
      }));
    } else {
      toast.error("error occured try again");
    }
  };

  const handleDeleteAccount = async (paymenttypecategoryId) => {
    try {
      const res = await deletePaymentTypeCategory({
        paymenttypecategoryId,
      }).unwrap();
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success("Account deleted successfully!");
      }
      toast.dismiss();
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("error occured try again");
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const payload = { ...newAccount, payment_type_id: method.id };
    try {
      const res = await paymentTypeCategorySave(payload).unwrap();
      if (res.success) {
        toast.success(res.message);
        setNewAccount((prev) => ({
          ...prev,
          payment_category_name: "",
          account_number: "",
          branch_name: "",
        }));
        setShowAddForm(false);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Name</label>
            <p className="text-lg font-semibold text-slate-800">
              {method?.type_name}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Type</label>
            <div className="flex items-center gap-2 mt-1">
              {/* <IconComponent className="h-4 w-4 text-slate-500" /> */}
              <p className="text-slate-800">
                {method?.type_name !== "Cash" ? "Bank" : "Physical"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Status</label>
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
            <label className="text-sm font-medium text-slate-600">Code</label>
            <p className="text-slate-800 font-mono">{method?.icon_letter}</p>
          </div>
        </div>
      </div>

      {/* Account List Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Account List</h3>
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
            Add Account
          </Button>
        </div>

        {/* Add Account Form Dropdown */}
        {showAddForm && (
          <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleAddAccount}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName" className="text-sm font-medium">
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    value={newAccount.payment_category_name}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        payment_category_name: e.target.value,
                      })
                    }
                    placeholder="Enter account name"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="account_number"
                    className="text-sm font-medium"
                  >
                    Account Number
                  </Label>
                  <Input
                    id="account_number"
                    value={newAccount.account_number}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        account_number: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch_name" className="text-sm font-medium">
                    Branch Name
                  </Label>
                  <Input
                    id="branch_name"
                    value={newAccount.branch_name}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        branch_name: e.target.value,
                      })
                    }
                    placeholder="Enter branch name"
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

        {method.payment_type_category.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg ">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-12 gap-4 px-4 py-3">
                <div className="col-span-3">
                  <span className="text-sm font-medium text-slate-700">
                    Name
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm font-medium text-slate-700">
                    Account Number
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm font-medium text-slate-700">
                    Branch
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
              {method.payment_type_category?.length ? (
                method.payment_type_category.map((account) => (
                  <div
                    key={account.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 transition-colors ${
                      editingAccount === account.id
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {editingAccount === account.id ? (
                      // Edit Mode
                      <>
                        <div className="col-span-3">
                          <Input
                            value={editFormData.payment_category_name}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                payment_category_name: e.target.value,
                              })
                            }
                            className="h-8 text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={editFormData.account_number}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                account_number: e.target.value,
                              })
                            }
                            className="h-8 text-sm font-mono"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={editFormData.branch_name || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                branch_name: e.target.value,
                              })
                            }
                            className="h-8 text-sm"
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
                            {account?.payment_category_name}
                          </p>
                        </div>
                        <div className="col-span-4">
                          <p className="text-sm text-slate-600 font-mono">
                            {account?.account_number}
                          </p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-sm text-slate-600">
                            {account?.branch_name}
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
                              {isDeleting ? "..." : <Trash2 />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p>No accounts available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-500">
              No accounts found for this payment method
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent"
            >
              Add First Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
