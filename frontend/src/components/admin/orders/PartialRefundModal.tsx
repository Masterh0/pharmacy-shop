"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types/order";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PartialRefundModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { amount: number; note?: string }) => Promise<void>;
}

export default function PartialRefundModal({
  order,
  isOpen,
  onClose,
  onSubmit,
}: PartialRefundModalProps) {
  const maxRefundable =
    order.finalTotal - (order.refundedAmount ?? 0);

  const [amount, setAmount] = useState<number>(maxRefundable);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(maxRefundable);
      setNote("");
      setError(null);
    }
  }, [isOpen, maxRefundable]);

  if (!isOpen) return null;

  const validate = () => {
    if (!amount || amount <= 0) {
      setError("مبلغ ریفاند باید بیشتر از صفر باشد");
      return false;
    }
    if (amount > maxRefundable) {
      setError("مبلغ ریفاند بیشتر از مقدار قابل ریفاند است");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ amount, note });
      toast.success("ریفاند با موفقیت ثبت شد");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "خطا در ثبت ریفاند");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fa-IR").format(price) + " تومان";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            ریفاند سفارش #{order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X />
          </button>
        </div>

        {/* Info */}
        <div className="text-sm bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between">
            <span>مبلغ کل سفارش:</span>
            <span className="font-medium">
              {formatPrice(order.finalTotal)}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>ریفاند شده:</span>
            <span className="font-medium text-blue-600">
              {formatPrice(order.refundedAmount ?? 0)}
            </span>
          </div>
          <div className="flex justify-between mt-1 border-t pt-1">
            <span>حداکثر قابل ریفاند:</span>
            <span className="font-bold text-green-600">
              {formatPrice(maxRefundable)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            مبلغ ریفاند (تومان)
          </label>
          <input
            type="number"
            value={amount}
            min={1}
            max={maxRefundable}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Note */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            توضیح (اختیاری)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="دلیل ریفاند..."
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-2">{error}</div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            انصراف
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 className="animate-spin" size={16} />
            )}
            ثبت ریفاند
          </button>
        </div>
      </div>
    </div>
  );
}
