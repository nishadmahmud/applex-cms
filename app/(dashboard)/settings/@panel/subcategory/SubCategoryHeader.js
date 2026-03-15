"use client";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const SubCategoryForm = dynamic(() => import("./SubCategoryForm"), {
  ssr: false,
});
const SubCategoryModal = dynamic(() => import("../category/CategoryModal"), {
  ssr: false,
});

export default function SubCategoryHeader() {
    const [open,setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/products">
            <Button variant="outline">
              <List className="w-4 h-4 mr-2" />
              PRODUCT LIST
            </Button>
          </Link>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Sub Category
          </Button>
        </div>

        {open && (
          <SubCategoryModal
            content={<SubCategoryForm onClose={setOpen} />}
            open={open}
            onClose={setOpen}
          />
        )}
      </div>
    </div>
  );
}
