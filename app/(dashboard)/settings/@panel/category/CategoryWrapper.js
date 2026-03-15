import React, { Suspense } from "react";
import CategoryList from "./CategoryList";
import SettingsSkeleton from "../../SettingsSkeleton";
import serverFetchPromise from "@/lib/serverFetchPromise";

// eslint-disable-next-line react/prop-types
const CategoryWrapper = async ({ page }) => {
  const categories = serverFetchPromise(
    `${process.env.NEXT_PUBLIC_API}/category?page=${page}&limit=10`,
    { next: { revalidate: 60 * 5, tags: ["categories"] } }
  );

  return (
    <div>
      <Suspense fallback={<SettingsSkeleton />}>
        <CategoryList data={categories} />
      </Suspense>
    </div>
  );
};

export default CategoryWrapper;
