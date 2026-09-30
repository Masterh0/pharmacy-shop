"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attributeApi } from "@/lib/api/attributeApi";
import { toast } from "sonner";

interface Props {
  open: boolean;
  attributeId: number | null;
  attributeName?: string;
  onClose: () => void;
}

export default function DeleteAttributeDialog({
  open,
  attributeId,
  attributeName,
  onClose,
}: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => attributeApi.remove(attributeId!),

    onSuccess: () => {
      toast.success("ویژگی حذف شد");

      queryClient.invalidateQueries({
        queryKey: ["attributes"],
      });

      onClose();
    },

    onError: () => {
      toast.error("حذف انجام نشد");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[380px]">

        <h2 className="font-bold text-lg">
          حذف ویژگی
        </h2>

        <p className="mt-4">
          آیا از حذف
          <span className="font-bold px-1">
            {attributeName}
          </span>
          مطمئن هستید؟
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            انصراف
          </button>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            حذف
          </button>

        </div>

      </div>

    </div>
  );
}