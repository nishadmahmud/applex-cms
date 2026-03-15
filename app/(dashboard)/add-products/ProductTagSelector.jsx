// // src/components/Product/ProductTagSelector.jsx (FINAL FIX)

// "use client";

// import * as React from "react";
// import { useState, useMemo } from "react";
// import { Check, PlusCircle, Tag, X, Loader2, ShieldAlert } from "lucide-react";
// import { Controller } from "react-hook-form";
// import { toast } from "sonner";
// import { useSession } from "next-auth/react";

// // Components from shadcn/ui
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandGroup,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
//   CommandInput, // For search functionality
//   CommandEmpty, // For "No results"
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// // RTK Query hooks and TagsForm
// import { useGetTagsQuery } from "@/app/store/api/tagsApi";
// import TagsForm from "../ecommerce/product-tags/tags-form";

// /**
//  * Product Tag Selector component with multi-select, search, and on-the-fly creation.
//  * @param {object} props
//  * @param {object} props.form - The react-hook-form instance.
//  */
// export default function ProductTagSelector({ form }) {
//   const { status } = useSession();
//   const isAuthenticated = status === "authenticated";

//   const {
//     data: allTags,
//     isLoading: isTagsLoading,
//     isError: isTagsError,
//     refetch,
//   } = useGetTagsQuery(undefined, {
//     skip: !isAuthenticated,
//   });

//   const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//   const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);

//   // NOTE: You correctly identified that RTK-Query data might be nested in a 'data' property.
//   const tagsArray = allTags?.data || [];

//   const handleSelectTag = (field, tagId) => {
//     const currentValue = field.value || [];
//     const isSelected = currentValue.includes(tagId);

//     if (isSelected) {
//       field.onChange(currentValue.filter((id) => id !== tagId));
//     } else {
//       field.onChange([...currentValue, tagId]);
//     }
//   };

//   const handleRemoveTag = (field, tagId) => {
//     field.onChange((field.value || []).filter((id) => id !== tagId));
//   };

//   const selectedTags = useMemo(() => {
//     const selectedIds = form.watch("tags") || [];
//     return tagsArray.filter((tag) => selectedIds.includes(tag.id));
//   }, [form.watch("tags"), tagsArray]);

//   // --- Conditional Render Status ---

//   if (status === "loading") {
//     return (
//       <div className="space-y-3">
//         <Label className="text-sm font-medium">Product Tags</Label>
//         <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50 text-sm text-gray-500">
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Checking Auth...
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="space-y-3">
//         <Label className="text-sm font-medium">Product Tags</Label>
//         <div className="flex items-center justify-center h-10 border rounded-md bg-red-50 text-sm text-red-500">
//           <ShieldAlert className="mr-2 h-4 w-4" />
//           Login required to load tags.
//         </div>
//       </div>
//     );
//   }

//   if (isTagsError) {
//     return (
//       <div className="space-y-3">
//         <Label className="text-sm font-medium text-red-600">Product Tags</Label>
//         <div className="flex justify-between items-center h-10 border border-red-300 rounded-md bg-red-50 p-2">
//           <p className="text-sm text-red-500">Error loading tags.</p>
//           <Button
//             onClick={refetch}
//             variant="ghost"
//             size="sm"
//             className="h-8 text-xs text-red-500 hover:bg-red-100"
//           >
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // --- Main Render ---

//   return (
//     <Controller
//       name="tags"
//       control={form.control}
//       defaultValue={[]}
//       render={({ field }) => (
//         <div className="space-y-3">
//           <Label className="text-sm font-medium">Product Tags</Label>
//           <div className="flex flex-wrap gap-2 min-h-[40px] items-center rounded-md border border-input p-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 transition-all">
//             {/* Display Selected Tags */}
//             {selectedTags.length > 0 ? (
//               selectedTags.map((tag) => (
//                 <Badge
//                   key={tag.id}
//                   variant="secondary"
//                   className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full cursor-pointer transition-colors"
//                   onClick={() => handleRemoveTag(field, tag.id)}
//                 >
//                   {tag.name}
//                   <X className="ml-1 h-3 w-3 text-blue-700 hover:text-blue-900" />
//                 </Badge>
//               ))
//             ) : (
//               <span className="text-sm text-muted-foreground ml-1">
//                 Select or create product tags...
//               </span>
//             )}

//             {/* Popover/Combobox for Selection and Creation */}
//             <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="ml-auto flex items-center gap-1 h-8 rounded-full border-dashed"
//                   disabled={isTagsLoading}
//                 >
//                   <Tag className="h-4 w-4" />
//                   {isTagsLoading ? "Loading..." : "Add Tags"}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-[300px] p-0" align="start">
//                 <Command>
//                   {/* FIX 2: ADD Search Input */}
//                   <CommandInput placeholder="Search tags..." />
//                   <CommandEmpty>
//                     No tags found matching your search.
//                   </CommandEmpty>

//                   <CommandList>
//                     <CommandGroup heading="Available Tags">
//                       {tagsArray.length > 0 &&
//                         tagsArray.map((tag) => (
//                           <CommandItem
//                             key={tag.id}
//                             // Store the tag name in the value for search filtering
//                             value={tag.name}
//                             onSelect={() => handleSelectTag(field, tag.id)}
//                             className="flex justify-between items-center"
//                           >
//                             <span>{tag.name}</span>
//                             {(field.value || []).includes(tag.id) && (
//                               <Check className="ml-auto h-4 w-4 text-blue-600" />
//                             )}
//                           </CommandItem>
//                         ))}
//                     </CommandGroup>
//                   </CommandList>

//                   <CommandSeparator />

//                   {/* FIX 1: The Robust Nested Trigger Solution */}
//                   <Dialog
//                     open={isCreationDialogOpen}
//                     onOpenChange={setIsCreationDialogOpen}
//                   >
//                     <CommandItem
//                       // IMPORTANT: Prevent the CommandItem's onSelect from closing the Popover
//                       onSelect={(e) => {
//                         e.preventDefault();
//                       }}
//                       className="text-blue-600 hover:bg-blue-50 cursor-pointer p-0"
//                       // Set a dummy value to keep the item visible even when searching
//                       value="create-new-tag-option"
//                     >
//                       <DialogTrigger asChild>
//                         {/* Use a full-width div as the click target */}
//                         <div className="flex items-center w-full px-2 py-1.5 cursor-pointer">
//                           <PlusCircle className="mr-2 h-4 w-4" />
//                           Create New Tag
//                         </div>
//                       </DialogTrigger>
//                     </CommandItem>

//                     {/* Dialog Content (No Change) */}
//                     <DialogContent className="sm:max-w-[500px]">
//                       <DialogHeader>
//                         <DialogTitle>Create New Tags</DialogTitle>
//                       </DialogHeader>
//                       <TagsForm
//                         tag={null}
//                         onClose={() => {
//                           setIsCreationDialogOpen(false);
//                           // Refetch tags after creation to update the list
//                           toast.promise(refetch(), {
//                             loading: "Refreshing tags list...",
//                             success: "Tags list updated!",
//                             error: "Failed to refresh tags list.",
//                           });
//                         }}
//                       />
//                     </DialogContent>
//                   </Dialog>
//                 </Command>
//               </PopoverContent>
//             </Popover>
//           </div>
//         </div>
//       )}
//     />
//   );
// }

// src/components/Product/ProductTagSelector.jsx

"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Check, PlusCircle, Tag, X, Loader2, ShieldAlert } from "lucide-react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Components from shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandInput, // For search functionality
  CommandEmpty, // For "No results"
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// RTK Query hooks and TagsForm
import { useGetTagsQuery } from "@/app/store/api/tagsApi";
import TagsForm from "../ecommerce/product-tags/tags-form";

/**
 * Product Tag Selector component with multi-select, search, and on-the-fly creation.
 * @param {object} props
 * @param {object} props.form - The react-hook-form instance.
 */
export default function ProductTagSelector({ form }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const {
    data: allTags,
    isLoading: isTagsLoading,
    isError: isTagsError,
    refetch,
  } = useGetTagsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);

  const tagsArray = allTags?.data || [];

  const handleSelectTag = (field, tagId) => {
    const currentValue = field.value || [];
    const isSelected = currentValue.includes(tagId);

    if (isSelected) {
      field.onChange(currentValue.filter((id) => id !== tagId));
    } else {
      field.onChange([...currentValue, tagId]);
    }
  };

  const handleRemoveTag = (field, tagId) => {
    field.onChange((field.value || []).filter((id) => id !== tagId));
  };

  const selectedTags = useMemo(() => {
    const selectedIds = form.watch("tags") || [];
    return tagsArray.filter((tag) => selectedIds.includes(tag.id));
  }, [form.watch("tags"), tagsArray]);

  // --- Conditional Render Status ---

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Product Tags</Label>
        <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50 text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking Auth...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Product Tags</Label>
        <div className="flex items-center justify-center h-10 border rounded-md bg-red-50 text-sm text-red-500">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Login required to load tags.
        </div>
      </div>
    );
  }

  if (isTagsError) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-red-600">Product Tags</Label>
        <div className="flex justify-between items-center h-10 border border-red-300 rounded-md bg-red-50 p-2">
          <p className="text-sm text-red-500">Error loading tags.</p>
          <Button
            onClick={refetch}
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-red-500 hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <Controller
      name="tags"
      control={form.control}
      defaultValue={[]}
      render={({ field }) => (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Product Tags</Label>
          <div className="flex flex-wrap gap-2 min-h-[40px] items-center rounded-md border border-input p-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            {/* Display Selected Tags */}
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full cursor-pointer transition-colors"
                  onClick={() => handleRemoveTag(field, tag.id)}
                >
                  {tag.name}
                  <X className="ml-1 h-3 w-3 text-blue-700 hover:text-blue-900" />
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground ml-1">
                Select or create product tags...
              </span>
            )}

            {/* Popover/Combobox for Selection and Creation */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto flex items-center gap-1 h-8 rounded-full border-dashed"
                  disabled={isTagsLoading}
                >
                  <Tag className="h-4 w-4" />
                  {isTagsLoading ? "Loading..." : "Add Tags"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  {/* Search Input */}
                  <CommandInput placeholder="Search tags..." />
                  <CommandEmpty>
                    No tags found matching your search.
                  </CommandEmpty>

                  <CommandList>
                    <CommandGroup heading="Available Tags">
                      {tagsArray.length > 0 &&
                        tagsArray.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => handleSelectTag(field, tag.id)}
                            className="flex justify-between items-center"
                          >
                            <span>{tag.name}</span>
                            {(field.value || []).includes(tag.id) && (
                              <Check className="ml-auto h-4 w-4 text-blue-600" />
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>

                  <CommandSeparator />

                  {/* START FIX: The Robust Nested Trigger Solution */}
                  <Dialog
                    open={isCreationDialogOpen}
                    onOpenChange={setIsCreationDialogOpen}
                  >
                    <CommandItem
                      // 1. Crucial: Prevents the Command component from closing the Popover
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                      className="text-blue-600 hover:bg-blue-50 cursor-pointer p-0"
                      value="create-new-tag-option"
                    >
                      <DialogTrigger asChild>
                        <div
                          className="flex items-center w-full px-2 py-1.5 cursor-pointer"
                          // 2. Crucial: Prevents the click from bubbling up to the Popover/Command root
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create New Tag
                        </div>
                      </DialogTrigger>
                    </CommandItem>

                    {/* Dialog Content */}
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New Tags</DialogTitle>
                      </DialogHeader>
                      <TagsForm
                        tag={null}
                        onClose={() => {
                          setIsCreationDialogOpen(false);
                          toast.promise(refetch(), {
                            loading: "Refreshing tags list...",
                            success: "Tags list updated!",
                            error: "Failed to refresh tags list.",
                          });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  {/* END FIX */}
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    />
  );
}
