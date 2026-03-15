// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { ArrowLeft, Save, Shield, Loader2 } from "lucide-react";
// import { useRole, useUpdateRole } from "@/apiHooks/hooks/useRoleQueries";
// import { rolesFeatures } from "@/app/constants/roles-feature";
// import { cn } from "@/lib/utils";

// export default function EditRolePage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const { data: roleData, isLoading } = useRole(id);
//   const updateRole = useUpdateRole();

//   const [formData, setFormData] = useState({ name: "", description: "" });
//   const [features, setFeatures] = useState([]);

//   /** ✅ Preload role data */
//   useEffect(() => {
//     if (roleData) {
//       setFormData({
//         name: roleData.name,
//         description: roleData.description || "",
//       });

//       // Merge to keep icons consistent
//       const mergedFeatures = rolesFeatures.map((f) => {
//         const existing = roleData.features.find(
//           (r) => r.name.toLowerCase() === f.name.toLowerCase()
//         );
//         if (existing) {
//           return {
//             ...f,
//             id: existing.id,
//             role_id: roleData.id,
//             status: !!existing.status,
//             feature_options: f.feature_options.map((opt) => {
//               const match = existing.feature_options.find(
//                 (eo) => eo.name.toLowerCase() === opt.name.toLowerCase()
//               );
//               return {
//                 ...opt,
//                 id: match?.id,
//                 status: !!match?.status,
//               };
//             }),
//           };
//         } else {
//           return {
//             ...f,
//             role_id: roleData.id,
//             status: false,
//             feature_options: f.feature_options.map((o) => ({
//               ...o,
//               status: false,
//             })),
//           };
//         }
//       });
//       setFeatures(mergedFeatures);
//     }
//   }, [roleData]);

//   /** Input handler */
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   /** ✅ Toggle feature (select all its options) */
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
//             status: newStatus, // select all or deselect all
//           })),
//         };
//       })
//     );
//   };

//   /** ✅ Toggle single option */
//   const handleOptionToggle = (fIdx, oIdx) => {
//     setFeatures((prev) =>
//       prev.map((f, i) => {
//         if (i !== fIdx) return f;
//         const newOptions = f.feature_options.map((opt, j) =>
//           j === oIdx ? { ...opt, status: !opt.status } : opt
//         );
//         const anyChecked = newOptions.some((opt) => opt.status);
//         return { ...f, status: anyChecked, feature_options: newOptions };
//       })
//     );
//   };

//   /** ✅ Submit form */
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.name.trim()) return;

//     const payload = {
//       id: roleData.id,
//       name: formData.name,
//       description: formData.description,
//       features,
//     };

//     updateRole.mutate(payload, {
//       onSuccess: () => router.push("/hrm/roles"),
//     });
//   };

//   const selectedCount = features.filter((f) => f.status).length;

//   /** Loader state */
//   if (isLoading || !roleData)
//     return (
//       <div className="flex h-screen justify-center items-center text-muted-foreground">
//         <Loader2 className="animate-spin h-6 w-6 mr-2" />
//         Loading role data...
//       </div>
//     );

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
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
//               <Shield className="h-5 w-5 text-primary" />
//             </div>
//             <div className="flex-1">
//               <h1 className="text-xl font-semibold leading-snug">
//                 Edit Role – {formData.name}
//               </h1>
//               <p className="text-sm text-muted-foreground">
//                 Update permissions and access controls
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Info */}
//           <Card className="border-2 shadow-sm">
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//               <CardDescription>Modify role details</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="name" className="text-base">
//                     Role Name <span className="text-destructive">*</span>
//                   </Label>
//                   <Input
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="e.g., Sales Manager"
//                     className="h-11"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="description" className="text-base">
//                     Description
//                   </Label>
//                   <Textarea
//                     id="description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows={3}
//                     className="resize-none"
//                     placeholder="Describe this role..."
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Permissions */}
//           <Card className="border-2 shadow-sm">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle>Permissions & Access</CardTitle>
//                 <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
//                   <span className="text-sm font-medium">
//                     Selected: {selectedCount}/{features.length}
//                   </span>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2">
//                 {features.map((feature, featureIndex) => {
//                   const Icon = feature.icon;
//                   return (
//                     <Card
//                       key={feature.name}
//                       className={cn(
//                         "transition-all border h-fit",
//                         feature.status
//                           ? "border-primary bg-primary/5"
//                           : "border-border hover:border-primary/40"
//                       )}
//                     >
//                       <CardContent className="p-4">
//                         {/* Feature header */}
//                         <div className="flex items-start gap-3 mb-3">
//                           <div
//                             className={cn(
//                               "flex h-10 w-10 items-center justify-center rounded-lg",
//                               feature.status
//                                 ? "bg-primary text-primary-foreground"
//                                 : "bg-muted text-muted-foreground"
//                             )}
//                           >
//                             <Icon className="h-5 w-5" />
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <Checkbox
//                                 checked={feature.status}
//                                 onCheckedChange={() =>
//                                   handleFeatureToggle(featureIndex)
//                                 }
//                                 id={`feature-${featureIndex}`}
//                               />
//                               <Label
//                                 htmlFor={`feature-${featureIndex}`}
//                                 className="font-semibold cursor-pointer"
//                               >
//                                 {feature.name}
//                               </Label>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Feature Options */}
//                         {feature.feature_options.length > 0 && (
//                           <>
//                             <Separator className="mb-2" />
//                             <div className="space-y-2">
//                               <div className="text-xs uppercase font-medium text-muted-foreground tracking-wide mb-2">
//                                 Permissions
//                               </div>
//                               <div className="space-y-2">
//                                 {feature.feature_options.map(
//                                   (option, optionIndex) => (
//                                     <div
//                                       key={option.name}
//                                       className={cn(
//                                         "flex items-center gap-2 rounded-md p-2",
//                                         option.status
//                                           ? "bg-primary/10"
//                                           : "hover:bg-muted/50"
//                                       )}
//                                     >
//                                       <Checkbox
//                                         checked={option.status}
//                                         onCheckedChange={() =>
//                                           handleOptionToggle(
//                                             featureIndex,
//                                             optionIndex
//                                           )
//                                         }
//                                         disabled={!feature.status}
//                                         id={`option-${featureIndex}-${optionIndex}`}
//                                       />
//                                       <Label
//                                         htmlFor={`option-${featureIndex}-${optionIndex}`}
//                                         className={cn(
//                                           "text-sm flex-1 cursor-pointer",
//                                           !feature.status &&
//                                             "text-muted-foreground"
//                                         )}
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

//           {/* Submit Buttons */}
//           <div className="flex justify-end gap-3 pt-4">
//             <Link href="/hrm/roles">
//               <Button variant="outline">Cancel</Button>
//             </Link>

//             <Button
//               type="submit"
//               disabled={updateRole.isPending || !formData.name.trim()}
//               className="gap-2 min-w-32"
//             >
//               {updateRole.isPending ? (
//                 <>
//                   <Loader2 className="animate-spin h-4 w-4" />
//                   Updating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Update Role
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
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Shield, Loader2 } from "lucide-react";
import { useRole, useUpdateRole } from "@/apiHooks/hooks/useRoleQueries";
import { rolesFeatures } from "@/app/constants/roles-feature";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function EditRolePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: roleData, isLoading } = useRole(id);
  const updateRole = useUpdateRole();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [features, setFeatures] = useState([]);

  /** ✅ Preload role data */
  useEffect(() => {
    if (roleData) {
      setFormData({
        name: roleData.name,
        description: roleData.description || "",
      });

      // Merge to keep icons consistent
      const merged = rolesFeatures.map((f) => {
        const existing = roleData.features.find(
          (r) => r.name.toLowerCase() === f.name.toLowerCase()
        );
        if (existing) {
          return {
            ...f,
            id: existing.id,
            role_id: roleData.id,
            status: !!existing.status,
            feature_options: f.feature_options.map((opt) => {
              const match = existing.feature_options.find(
                (eo) => eo.name.toLowerCase() === opt.name.toLowerCase()
              );
              return { ...opt, id: match?.id, status: !!match?.status };
            }),
          };
        } else {
          return {
            ...f,
            role_id: roleData.id,
            status: false,
            feature_options: f.feature_options.map((o) => ({
              ...o,
              status: false,
            })),
          };
        }
      });
      setFeatures(merged);
    }
  }, [roleData]);

  /** Input handler */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** ✅ Toggle feature (select all its options) */
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

  /** ✅ Toggle single option */
  const handleOptionToggle = (fIdx, oIdx) => {
    setFeatures((prev) =>
      prev.map((f, i) => {
        if (i !== fIdx) return f;
        const newOptions = f.feature_options.map((opt, j) =>
          j === oIdx ? { ...opt, status: !opt.status } : opt
        );
        const anyChecked = newOptions.some((opt) => opt.status);
        return { ...f, status: anyChecked, feature_options: newOptions };
      })
    );
  };

  /** ✅ Select All / Deselect All */
  const handleSelectAllOptions = (featureIndex) => {
    setFeatures((prev) =>
      prev.map((f, idx) => {
        if (idx !== featureIndex) return f;
        const allChecked = f.feature_options.every((opt) => opt.status);
        const newOpts = f.feature_options.map((o) => ({
          ...o,
          status: !allChecked,
        }));
        return { ...f, status: !allChecked, feature_options: newOpts };
      })
    );
  };

  /** ✅ Submit form */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const payload = {
      id: roleData.id,
      name: formData.name,
      description: formData.description,
      features,
    };
    updateRole.mutate(payload, { onSuccess: () => router.push("/hrm/roles") });
  };

  const selectedCount = features.filter((f) => f.status).length;

  /** Loader state */
  if (isLoading || !roleData)
    return (
      <div className="flex h-screen justify-center items-center text-muted-foreground">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        Loading role data...
      </div>
    );

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
              <h1 className="text-xl font-semibold leading-snug">
                Edit Role – {formData.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Update permissions and access controls
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Modify role details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-base">
                    Role Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Sales Manager"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="resize-none"
                    placeholder="Describe this role..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Accordion */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permissions & Access</CardTitle>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium">
                    Selected: {selectedCount}/{features.length}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Accordion type="multiple" className="space-y-3">
                {features.map((feature, featureIndex) => {
                  const Icon = feature.icon;
                  const allOptionsChecked =
                    feature.feature_options.length > 0 &&
                    feature.feature_options.every((opt) => opt.status);

                  return (
                    <AccordionItem key={feature.name} value={feature.name} className="border rounded-md overflow-hidden bg-white">
                      <div className="flex items-stretch bg-muted/20 hover:bg-muted/40 transition-colors">
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
                              checked={feature.status}
                              onCheckedChange={() =>
                                handleFeatureToggle(featureIndex)
                              }
                              id={`feature-${featureIndex}`}
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
                                      checked={option.status}
                                      onCheckedChange={() =>
                                        handleOptionToggle(
                                          featureIndex,
                                          optionIndex
                                        )
                                      }
                                      disabled={!feature.status}
                                      id={`option-${featureIndex}-${optionIndex}`}
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/hrm/roles">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={updateRole.isPending || !formData.name.trim()}
              className="gap-2 min-w-32"
            >
              {updateRole.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" /> Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Update Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
