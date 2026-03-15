"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
} from "@/app/store/api/warrantyApi"

// ✅ Schema with correct number handling
const warrantySchema = z.object({
  name: z.string().min(1, "Warranty name is required"),
  warranties_count: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Duration is required")
  ),
})

const WarrantyModal = ({ isOpen, onClose, warranty, mode }) => {
  const [createWarranty, { isLoading: isCreating }] = useCreateWarrantyMutation()
  const [updateWarranty, { isLoading: isUpdating }] = useUpdateWarrantyMutation()

  const form = useForm({
    resolver: zodResolver(warrantySchema),
    defaultValues: {
      name: "",
      warranties_count: 0,
    },
  })

  // Reset form when modal opens/closes or warranty changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && warranty) {
        form.reset({
          name: warranty.name || "",
          warranties_count: Number(warranty.warranties_count) || 0,
        })
      } else {
        form.reset({
          name: "",
          warranties_count: 0,
        })
      }
    }
  }, [isOpen, mode, warranty, form])

  const onSubmit = async (data) => {
    try {
      if (mode === "edit" && warranty?.id) {
        await updateWarranty({
          id: warranty.id,
          ...data,
        }).unwrap()
        toast.success("Warranty updated successfully!")
      } else {
        await createWarranty({ ...data }).unwrap()
        toast.success("Warranty created successfully!")
      }
      onClose()
      form.reset()
    } catch (error) {
      toast.error(
        error?.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} warranty`
      )
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Warranty" : "Add New Warranty"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the warranty information below."
              : "Fill in the details to create a new warranty."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter warranty name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warranties_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranties Count *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter duration"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                    ? "Update Warranty"
                    : "Create Warranty"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default WarrantyModal
