import React, { Suspense } from "react";
import SettingsSkeleton from "../../SettingsSkeleton";
import SubCategoryHeader from "./SubCategoryHeader";
import SubCategoryList from "./SubCategoryList";
import serverFetchPromise from "@/lib/serverFetchPromise";
import ProtectedRoute from "@/components/ProtectedRoute";

// eslint-disable-next-line react/prop-types
const Subcategory = async ({ searchParams }) => {
  const { page } = await searchParams;
  const data = serverFetchPromise(
    `${process.env.NEXT_PUBLIC_API}/sub-category?page=${page}&limit=20`,
    { next: { tags: ["subcategories"] } }
  );

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Sub Category"}>
      <div className="pb-5">
        <SubCategoryHeader />
        <Suspense fallback={<SettingsSkeleton />}>
          <SubCategoryList data={data} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
};

export default Subcategory;
