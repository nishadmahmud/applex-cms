// "use client";

// import { React, useState, useEffect } from "react";
// import { Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import {
//   useSaveAttributeMutation,
//   useUpdateAttributeMutation,
// } from "@/app/store/api/attributesApi";

// export default function AttributeForm({
//   isOpen,
//   onClose,
//   onSuccess,
//   editingAttribute,
// }) {
//   //   const { toast } = useToast();
//   const [saveAttribute, { isLoading: isSaving }] = useSaveAttributeMutation();
//   const [updateAttribute, { isLoading: isUpdating }] =
//     useUpdateAttributeMutation();

//   const [formData, setFormData] = useState({
//     name: "",
//     status: "active",
//     values: [],
//   });
//   const [newValue, setNewValue] = useState("");

//   const isLoading = isSaving || isUpdating;
//   const isEditing = !!editingAttribute;

//   // Reset form when modal opens/closes or editing attribute changes
//   useEffect(() => {
//     if (isOpen) {
//       if (editingAttribute) {
//         setFormData({
//           id: editingAttribute.id,
//           name: editingAttribute.name || "",
//           status: editingAttribute.status || "active",
//           values:
//             editingAttribute.values?.map((v) => ({
//               id: v.id,
//               value: v.value,
//               status: v.status || "active",
//             })) || [],
//         });
//       } else {
//         setFormData({
//           name: "",
//           status: "active",
//           values: [],
//         });
//       }
//       setNewValue("");
//     }
//   }, [isOpen, editingAttribute]);

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleAddValue = () => {
//     if (!newValue.trim()) return;

//     const isDuplicate = formData.values.some(
//       (v) => v.value.toLowerCase() === newValue.trim().toLowerCase()
//     );

//     if (isDuplicate) {
//       toast.warning("This value already exists");
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       values: [
//         ...prev.values,
//         {
//           value: newValue.trim(),
//           status: "active",
//         },
//       ],
//     }));
//     setNewValue("");
//   };

//   const handleRemoveValue = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       values: prev.values.filter((_, i) => i !== index),
//     }));
//   };

//   const handleUpdateValue = (index, newValueText) => {
//     setFormData((prev) => ({
//       ...prev,
//       values: prev.values.map((value, i) =>
//         i === index ? { ...value, value: newValueText } : value
//       ),
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast.error("Attribute name is required");
//       return;
//     }

//     if (formData.values.length === 0) {
//       toast.error("At least one value is required");
//       return;
//     }

//     try {
//       const payload = {
//         attributes: [
//           {
//             ...(isEditing && { id: formData.id }),
//             name: formData.name.trim(),
//             status: formData.status,
//             values: formData.values.map((v) => ({
//               ...(v.id && { id: v.id }),
//               value: v.value.trim(),
//               status: v.status || "active",
//             })),
//           },
//         ],
//       };

//       if (isEditing) {
//         await updateAttribute({ id: formData.id, ...payload }).unwrap();
//         toast.success("Attribute updated successfully");
//       } else {
//         await saveAttribute(payload).unwrap();
//         toast.success("Attribute created successfully");
//       }

//       onSuccess();
//     } catch (error) {
//       toast.error(
//         error?.data?.message ||
//           `Failed to ${isEditing ? "update" : "create"} attribute`
//       );
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleAddValue();
//     }
//   };

//   const handleToggleValueStatus = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       values: prev.values.map((value, i) =>
//         i === index
//           ? {
//               ...value,
//               status: value.status === "active" ? "inactive" : "active",
//             }
//           : value
//       ),
//     }));
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? "Edit Attribute" : "Add New Attribute"}
//           </DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Attribute Name */}
//           <div className="space-y-2">
//             <Label htmlFor="name">Attribute Name *</Label>
//             <Input
//               id="name"
//               value={formData.name}
//               onChange={(e) => handleInputChange("name", e.target.value)}
//               placeholder="e.g., Color, Size, Material"
//               disabled={isLoading}
//             />
//           </div>

//           {/* Status */}
//           <div className="space-y-2">
//             <Label htmlFor="status">Status</Label>
//             <Select
//               value={formData.status}
//               onValueChange={(value) => handleInputChange("status", value)}
//               disabled={isLoading}
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="active">Active</SelectItem>
//                 <SelectItem value="inactive">Inactive</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Add Values */}
//           <div className="space-y-4">
//             <Label>Attribute Values *</Label>

//             {/* Add new value input */}
//             <div className="flex gap-2">
//               <Input
//                 value={newValue}
//                 onChange={(e) => setNewValue(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter attribute value"
//                 disabled={isLoading}
//               />
//               <Button
//                 type="button"
//                 onClick={handleAddValue}
//                 disabled={!newValue.trim() || isLoading}
//                 className="gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add
//               </Button>
//             </div>

//             {/* Values list */}
//             {formData.values.length > 0 && (
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm">
//                     Values ({formData.values.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-2">
//                   {formData.values.map((value, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center gap-2 p-2 border rounded-md"
//                     >
//                       <Input
//                         value={value.value}
//                         onChange={(e) =>
//                           handleUpdateValue(index, e.target.value)
//                         }
//                         className="flex-1"
//                         disabled={isLoading}
//                       />
//                       <Button
//                         type="button"
//                         size="sm"
//                         onClick={() => handleToggleValueStatus(index)}
//                         disabled={isLoading}
//                         className={`h-7 px-3 text-xs capitalize ${
//                           value.status === "active"
//                             ? "bg-green-500 text-white hover:bg-green-600" // Nice Green for Active
//                             : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300" // Muted Gray for Inactive
//                         }`}
//                       >
//                         {value.status}
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleRemoveValue(index)}
//                         disabled={isLoading}
//                         className="h-8 w-8 p-0 text-destructive hover:text-destructive"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}

//             {formData.values.length === 0 && (
//               <div className="text-center py-8 text-muted-foreground">
//                 <p>No values added yet</p>
//                 <p className="text-sm">Add at least one value to continue</p>
//               </div>
//             )}
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onClose}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={
//                 isLoading ||
//                 !formData.name.trim() ||
//                 formData.values.length === 0
//               }
//             >
//               {isLoading
//                 ? "Saving..."
//                 : isEditing
//                 ? "Update Attribute"
//                 : "Create Attribute"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { React, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSaveAttributeMutation,
  useUpdateAttributeMutation,
} from "@/app/store/api/attributesApi";

export default function AttributeForm({
  isOpen,
  onClose,
  onSuccess,
  editingAttribute,
}) {
  const [saveAttribute, { isLoading: isSaving }] = useSaveAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] =
    useUpdateAttributeMutation();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "active",
    values: [],
  });
  const [newValue, setNewValue] = useState("");

  const isLoading = isSaving || isUpdating;
  const isEditing = !!editingAttribute;

  // Reset form when modal opens/closes or editing attribute changes
  useEffect(() => {
    if (isOpen) {
      if (editingAttribute) {
        setFormData({
          id: editingAttribute.id,
          name: editingAttribute.name || "",
          type: editingAttribute.type || "",
          status: editingAttribute.status || "active",
          values:
            editingAttribute.values?.map((v) => ({
              id: v.id,
              value: v.value,
              status: v.status || "active",
            })) || [],
        });
      } else {
        setFormData({
          name: "",
          type: "",
          status: "active",
          values: [],
        });
      }
      setNewValue("");
    }
  }, [isOpen, editingAttribute]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddValue = () => {
    if (!newValue.trim()) return;

    const isDuplicate = formData.values.some(
      (v) => v.value.toLowerCase() === newValue.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.warning("This value already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          value: newValue.trim(),
          status: "active",
        },
      ],
    }));
    setNewValue("");
  };

  const handleRemoveValue = (index) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateValue = (index, newValueText) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((value, i) =>
        i === index ? { ...value, value: newValueText } : value
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    if (!formData.type) {
      toast.error("Attribute type is required");
      return;
    }

    if (formData.values.length === 0) {
      toast.error("At least one value is required");
      return;
    }

    try {
      const payload = {
        attributes: [
          {
            ...(isEditing && { id: formData.id }),
            name: formData.name.trim(),
            type: formData.type,
            status: formData.status,
            values: formData.values.map((v) => ({
              ...(v.id && { id: v.id }),
              value: v.value.trim(),
              status: v.status || "active",
            })),
          },
        ],
      };

      if (isEditing) {
        await updateAttribute({ id: formData.id, ...payload }).unwrap();
        toast.success("Attribute updated successfully");
      } else {
        await saveAttribute(payload).unwrap();
        toast.success("Attribute created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} attribute`
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const handleToggleValueStatus = (index) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((value, i) =>
        i === index
          ? {
              ...value,
              status: value.status === "active" ? "inactive" : "active",
            }
          : value
      ),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Attribute" : "Add New Attribute"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attribute Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Attribute Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Color, Size, Material"
              disabled={isLoading}
            />
          </div>

          {/* Attribute Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Attribute Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="ram">RAM</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="color_code">Color Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Values */}
          <div className="space-y-4">
            <Label>Attribute Values *</Label>

            {/* Add new value input */}
            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter attribute value"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleAddValue}
                disabled={!newValue.trim() || isLoading}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Values list */}
            {formData.values.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Values ({formData.values.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.values.map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <Input
                        value={value.value}
                        onChange={(e) =>
                          handleUpdateValue(index, e.target.value)
                        }
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleToggleValueStatus(index)}
                        disabled={isLoading}
                        className={`h-7 px-3 text-xs capitalize ${
                          value.status === "active"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                        }`}
                      >
                        {value.status}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveValue(index)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {formData.values.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No values added yet</p>
                <p className="text-sm">Add at least one value to continue</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.name.trim() ||
                !formData.type ||
                formData.values.length === 0
              }
            >
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Attribute"
                : "Create Attribute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
