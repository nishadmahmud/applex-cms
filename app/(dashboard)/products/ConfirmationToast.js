import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationToast = ({ message, onConfirm, onCancel, confirmLabel = 'Yes', cancelLabel = 'No' }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px]">
            {/* Header with close button */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Confirm Action</h3>
                </div>
                <button 
                    onClick={() => {
                        onCancel?.();
                        toast.dismiss();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Message */}
            <div className="mb-4 pl-8">
                <p className="text-sm text-gray-700">{message}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end z-[999999999]">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        onCancel?.();
                        toast.dismiss();
                    }}
                    className="px-4"
                >
                    {cancelLabel}
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                        onConfirm?.();
                        toast.dismiss();
                    }}
                    className="px-4 z-[999]"
                >
                    {confirmLabel}
                </Button>
            </div>
        </div>
    );
};

export const confirmationToast = (message, options = {}) => {
    return toast.custom((t) => (
        <ConfirmationToast
            message={message}
            onConfirm={options.action?.onClick}
            onCancel={options.cancel?.onClick}
            confirmLabel={options.action?.label}
            cancelLabel={options.cancel?.label}
        />
    ), {
        duration: Infinity,
        style : {zIndex : 9999}
    });
};