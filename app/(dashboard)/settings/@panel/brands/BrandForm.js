// "use client";
// import { setPreview } from "@/app/store/imageSlice";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Camera, Save, Upload, ImageIcon } from "lucide-react";
// import Link from "next/link";
// import React, { useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";

// const BrandForm = ({
//   formData,
//   onChange,
//   onSubmit,
//   setImageFile,
//   setBannerFile,
//   editingMode = false,
//   isUpdating = false,
// }) => {
//   const fileInputRef = useRef(null);
//   const bannerInputRef = useRef(null);
//   const dispatch = useDispatch();
//   const imagePreview = useSelector((state) => state.image.preview);

//   const handleMainImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile?.(file);
//       const imgUrl = URL.createObjectURL(file);
//       dispatch(setPreview(imgUrl));
//     }
//   };

//   const handleBannerSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setBannerFile?.(file);
//       const imgUrl = URL.createObjectURL(file);
//       onChange("banner_image", imgUrl); // preview only
//     }
//   };

//   return (
//     <div className="mx-auto px-6 py-8">
//       <Card className="p-8">
//         {/* === Logo === */}
//         <div className="flex justify-center mb-8">
//           <div className="relative">
//             <Avatar className="w-24 h-24 shadow-lg border-4 border-white">
//               <AvatarImage src={imagePreview || formData.image_path} />
//               <AvatarFallback className="bg-gray-100 text-gray-400">
//                 <Upload className="w-8 h-8" />
//               </AvatarFallback>
//             </Avatar>
//             <Button
//               size="sm"
//               variant="secondary"
//               className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50 border"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <Camera className="w-4 h-4" />
//             </Button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleMainImageSelect}
//             />
//           </div>
//         </div>

//         {/* === Banner === */}
//         <div className="flex flex-col items-center mb-6 space-y-2">
//           {formData.banner_image ? (
//             <img
//               src={formData.banner_image}
//               alt="banner"
//               className="w-full max-w-lg rounded-md border shadow-sm object-contain"
//             />
//           ) : (
//             <div className="w-full max-w-lg h-32 bg-gray-100 flex items-center justify-center rounded-md border">
//               <ImageIcon className="w-8 h-8 text-gray-400" />
//             </div>
//           )}
//           <Button
//             size="sm"
//             className="bg-gray-50 border text-gray-700 hover:bg-gray-100"
//             onClick={() => bannerInputRef.current?.click()}
//           >
//             Upload Banner
//           </Button>
//           <input
//             ref={bannerInputRef}
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={handleBannerSelect}
//           />
//         </div>

//         {/* === Text fields === */}
//         <div className="space-y-6">
//           <div>
//             <Label
//               htmlFor="brand-name"
//               className="text-sm font-medium text-gray-700"
//             >
//               Brand Name
//             </Label>
//             <Input
//               id="brand-name"
//               value={formData.name}
//               onChange={(e) => onChange("name", e.target.value)}
//               placeholder="Enter brand name"
//               className="mt-2"
//             />
//           </div>

//           <div>
//             <Label
//               htmlFor="brand-description"
//               className="text-sm font-medium text-gray-700"
//             >
//               Brand Description
//             </Label>
//             <Textarea
//               id="brand-description"
//               value={formData.description}
//               onChange={(e) => onChange("description", e.target.value)}
//               placeholder="Describe your brand..."
//               rows={6}
//               className="mt-2 resize-none"
//             />
//           </div>

//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={formData.is_topbrand || false}
//               onChange={(e) => onChange("is_topbrand", e.target.checked)}
//               id="top-brand"
//             />
//             <Label htmlFor="top-brand" className="text-sm text-gray-700">
//               Mark as Top Brand
//             </Label>
//           </div>

//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             <Link href="/settings/brands">
//               <Button variant="outline">Cancel</Button>
//             </Link>
//             <Button
//               disabled={isUpdating}
//               onClick={onSubmit}
//               className="bg-blue-500 hover:bg-blue-600"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {editingMode ? "Update Brand" : "Save Brand"}
//             </Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default BrandForm;

"use client";
import { setPreview } from "@/app/store/imageSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const BrandForm = ({
  formData,
  onChange,
  onSubmit,
  setImageFile,
  setBannerFile,
  editingMode = false,
  isUpdating = false,
}) => {
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const dispatch = useDispatch();
  const imagePreview = useSelector((state) => state.image.preview);

  const handleMainImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile?.(file);
      dispatch(setPreview(URL.createObjectURL(file)));
    }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile?.(file);
      onChange("banner_image", URL.createObjectURL(file)); // local preview
    }
  };

  return (
    <div className="mx-auto px-6 py-8">
      <Card className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar className="w-24 h-24 shadow-lg border-4 border-white">
              <AvatarImage src={imagePreview || formData.image_path} />
              <AvatarFallback className="bg-gray-100 text-gray-400">
                <Upload className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50 border"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageSelect}
            />
          </div>
        </div>

        {/* Banner */}
        <div className="flex flex-col items-center mb-6 space-y-2">
          {formData.banner_image ? (
            <img
              src={formData.banner_image}
              alt="Banner"
              className="w-full max-w-lg rounded-md border shadow-sm object-contain"
            />
          ) : (
            <div className="w-full max-w-lg h-32 bg-gray-100 flex items-center justify-center rounded-md border">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <Button
            size="sm"
            className="bg-gray-50 border text-gray-700 hover:bg-gray-100"
            onClick={() => bannerInputRef.current?.click()}
          >
            Upload Banner
          </Button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerSelect}
          />
        </div>

        {/* Text fields & buttons */}
        <div className="space-y-6">
          <div>
            <Label
              htmlFor="brand-name"
              className="text-sm font-medium text-gray-700"
            >
              Brand Name
            </Label>
            <Input
              id="brand-name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter brand name"
              className="mt-2"
            />
          </div>

          <div>
            <Label
              htmlFor="brand-description"
              className="text-sm font-medium text-gray-700"
            >
              Brand Description
            </Label>
            <Textarea
              id="brand-description"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Describe your brand..."
              rows={6}
              className="mt-2 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_topbrand || false}
              onChange={(e) => onChange("is_topbrand", e.target.checked)}
              id="top-brand"
            />
            <Label htmlFor="top-brand" className="text-sm text-gray-700">
              Mark as Top Brand
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/settings/brands">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              disabled={isUpdating}
              onClick={onSubmit}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingMode ? "Update Brand" : "Save Brand"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrandForm;
