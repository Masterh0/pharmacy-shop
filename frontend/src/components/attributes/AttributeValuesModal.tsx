"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { attributeApi, Attribute } from "@/lib/api/attributeApi";

interface Props {
  open: boolean;
  onClose: () => void;
  attribute: Attribute | null;
}

export default function AttributeValuesModal({
  open,
  onClose,
  attribute,
}: Props) {
  const queryClient = useQueryClient();

  const [value, setValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["attribute-values", attribute?.id],
    queryFn: () => attributeApi.listValues(attribute!.id),
    enabled: !!attribute && open,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      attributeApi.createValue(attribute!.id, {
        value,
      }),

    onSuccess: () => {
      toast.success("مقدار اضافه شد");

      setValue("");

      queryClient.invalidateQueries({
        queryKey: ["attribute-values", attribute?.id],
      });
    },

    onError: () => {
      toast.error("خطا");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attributeApi.removeValue(id),

    onSuccess: () => {
      toast.success("حذف شد");

      queryClient.invalidateQueries({
        queryKey: ["attribute-values", attribute?.id],
      });
    },
  });

  if (!open || !attribute) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[650px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            مقادیر ویژگی
            <span className="mr-2 text-sky-500">{attribute.name}</span>
          </h2>

          <button onClick={onClose} className="text-red-500">
            ✕
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="مثلاً شکلاتی"
            className="border rounded-lg h-11 flex-1 px-3"
          />

          <button
            onClick={() => createMutation.mutate()}
            disabled={!value || createMutation.isPending}
            className="bg-sky-500 text-white rounded-lg px-5"
          >
            افزودن
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">در حال دریافت...</div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-auto">
            {data?.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <span>{item.value}</span>

                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="text-red-500 text-sm"
                >
                  حذف
                </button>
              </div>
            ))}

            {!data?.length && (
              <div className="text-center text-gray-400 py-10">
                مقداری ثبت نشده است.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
