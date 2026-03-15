"use client";
import { React, useState } from "react";
import { FiEdit, FiTrash, FiEye, FiTruck } from "react-icons/fi";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import { toast } from "sonner";
import { useDeleteOrderMutation } from "@/app/store/api/ecommerceOrderListApi";
import DeliveryModal from "./delivery-modal";
import OrderDetailsModal from "./order-details-modal";
import { useRouter } from "next/navigation";

export default function OrderRowMenu({ order, onDeleted }) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);
  const [deleteOrder, { isLoading }] = useDeleteOrderMutation();
  const router = useRouter();

  async function handleDelete() {
    try {
      const raw = await deleteOrder(order.id);
      const res = raw?.data;
      if (res?.success) {
        toast.success(res?.message || "Order deleted successfully.");
        await onDeleted?.();
      } else {
        toast.error(res?.message || "Failed to delete order.");
      }
    } catch {
      toast.error("Network or server error.");
    }
  }

  function handleEditClick(invoiceId) {
    router.push(`/invoice/edit/${invoiceId}`);
  }

  return (
    <>
      <div className="flex gap-3 items-center text-lg">
        <button
          title="ViewDetails"
          onClick={() => setOpenView(true)}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <FiEye />
        </button>

        <button
          title="Edit"
          onClick={() => handleEditClick(order.invoice_id)}
          className="text-green-500 hover:text-green-700 transition"
        >
          <FiEdit />
        </button>

        <button
          title="Delivery"
          onClick={() => setOpenDelivery(true)}
          className="text-orange-500 hover:text-orange-700 transition"
        >
          <FiTruck />
        </button>

        {/* <button
          title="Delete"
          disabled={isLoading}
          onClick={() => setOpenDelete(true)}
          className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
        >
          <FiTrash />
        </button> */}
      </div>

      {/* delete confirmation */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />

      {/* order details popup */}
      <OrderDetailsModal
        open={openView}
        onClose={() => setOpenView(false)}
        order={order}
      />

      {/* delivery popup (coming soon) */}
      <DeliveryModal
        open={openDelivery}
        onClose={() => setOpenDelivery(false)}
        order={order}
      />
    </>
  );
}
