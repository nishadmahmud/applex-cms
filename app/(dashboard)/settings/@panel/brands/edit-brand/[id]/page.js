// "use client";
// import React, { useEffect, useState } from "react";
// import BrandForm from "../../BrandForm";
// import { useSession } from "next-auth/react";
// import { useParams } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { setToken } from "@/app/store/authSlice";
// import {
//   useGetBrandsQuery,
//   useUpdateBrandMutation,
// } from "@/app/store/api/brandsApi";
// import { imageUpload, resetPreview, setPreview } from "@/app/store/imageSlice";
// import { toast } from "sonner";

// const EditBrand = () => {
//   const { data: session, status } = useSession();
//   const dispatch = useDispatch();
//   const { id } = useParams();

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     image_path: "",
//     banner_image: "",
//     is_topbrand: false,
//   });

//   const [imageFile, setImageFile] = useState(null); // logo file
//   const [bannerFile, setBannerFile] = useState(null); // banner file
//   const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

//   // set access token into store
//   useEffect(() => {
//     if (status === "authenticated") dispatch(setToken(session.accessToken));
//   }, [status, session, dispatch]);

//   // fetch list so we can find the current brand
//   const { data: brandsResponse, isLoading } = useGetBrandsQuery(
//     { page: 1, limit: 1000 },
//     { skip: status !== "authenticated" }
//   );

//   // prefill form with selected brand data
//   useEffect(() => {
//     if (brandsResponse?.data?.data && id) {
//       const brand = brandsResponse.data.data.find(
//         (b) => b.id.toString() === id
//       );
//       if (brand) {
//         setFormData({
//           name: brand.name || "",
//           description: brand.description || "",
//           image_path: brand.image_path || "",
//           banner_image: brand.banner_image || "",
//           is_topbrand: brand.is_topbrand === 1,
//         });
//         if (brand.image_path) dispatch(setPreview(brand.image_path));
//       }
//     }
//   }, [brandsResponse, id, dispatch]);

//   // update form fields from child
//   const handleChange = (field, value) =>
//     setFormData((prev) => ({ ...prev, [field]: value }));

//   // handle save brand click
//   const handleSubmit = async () => {
//     toast.loading("Updating brand...");

//     let image_path = formData.image_path;
//     let banner_image = formData.banner_image;

//     try {
//       // === Upload logo if new file selected ===
//       if (imageFile instanceof File) {
//         const uploadedLogo = await dispatch(
//           imageUpload({ image: imageFile, token: session.accessToken })
//         ).unwrap(); // thunk returns direct path string
//         image_path = uploadedLogo;
//       }

//       // === Upload banner if new file selected ===
//       if (bannerFile instanceof File) {
//         const uploadedBanner = await dispatch(
//           imageUpload({ image: bannerFile, token: session.accessToken })
//         ).unwrap();
//         banner_image = uploadedBanner;
//       }

//       // === Build final payload ===
//       const payload = {
//         brandId: id,
//         name: formData.name,
//         description: formData.description,
//         image_path,
//         banner_image,
//         is_topbrand: formData.is_topbrand,
//       };

//       // === Call update brand API ===
//       const res = await updateBrand(payload).unwrap();

//       toast.dismiss();
//       if (res.success) {
//         toast.success("Brand updated successfully!");
//         dispatch(resetPreview());
//         setImageFile(null);
//         setBannerFile(null);
//       } else {
//         toast.error(res.message || "Update failed");
//       }
//     } catch (error) {
//       console.error("❌ Error during brand update:", error);
//       toast.dismiss();
//       toast.error("Something went wrong while updating");
//     }
//   };

//   return (
//     <div>
//       {isLoading ? (
//         <p>Loading brand data...</p>
//       ) : (
//         <BrandForm
//           formData={formData}
//           onChange={handleChange}
//           onSubmit={handleSubmit}
//           setImageFile={setImageFile}
//           setBannerFile={setBannerFile}
//           editingMode
//           isUpdating={isUpdating}
//         />
//       )}
//     </div>
//   );
// };

// export default EditBrand;

"use client";
import React, { useEffect, useState } from "react";
import BrandForm from "../../BrandForm";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import {
  useGetBrandsQuery,
  useUpdateBrandMutation,
} from "@/app/store/api/brandsApi";
import { resetPreview, setPreview } from "@/app/store/imageSlice";
import axios from "axios";
import { toast } from "sonner";

const EditBrand = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_path: "",
    banner_image: "",
    is_topbrand: false,
  });

  const [imageFile, setImageFile] = useState(null); // logo
  const [bannerFile, setBannerFile] = useState(null); // banner
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  // token setup
  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, session, dispatch]);

  // get brand data
  const { data: brandsResponse, isLoading } = useGetBrandsQuery(
    { page: 1, limit: 1000 },
    { skip: status !== "authenticated" }
  );

  // prefill
  useEffect(() => {
    if (brandsResponse?.data?.data && id) {
      const brand = brandsResponse.data.data.find(
        (b) => b.id.toString() === id
      );
      if (brand) {
        setFormData({
          name: brand.name || "",
          description: brand.description || "",
          image_path: brand.image_path || "",
          banner_image: brand.banner_image || "",
          is_topbrand: brand.is_topbrand === 1,
        });
        if (brand.image_path) dispatch(setPreview(brand.image_path));
      }
    }
  }, [brandsResponse, id, dispatch]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ---- multiple file upload API (same as ProductForm reference) ----
  const multipleImageHandler = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) return [];
    const imageData = new FormData();
    filesToUpload.forEach((file) => {
      imageData.append("pictures[]", file);
    });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/multiple-file-upload`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res?.data?.path?.length) {
        // backend returns array of {path:"..."}
        return res.data.path.map((p) => p.path);
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // ---- on submit ----
  const handleSubmit = async () => {
    toast.loading("Updating brand...");

    let image_path = formData.image_path;
    let banner_image = formData.banner_image;

    try {
      const filesToUpload = [];
      if (imageFile instanceof File) filesToUpload.push(imageFile);
      if (bannerFile instanceof File) filesToUpload.push(bannerFile);

      // 1️⃣ Upload whichever exist using multiple upload endpoint
      let uploadedPaths = [];
      if (filesToUpload.length > 0) {
        uploadedPaths = await multipleImageHandler(filesToUpload);
      }

      // 2️⃣ Assign returned URLs in order
      if (uploadedPaths.length === 1) {
        // user uploaded only one file
        if (imageFile && !bannerFile) image_path = uploadedPaths[0];
        if (!imageFile && bannerFile) banner_image = uploadedPaths[0];
      }
      if (uploadedPaths.length === 2) {
        image_path = uploadedPaths[0];
        banner_image = uploadedPaths[1];
      }

      // 3️⃣ Payload
      const payload = {
        brandId: id,
        name: formData.name,
        description: formData.description,
        image_path,
        banner_image,
        is_topbrand: formData.is_topbrand,
      };

      // 4️⃣ Call update brand API
      const res = await updateBrand(payload).unwrap();

      toast.dismiss();
      if (res.success) {
        toast.success("Brand updated successfully!");
        dispatch(resetPreview());
        setImageFile(null);
        setBannerFile(null);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.dismiss();
      toast.error("Something went wrong while updating");
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading brand data...</p>
      ) : (
        <BrandForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          setImageFile={setImageFile}
          setBannerFile={setBannerFile}
          editingMode
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};

export default EditBrand;
