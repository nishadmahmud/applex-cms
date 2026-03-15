// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { useForm } from "react-hook-form";
// import useTopbars from "@/api/hooks/useTopHeaderQuery";

// export function CreateTopBarForm({ onClose }) {
//   const { data: topbarsData, isLoading, isError, error } = useTopbars();
//   const [bgColor, setBgColor] = useState(
//     topbarsData?.settings?.bg_color || "#ff0220"
//   );

//   const { createTopbar } = useTopbars();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       title: "",
//       description: "",
//       link: "",
//       status: true,
//       priority: 1,
//     },
//   });

//   const onSubmit = async (formData) => {
//     try {
//       await createTopbar.mutateAsync({
//         topbars: [
//           {
//             title: formData.title,
//             description: formData.description,
//             link: formData.link,
//             status: formData.status,
//             priority: formData.priority,
//           },
//         ],
//         bg_color: bgColor,
//       });

//       toast.success("Topbar created successfully!");
//       reset();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to create topbar.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="title">Title *</Label>
//           <Input
//             id="title"
//             {...register("title", { required: "Title is required" })}
//             placeholder="Enter title"
//           />
//           {errors.title && (
//             <p className="text-red-500 text-xs">{errors.title.message}</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="priority">Priority</Label>
//           <Input
//             id="priority"
//             type="number"
//             min="1"
//             {...register("priority", { valueAsNumber: true })}
//             placeholder="e.g. 1"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="link">Link</Label>
//           <Input
//             id="link"
//             type="url"
//             {...register("link")}
//             placeholder="https://example.com"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="status">Status</Label>
//           <div className="flex items-center space-x-2">
//             <Checkbox id="status" {...register("status")} />
//             <Label htmlFor="status">Active</Label>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="description">Description</Label>
//         <Textarea
//           id="description"
//           {...register("description")}
//           placeholder="Optional description..."
//           rows={2}
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="bg_color">Background Color</Label>
//         <div className="flex items-center space-x-2">
//           <Input
//             id="bg_color"
//             type="color"
//             value={bgColor}
//             onChange={(e) => setBgColor(e.target.value)}
//             className="w-10 h-10 p-0 border rounded"
//           />
//           <Input
//             value={bgColor}
//             onChange={(e) => setBgColor(e.target.value)}
//             className="flex-1"
//           />
//         </div>
//         <div
//           className="h-6 w-full rounded border border-gray-300 mt-1"
//           style={{ backgroundColor: bgColor }}
//         ></div>
//       </div>

//       <div className="flex justify-end space-x-2 pt-4">
//         <Button type="button" variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button type="submit">Create</Button>
//       </div>
//     </form>
//   );
// }

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form"; // <-- added Controller
import useTopbars from "@/apiHooks/hooks/useTopHeaderQuery";

export function CreateTopBarForm({ onClose }) {
  const { data: topbarsData } = useTopbars();
  const [bgColor, setBgColor] = useState(
    topbarsData?.settings?.bg_color || "#ff0220"
  );

  const { createTopbar } = useTopbars();

  const {
    register,
    handleSubmit,
    reset,
    control, // <-- added control for Controller
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      link: "",
      status: true,
      priority: 1,
    },
  });

  const onSubmit = async (formData) => {
    try {
      await createTopbar.mutateAsync({
        topbars: [
          {
            title: formData.title,
            description: formData.description,
            link: formData.link,
            status: formData.status, // now works correctly
            priority: formData.priority,
          },
        ],
        bg_color: bgColor,
      });

      toast.success("Topbar created successfully!");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create topbar.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            {...register("priority", { valueAsNumber: true })}
            placeholder="e.g. 1"
          />
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            {...register("link")}
            placeholder="https://example.com"
          />
        </div>

        {/* Status (fixed with Controller) */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            defaultValue={true}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="status">Active</Label>
              </div>
            )}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Optional description..."
          rows={2}
        />
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="bg_color">Background Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="bg_color"
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-10 p-0 border rounded"
          />
          <Input
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="flex-1"
          />
        </div>
        <div
          className="h-6 w-full rounded border border-gray-300 mt-1"
          style={{ backgroundColor: bgColor }}
        ></div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
