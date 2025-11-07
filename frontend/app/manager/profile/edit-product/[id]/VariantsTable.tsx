"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { variantApi } from "@/lib/api/variantApi";
import { toast } from "react-hot-toast";

export default function VariantsTable({ productId }) {
  const queryClient = useQueryClient();
  const { data: variants } = useQuery({
    queryKey: ["variants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => variantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("ویرایش واریانت موفقیت‌آمیز بود ✅");
    },
    onError: () => toast.error("خطا در ویرایش واریانت ⚠️"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => variantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("واریانت حذف شد 🗑️");
    },
  });

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold text-[#0077B6] mb-4">
        مدیریت واریانت‌ها
      </h3>

      <table className="w-full text-sm border rounded-lg">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-2">شناسه</th>
            <th className="p-2">نوع بسته‌بندی</th>
            <th className="p-2">تعداد بسته</th>
            <th className="p-2">قیمت</th>
            <th className="p-2">قیمت با تخفیف</th>
            <th className="p-2">موجودی</th>
            <th className="p-2">انقضا</th>
            <th className="p-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {variants?.map((v) => (
            <tr key={v.id} className="border-t text-center">
              <td>{v.id}</td>
              <td>{v.packageType}</td>
              <td>{v.packageQuantity}</td>
              <td>{v.price}</td>
              <td>{v.discountPrice}</td>
              <td>{v.stock}</td>
              <td>{v.expiryDate}</td>
              <td className="space-x-2">
                <button
                  onClick={() => deleteMutation.mutate(v.id)}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                >
                  حذف
                </button>
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: v.id,
                      payload: { price: v.price + 1000 },
                    })
                  }
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
                >
                  ویرایش
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
