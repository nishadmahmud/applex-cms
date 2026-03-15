"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, FileText } from "lucide-react";
import ProfileSection from "../../ProfileSection";
import {
  useDeleteTermsMutation,
  useGetTermsQuery,
  useSaveTermsMutation,
} from "@/app/store/api/termsConditions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TermsConditionsForm() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const [sections, setSections] = useState([
    {
      id: 1,
      description: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessTermsCondition =
    !isEmployee || canAccess(features, "Settings", "T & C");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessTermsCondition;

  const [saveTerms] = useSaveTermsMutation();
  const { data: terms } = useGetTermsQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });
  const [deleteTerms] = useDeleteTermsMutation();
  const [selectedId, setSelectedId] = useState("");
  console.log(terms);

  useEffect(() => {
    if (terms?.data?.length) {
      setSections(terms?.data);
    }
  }, [terms?.data]);

  const addSection = () => {
    const newId = Math.max(...sections.map((s) => s.id)) + 1;
    setSections([
      ...sections,
      {
        id: newId,
        description: "",
      },
    ]);
  };

  const updateSection = (id, description) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, description } : section
      )
    );
  };

  const deleteSection = (id) => {
    setSelectedId(id);
    if (sections.length > 1) {
      setSections(sections.filter((section) => section.id !== id));
    }
  };

  const handleSave = async () => {
    if (terms?.data?.length > sections.length) {
      const res = await deleteTerms({ id: selectedId }).unwrap();
      if (res.success) {
        toast.success("Deleted successfully");
      } else {
        toast.error("error occured try again");
      }
      return;
    }
    const res = await saveTerms({ descriptions: sections }).unwrap();
    if (res.success) {
      toast.success("Terms & Condition has been created succssfully");
    } else {
      toast.error("Failed to create");
    }
  };

  const visibleSections = sections.filter((s) => s.isVisible).length;
  const totalSections = sections.length;

  console.log(sections);

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"T & C"}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <ProfileSection />
        <div className="max-w-4xl mx-auto space-y-6 mt-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">
                Terms & Conditions
              </h1>
            </div>
            <p className="text-slate-600 text-base">
              Manage your terms and conditions content
            </p>
          </div>

          {/* Statistics */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    {visibleSections} Active
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-300">
                    {totalSections} Total
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card
                key={section.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                      >
                        {section.id}
                      </Badge>
                      <span className="text-lg font-semibold text-slate-700">
                        Section {section.id}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {sections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Textarea
                      value={section.description}
                      onChange={(e) =>
                        updateSection(section.id, e.target.value)
                      }
                      placeholder="Enter terms and conditions content..."
                      className="min-h-[120px] resize-none border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>
                        {section?.description?.length || 0} characters
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Section Button */}
          <Card className="border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
              <Button
                onClick={addSection}
                variant="ghost"
                className="w-full h-16 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Section
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
