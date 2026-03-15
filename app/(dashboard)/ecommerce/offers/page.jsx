"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, FileText, ArrowLeft } from "lucide-react";


import { OfferForm } from "./offer-form";
import { OfferListItem } from "./offer-list";
import { useCreateOffer, useDeleteoffer, useOffers, useUpdateoffer } from "@/apiHooks/hooks/useOffersQuery";

export default function OffersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list"); // list | create | edit
  const [selectedOffer, setSelectedOffer] = useState(null);

  const { data, isLoading, error } = useOffers();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateoffer();
  const deleteOffer = useDeleteoffer();

  const offers = data?.data || [];

  /* =======================
     SEARCH FILTER
  ======================= */
  const filteredOffers = offers.filter(
    (offer) =>
      offer?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =======================
     HANDLERS
  ======================= */
  const handleCreateOffer = async (payload) => {
    try {
      await createOffer.mutateAsync(payload);
      setCurrentView("list");
    } catch (err) {
      console.error("Create offer error:", err);
    }
  };

  const handleUpdateOffer = async (payload) => {
    if (!selectedOffer) return;

    try {
      await updateOffer.mutateAsync({
        id: selectedOffer.id,
        data: payload,
      });
      setSelectedOffer(null);
      setCurrentView("list");
    } catch (err) {
      console.error("Update offer error:", err);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await deleteOffer.mutateAsync(id);
    } catch (err) {
      console.error("Delete offer error:", err);
    }
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setCurrentView("edit");
  };

  const handleCreateClick = () => {
    setSelectedOffer(null);
    setCurrentView("create");
  };

  const handleBackToList = () => {
    setSelectedOffer(null);
    setCurrentView("list");
  };

  /* =======================
     ERROR STATE
  ======================= */
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center text-destructive">
            Failed to load offers. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================
     CREATE / EDIT VIEW
  ======================= */
  if (currentView === "create" || currentView === "edit") {
    const isEdit = currentView === "edit";

    return (
      <div className="container mx-auto py-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEdit ? "Edit Offer" : "Create New Offer"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit
                ? `Update offer: "${selectedOffer?.title}"`
                : "Create a promotional offer"}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="gap-2 bg-gray-100 hover:bg-gray-200 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Offers
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <OfferForm
              offer={isEdit ? selectedOffer : undefined}
              onSubmit={isEdit ? handleUpdateOffer : handleCreateOffer}
              isLoading={
                isEdit ? updateOffer.isPending : createOffer.isPending
              }
              submitLabel={isEdit ? "Update Offer" : "Create Offer"}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================
     LIST VIEW
  ======================= */
  return (
    <div className="container mx-auto py-1 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Offer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional offers and campaigns
          </p>
        </div>

        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Offers ({filteredOffers.length})</CardTitle>

            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No offers found matching your search."
                  : "No offers created yet."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleCreateClick}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Offer
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_120px] gap-2 py-3 border-b-2 text-sm font-semibold text-muted-foreground">
                <div>Sl.</div>
                <div>Title</div>
                <div>Slug</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {filteredOffers.map((offer, index) => (
                <OfferListItem
                  key={offer.id}
                  index={index + 1}
                  offer={offer}
                  onEdit={handleEditOffer}
                  onDelete={handleDeleteOffer}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
