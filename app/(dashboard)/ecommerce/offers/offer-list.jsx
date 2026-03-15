/* eslint-disable react/prop-types */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

export function OfferListItem({ index, offer, onEdit, onDelete }) {
  const isBranded = Boolean(offer.brand_id);

  return (
    <div className="grid grid-cols-[40px_60px_1fr_1fr_1fr_120px] gap-2 py-3 border-b items-center text-sm">
      {/* SL */}
      <div>{index}</div>

      {/* IMAGE */}
      <div>
        {offer.image ? (
          <img
            src={offer.image}
            alt={offer.title}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs">
            N/A
          </div>
        )}
      </div>

      {/* TITLE */}
      <div className="font-medium truncate">
        {offer.title}
      </div>

      {/* BRAND / URL */}
      <div className="text-muted-foreground truncate flex items-center gap-1">
        {offer.url ? (
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            Visit
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : offer.brand_id ? (
          `Brand ID: ${offer.brand_id}`
        ) : (
          "-"
        )}
      </div>

      {/* STATUS */}
      <div>
        <Badge variant={isBranded ? "default" : "secondary"}>
          {isBranded ? "Brand Offer" : "General Offer"}
        </Badge>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onEdit(offer)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(offer.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
