'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, {  useTransition } from 'react'
import { toast } from 'sonner'

// eslint-disable-next-line react/prop-types
export default function AddVendor({ setVendorModal, setSelectedVendor, setOrderSchema }) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (payload) => api.post("/save-vendor", payload),
    onSuccess: (response) => {
      if (response?.data?.success) {
        queryClient.invalidateQueries({ queryKey: ["VendorSearchQuery"] });
        toast.success(response?.data?.message);
        setSelectedVendor({
          label: response?.data?.data?.name,
          value: response?.data?.data?.id,
        });
        setOrderSchema((prev) => ({
          ...prev,
          vendor_name: response?.data?.data?.name,
          vendor_id: response?.data?.data?.id,
        }));
        setVendorModal(false);
      }
    },
  });

  const handleVendor = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      startTransition(async () => {
         await mutateAsync(formData);
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <form onSubmit={handleVendor} className="space-y-3">
      <Input name="email" placeholder="propreitor email" />
      <Input name="name" placeholder="vendor name" />
      <Input name="mobile_number" placeholder="phone number" />
      <Input name="address" placeholder="vendor address" />
      <Button
        disable={isPending ? "true" : undefined}
        type="submit"
        className={`w-full ${
          isPending
            ? "bg-blue-300 hover:bg-blue-300"
            : "bg-blue-500 hover:bg-blue-500"
        }   text-white`}
      >
        {isPending ? "Adding..." : "Add Vendor"}
      </Button>
    </form>
  );
}
