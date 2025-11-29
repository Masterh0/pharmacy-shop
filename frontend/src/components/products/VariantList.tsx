"use client";

import { useState } from "react";
import { useVariants } from "@/lib/hooks/useVariant";
import { ProductVariant } from "@/lib/types/variant";
import { Button, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import VariantModal from "./VariantModal";

interface VariantListProps {
  productId: number;
}

export default function VariantList({ productId }: VariantListProps) {
  const [openModal, setOpenModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  const { data: variants, isLoading, remove } = useVariants(productId);

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <CircularProgress />
      </div>
    );

  return (
    <div className="bg-white border rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">📦 واریانت‌های محصول</h2>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + افزودن واریانت جدید
        </Button>
      </div>

      {(!variants || variants.length === 0) && (
        <p className="text-gray-500 text-sm my-3">
          هیچ واریانتی برای این محصول ثبت نشده است.
        </p>
      )}

      {variants && variants.length > 0 && (
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-right">
                <th className="p-2 border">نوع بسته</th>
                <th className="p-2 border">تعداد در بسته</th>
                <th className="p-2 border">قیمت</th>
                <th className="p-2 border">قیمت تخفیفی</th>
                <th className="p-2 border">موجودی</th>
                <th className="p-2 border">تاریخ انقضا</th>
                <th className="p-2 border w-24">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td className="border p-2">{variant.packageType}</td>
                  <td className="border p-2">{variant.packageQuantity}</td>
                  <td className="border p-2">
                    {typeof variant.price === "string"
                      ? Number(variant.price).toLocaleString("fa-IR")
                      : variant.price.toLocaleString("fa-IR")} تومان
                  </td>
                  <td className="border p-2">
                    {variant.discountPrice
                      ? (typeof variant.discountPrice === "string"
                        ? Number(variant.discountPrice).toLocaleString("fa-IR")
                        : variant.discountPrice.toLocaleString("fa-IR")) + " تومان"
                      : "-"}
                  </td>
                  <td className="border p-2">{variant.stock}</td>
                  <td className="border p-2">
                    {variant.expiryDate
                      ? variant.expiryDate.split("T")[0]
                      : "—"}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEditingVariant(variant);
                        setOpenModal(true);
                      }}
                    >
                      ویرایش
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (
                          confirm(`آیا از حذف "${variant.packageType}" مطمئن هستید؟`)
                        ) {
                          remove.mutate(variant.id, {
                            onSuccess: () =>
                              toast.success("✅ واریانت حذف شد"),
                            onError: () =>
                              toast.error("❌ خطا در حذف واریانت"),
                          });
                        }
                      }}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openModal && (
        <VariantModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingVariant(null);
          }}
          productId={productId}
          editData={editingVariant}
        />
      )}
    </div>
  );
}
