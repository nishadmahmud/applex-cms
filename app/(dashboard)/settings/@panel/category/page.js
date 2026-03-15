import React, { Suspense } from "react";
import SettingsSkeleton from "../../SettingsSkeleton";
import CategoryHeader from "./CategoryHeader";
import CategoryWrapper from "./CategoryWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

// eslint-disable-next-line react/prop-types
const Category = async ({ searchParams }) => {
  const { page } = await searchParams;

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Category"}>
      <div className="pb-5">
        <div className="mb-5">
          <CategoryHeader />
        </div>
        <Suspense fallback={<SettingsSkeleton />}>
          <CategoryWrapper page={page} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
};

export default Category;
