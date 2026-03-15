"use client";
import { Button } from "@/components/ui/button";
import { deleteCampaign } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function DeleteCampaignAction({id}) {
  const handleDelete = async (id) => {
    toast("Delete?", {
      description: () => (
        <div>
          <p className="text-lg">Are you sure?</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={async () => {
                const res = await deleteCampaign(id);
                if(res.success){
                    toast.success(res.message);
                }else{
                  toast.error('something went wrong');
                }
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => toast.dismiss()}
            >
              No
            </button>
          </div>
        </div>
      ),
      duration: Infinity,
    });
  };
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleDelete(id)}
      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete campaign</span>
    </Button>
  );
}
