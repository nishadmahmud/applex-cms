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
// export function EditTopBarForm({ onClose, data }) {
//   const [bgColor, setBgColor] = useState(data?.bg_color || "#ff0220");

//   const { updateTopbar } = useTopbars();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       title: data?.title || "",
//       description: data?.description || "",
//       link: data?.link || "",
//       status: data?.status ?? true,
//       priority: data?.priority ?? 1,
//     },
//   });

//   const onSubmit = async (formData) => {
//     try {
//       // ✅ Send bg_color only if changed
//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         link: formData.link,
//         status: formData.status,
//         priority: formData.priority,
//         bg_color: bgColor !== data?.bg_color ? bgColor : undefined,
//       };

//       // Remove bg_color if not changed
//       if (!payload.bg_color) delete payload.bg_color;

//       await updateTopbar.mutateAsync({
//         id: data.id,
//         payload,
//       });

//       toast.success("Topbar updated successfully!");
//       reset();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to update topbar.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       {/* Topbar Fields */}
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

//       {/* Global BG Color */}
//       <div className="space-y-2">
//         <Label htmlFor="bg_color">Background Color (Global)</Label>
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
//         <Button type="submit">Update</Button>
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
import { useForm, Controller } from "react-hook-form";
import useTopbars from "@/apiHooks/hooks/useTopHeaderQuery";

export function EditTopBarForm({ onClose, data }) {
  const { data: topbarsData } = useTopbars();
  const initialBgColor = topbarsData?.settings?.bg_color || "#ff0220";

  const [bgColor, setBgColor] = useState(initialBgColor);

  const { updateTopbar } = useTopbars();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      link: data?.link || "",
      status: data?.status ?? false, // use actual value from `data`
      priority: data?.priority ?? 1,
    },
  });

  const onSubmit = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        status: formData.status ? 1 : 0, // backend-safe
        priority: formData.priority,
        bg_color: bgColor !== initialBgColor ? bgColor : undefined,
      };

      if (!payload.bg_color) delete payload.bg_color;

      await updateTopbar.mutateAsync({
        id: data.id,
        payload,
      });

      toast.success("Topbar updated successfully!");

      // ✅ Reset to the updated values so checkbox stays consistent
      reset({
        ...formData,
        status: formData.status, // keep same as saved
      });

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update topbar.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Topbar Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            {...register("link")}
            placeholder="https://example.com"
          />
        </div>

        {/* ✅ Fixed Status Checkbox */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <div className="flex items-center space-x-2">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="status"
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
              )}
            />
            <Label htmlFor="status">Active</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Optional description..."
          rows={2}
        />
      </div>

      {/* BG Color Preview */}
      <div className="space-y-2">
        <Label htmlFor="bg_color">Background Color (Global)</Label>
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update</Button>
      </div>
    </form>
  );
}
