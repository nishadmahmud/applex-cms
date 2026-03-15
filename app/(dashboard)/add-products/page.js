import React from "react";
import ProductFormFields from "./ProductFormFields";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute featureName="Products" optionName="Add Product">
      <div className="">
        <ProductFormFields />
      </div>
    </ProtectedRoute>
  );
}
