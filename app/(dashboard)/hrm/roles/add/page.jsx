// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { ArrowLeft, Save, Shield } from "lucide-react";
// import Link from "next/link";
// import { useCreateRole } from "@/apiHooks/hooks/useRoleQueries";
// import { rolesFeatures } from "@/app/constants/roles-feature";

// export default function AddRolePage() {
//   const router = useRouter();
//   const createRole = useCreateRole();

//   const [formData, setFormData] = useState({ name: "", description: "" });

//   const [features, setFeatures] = useState(
//     rolesFeatures.map((feature) => ({
//       ...feature,
//       status: false,
//       feature_options: feature.feature_options.map((opt) => ({
//         ...opt,
//         status: false,
//       })),
//     }))
//   );

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFeatureToggle = (featureIndex) => {
//     setFeatures((prev) =>
//       prev.map((f, idx) => {
//         if (idx !== featureIndex) return f;
//         const newStatus = !f.status;
//         return {
//           ...f,
//           status: newStatus,
//           feature_options: f.feature_options.map((opt) => ({
//             ...opt,
//             status: newStatus ? opt.status : false,
//           })),
//         };
//       })
//     );
//   };

//   const handleOptionToggle = (featureIndex, optionIndex) => {
//     setFeatures((prev) =>
//       prev.map((f, fIdx) => {
//         if (fIdx !== featureIndex) return f;
//         const newOptions = f.feature_options.map((opt, oIdx) =>
//           oIdx === optionIndex ? { ...opt, status: !opt.status } : opt
//         );
//         const anyOptionChecked = newOptions.some((opt) => opt.status);
//         return { ...f, status: anyOptionChecked, feature_options: newOptions };
//       })
//     );
//   };

//   const handleSelectAllOptions = (featureIndex) => {
//     setFeatures((prev) =>
//       prev.map((f, idx) => {
//         if (idx !== featureIndex) return f;
//         const allChecked = f.feature_options.every((opt) => opt.status);
//         const newOptions = f.feature_options.map((opt) => ({
//           ...opt,
//           status: !allChecked,
//         }));
//         return { ...f, status: !allChecked, feature_options: newOptions };
//       })
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) return;

//     const payload = {
//       name: formData.name,
//       description: formData.description,
//       features: features.map((f) => ({
//         name: f.name,
//         status: f.status,
//         feature_options: f.feature_options.map((opt) => ({
//           name: opt.name,
//           status: opt.status,
//         })),
//       })),
//     };

//     createRole.mutate(payload, { onSuccess: () => router.push("/hrm/roles") });
//   };

//   const selectedCount = features.filter((f) => f.status).length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-4">
//           <Link href="/hrm/roles">
//             <Button variant="ghost" size="sm" className="mb-2 gap-2">
//               <ArrowLeft className="h-4 w-4" /> Back to Roles
//             </Button>
//           </Link>
//           <div className="flex items-center gap-3">
//             {/* Icon */}
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
//               <Shield className="h-5 w-5 text-primary" />
//             </div>

//             {/* Text */}
//             <div className="flex-1">
//               <h1 className="text-lg font-semibold text-balance leading-snug">
//                 Create New Role
//               </h1>
//               <p className="text-sm text-muted-foreground leading-tight">
//                 Define permissions and access levels for your team members
//               </p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-2">
//           {/* Basic Info */}
//           <Card className="border-2 shadow-sm">
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//               {/* <CardDescription>
//                 Provide a name and description for this role
//               </CardDescription> */}
//             </CardHeader>
//             <CardContent className="space-y-1">
//               <div className="flex flex-wrap gap-4">
//                 {/* Role Name */}
//                 <div className="flex-1 min-w-[250px] space-y-1">
//                   <Label htmlFor="name" className="text-base">
//                     Role Name <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="name"
//                     name="name"
//                     placeholder="e.g., Sales Manager, Store Admin"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     required
//                     className="h-11"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="flex-1 min-w-[250px] space-y-1">
//                   <Label htmlFor="description" className="text-base">
//                     Description
//                   </Label>
//                   <Textarea
//                     id="description"
//                     name="description"
//                     placeholder="Describe the responsibilities and scope of this role..."
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows={0.5}
//                     // className="resize-none"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Permissions */}
//           <Card className="border-2 shadow-sm">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Permissions & Access</CardTitle>
//                   <CardDescription>
//                     Select features and specific permissions for this role
//                   </CardDescription>
//                 </div>
//                 <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 ring-1 ring-primary/20">
//                   <span className="text-sm font-medium text-muted-foreground">
//                     Selected:
//                   </span>
//                   <span className="text-xl font-bold text-primary">
//                     {selectedCount}
//                   </span>
//                   <span className="text-sm text-muted-foreground">
//                     / {features.length}
//                   </span>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2">
//                 {features.map((feature, featureIndex) => {
//                   const Icon = feature.icon;
//                   const allOptionsChecked =
//                     feature.feature_options.length > 0 &&
//                     feature.feature_options.every((opt) => opt.status);

//                   return (
//                     <Card
//                       key={feature.name}
//                       className={`transition-all duration-200 ${
//                         feature.status
//                           ? "border-primary bg-primary/5 ring-2 ring-primary/20"
//                           : "border-border hover:border-primary/50"
//                       }`}
//                     >
//                       <CardContent className="p-4">
//                         <div className="flex items-start gap-3 mb-3">
//                           <div
//                             className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
//                               feature.status
//                                 ? "bg-primary text-primary-foreground"
//                                 : "bg-muted text-muted-foreground"
//                             }`}
//                           >
//                             <Icon className="h-5 w-5" />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2">
//                               <Checkbox
//                                 id={`feature-${featureIndex}`}
//                                 checked={feature.status}
//                                 onCheckedChange={() =>
//                                   handleFeatureToggle(featureIndex)
//                                 }
//                                 className="h-5 w-5"
//                               />
//                               <Label
//                                 htmlFor={`feature-${featureIndex}`}
//                                 className="text-base font-semibold cursor-pointer"
//                               >
//                                 {feature.name}
//                               </Label>
//                             </div>
//                           </div>
//                         </div>

//                         {feature.feature_options.length > 0 && (
//                           <>
//                             <Separator className="mb-3" />
//                             <div className="space-y-2">
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//                                   Permissions
//                                 </span>
//                                 {feature.feature_options.length > 1 && (
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() =>
//                                       handleSelectAllOptions(featureIndex)
//                                     }
//                                     className="h-6 text-xs"
//                                     disabled={!feature.status}
//                                   >
//                                     {allOptionsChecked ? "Deselect" : "Select"}{" "}
//                                     All
//                                   </Button>
//                                 )}
//                               </div>
//                               <div className="space-y-2">
//                                 {feature.feature_options.map(
//                                   (option, optionIndex) => (
//                                     <div
//                                       key={option.name}
//                                       className={`flex items-center gap-2 rounded-md p-2 transition-colors ${
//                                         option.status
//                                           ? "bg-primary/10"
//                                           : "hover:bg-muted/50"
//                                       }`}
//                                     >
//                                       <Checkbox
//                                         id={`option-${featureIndex}-${optionIndex}`}
//                                         checked={option.status}
//                                         onCheckedChange={() =>
//                                           handleOptionToggle(
//                                             featureIndex,
//                                             optionIndex
//                                           )
//                                         }
//                                         disabled={!feature.status}
//                                         className="h-4 w-4"
//                                       />
//                                       <Label
//                                         htmlFor={`option-${featureIndex}-${optionIndex}`}
//                                         className={`text-sm cursor-pointer flex-1 ${
//                                           !feature.status
//                                             ? "text-muted-foreground"
//                                             : ""
//                                         }`}
//                                       >
//                                         {option.name}
//                                       </Label>
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           </>
//                         )}
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex items-center justify-end gap-4 pt-4">
//             <Link href="/hrm/roles">
//               <Button type="button" variant="outline" size="lg">
//                 Cancel
//               </Button>
//             </Link>
//             <Button
//               type="submit"
//               size="lg"
//               disabled={createRole.isPending || !formData.name.trim()}
//               className="gap-2 min-w-32"
//             >
//               {createRole.isPending ? (
//                 <>
//                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Create Role
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Shield } from "lucide-react";
import Link from "next/link";
import { useCreateRole } from "@/apiHooks/hooks/useRoleQueries";
import { rolesFeatures } from "@/app/constants/roles-feature";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AddRolePage() {
  const router = useRouter();
  const createRole = useCreateRole();

  const [formData, setFormData] = useState({ name: "", description: "" });

  const [features, setFeatures] = useState(
    rolesFeatures.map((feature) => ({
      ...feature,
      status: false,
      feature_options: feature.feature_options.map((opt) => ({
        ...opt,
        status: false,
      })),
    }))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (featureIndex) => {
    setFeatures((prev) =>
      prev.map((f, idx) => {
        if (idx !== featureIndex) return f;
        const newStatus = !f.status;
        return {
          ...f,
          status: newStatus,
          feature_options: f.feature_options.map((opt) => ({
            ...opt,
            status: newStatus ? opt.status : false,
          })),
        };
      })
    );
  };

  const handleOptionToggle = (featureIndex, optionIndex) => {
    setFeatures((prev) =>
      prev.map((f, fIdx) => {
        if (fIdx !== featureIndex) return f;
        const newOptions = f.feature_options.map((opt, oIdx) =>
          oIdx === optionIndex ? { ...opt, status: !opt.status } : opt
        );
        const anyOptionChecked = newOptions.some((opt) => opt.status);
        return { ...f, status: anyOptionChecked, feature_options: newOptions };
      })
    );
  };

  const handleSelectAllOptions = (featureIndex) => {
    setFeatures((prev) =>
      prev.map((f, idx) => {
        if (idx !== featureIndex) return f;
        const allChecked = f.feature_options.every((opt) => opt.status);
        const newOptions = f.feature_options.map((opt) => ({
          ...opt,
          status: !allChecked,
        }));
        return { ...f, status: !allChecked, feature_options: newOptions };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      features: features.map((f) => ({
        name: f.name,
        status: f.status,
        feature_options: f.feature_options.map((opt) => ({
          name: opt.name,
          status: opt.status,
        })),
      })),
    };

    createRole.mutate(payload, { onSuccess: () => router.push("/hrm/roles") });
  };

  const selectedCount = features.filter((f) => f.status).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4">
          <Link href="/hrm/roles">
            <Button variant="ghost" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Roles
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold leading-snug">
                Create New Role
              </h1>
              <p className="text-sm text-muted-foreground leading-tight">
                Define permissions and access levels for your team members
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Basic Info */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px] space-y-1">
                  <Label htmlFor="name" className="text-base">
                    Role Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Sales Manager, Store Admin"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
                <div className="flex-1 min-w-[250px] space-y-1">
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the responsibilities..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Accordion */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissions & Access</CardTitle>
                  <CardDescription>
                    Select features and specific permissions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 ring-1 ring-primary/20">
                  <span className="text-sm font-medium text-muted-foreground">
                    Selected:
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {selectedCount}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {features.length}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Accordion for each feature */}
              <Accordion type="single" collapsible className="space-y-3">
                {features.map((feature, featureIndex) => {
                  const Icon = feature.icon;
                  const allOptionsChecked =
                    feature.feature_options.length > 0 &&
                    feature.feature_options.every((opt) => opt.status);
                  return (
                    <AccordionItem key={feature.name} value={feature.name} className="border rounded-md overflow-hidden bg-white">
                      <div className="flex items-stretch bg-muted/20 hover:bg-muted/40 transition-colors">
                        {/* Checkbox section (outside the trigger) */}
                        <div className="flex items-center gap-3 px-4 py-3 relative z-10 w-full sm:w-auto">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${feature.status
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`feature-${featureIndex}`}
                              checked={feature.status}
                              onCheckedChange={() =>
                                handleFeatureToggle(featureIndex)
                              }
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor={`feature-${featureIndex}`}
                              className="font-semibold cursor-pointer text-base"
                            >
                              {feature.name}
                            </Label>
                          </div>
                        </div>

                        {/* Accordion Trigger (expands the remaining space) */}
                        <div className="flex-1 flex justify-end min-w-16">
                          <AccordionTrigger className="w-full flex justify-end h-full px-4 hover:no-underline [&[data-state=open]>svg]:text-primary focus:outline-none">
                            {feature.status && (
                              <span className="text-xs text-primary font-medium mr-4">
                                {feature.feature_options.filter((o) => o.status)
                                  .length || 0}{" "}
                                enabled
                              </span>
                            )}
                          </AccordionTrigger>
                        </div>
                      </div>

                      <AccordionContent>
                        {feature.feature_options.length > 0 && (
                          <div className="mt-3 px-1 pb-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Permissions
                              </h4>
                              {feature.feature_options.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSelectAllOptions(featureIndex)
                                  }
                                  className="h-6 text-xs"
                                  disabled={!feature.status}
                                >
                                  {allOptionsChecked
                                    ? "Deselect All"
                                    : "Select All"}
                                </Button>
                              )}
                            </div>

                            {/* Side‑by‑side grid */}
                            <div className="flex flex-wrap gap-2">
                              {feature.feature_options.map(
                                (option, optionIndex) => (
                                  <div
                                    key={option.name}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors border ${option.status
                                        ? "border-primary bg-primary/10"
                                        : "border-transparent hover:bg-muted/50"
                                      }`}
                                  >
                                    <Checkbox
                                      id={`option-${featureIndex}-${optionIndex}`}
                                      checked={option.status}
                                      onCheckedChange={() =>
                                        handleOptionToggle(
                                          featureIndex,
                                          optionIndex
                                        )
                                      }
                                      disabled={!feature.status}
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor={`option-${featureIndex}-${optionIndex}`}
                                      className={`text-sm cursor-pointer whitespace-nowrap ${!feature.status
                                          ? "text-muted-foreground"
                                          : ""
                                        }`}
                                    >
                                      {option.name}
                                    </Label>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/hrm/roles">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={createRole.isPending || !formData.name.trim()}
              className="gap-2 min-w-32"
            >
              {createRole.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
