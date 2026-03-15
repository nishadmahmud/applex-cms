// import React from "react";
// import ProductFormFields from "../../add-products/ProductFormFields";
// import { getServerSession } from "next-auth";
// import { authOption } from "@/app/api/auth/[...nextauth]/route";

// const EditProduct = async ({ params }) => {
//   const { id } = await params;
//   const session = await getServerSession(authOption);
//   const data = await fetch(
//     `${process.env.NEXT_PUBLIC_API}/product-details/${id}`,
//     {
//       headers: {
//         Authorization: `Bearer ${session.accessToken}`,
//       },
//     }
//   );
//   const product = await data.json();

//   return (
//     <div className="p-2 ">
//       <ProductFormFields product={product?.data} mode={"edit"} />
//     </div>
//   );
// };

// export default EditProduct;

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loader2 } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProductFormFields from "../../add-products/ProductFormFields";

export default function EditProduct() {
  const { id } = useParams(); // Next.js hook for dynamic route :id
  const { data: session, status } = useSession();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product details once session is available
  useEffect(() => {
    const fetchProduct = async () => {
      if (status !== "authenticated") return; // Wait until session ready

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/product-details/${id}`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        setProduct(res.data?.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, status, session]);

  // Simple loading / error states
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-medium">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No product data found.
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Products" optionName="Product Update">
      <div className="p-2">
        <ProductFormFields product={product} mode="edit" />
      </div>
    </ProtectedRoute>
  );
}
