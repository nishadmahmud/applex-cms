"use client"
import { Button } from "@/components/ui/button"
import { useDeletePaymentTypeMutation } from "@/app/store/api/paymentApi"
import { toast } from "sonner"

export default function DeleteInterface({ open, method, onClose }) {
  const [deletePaymentType,{isLoading}] = useDeletePaymentTypeMutation();

  if (!method) return null

  const handleDelete = async (id) => {
    const res = await deletePaymentType({paymenttypeId : id}).unwrap();
    if(res?.success){
        toast.success('Deleted Successfully');
    }else{
        toast.error('Failed to delete');
    }
    onClose();
  }

  return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div
              className={`w-10 h-10 bg-[#EC4899] rounded-lg flex items-center justify-center text-white font-bold`}
            >
              {method?.icon_letter}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{method?.type_name}</p>
              <p className="text-sm text-slate-600">{method?.type_name === 'Cash' ? 'Physical' : 'Bank'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-700">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </p>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ All transactions using this payment method will be affected.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => handleDelete(method.id)} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Method"
              )}
            </Button>
          </div>
        </div>
  )
}
