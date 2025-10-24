"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
  CreateVariantDTO,
  variantSchema,
} from "@/lib/validators/variantSchema";
import { ProductVariant } from "@/lib/types/variant";
import { useVariants } from "@/lib/hooks/useVariant";

interface VariantModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  editData?: ProductVariant | null;
}

export default function VariantModal({
  open,
  onClose,
  productId,
  editData,
}: VariantModalProps) {
  const isEdit = !!editData;
  const { add, update } = useVariants(productId);

  // 🧠 فرم RHF + Zod
  const { register, handleSubmit, reset } = useForm<CreateVariantDTO>({
    resolver: zodResolver(variantSchema),
    defaultValues: editData
      ? {
          packageType: editData.packageType,
          packageQuantity: editData.packageQuantity,
          price: Number(editData.price),
          discountPrice: editData.discountPrice
            ? Number(editData.discountPrice)
            : undefined,
          stock: editData.stock,
          expiryDate: editData.expiryDate
            ? editData.expiryDate.split("T")[0]
            : "",
        }
      : {
          packageType: "",
          packageQuantity: 1,
          price: 0,
          discountPrice: undefined,
          stock: 0,
          expiryDate: "",
        },
  });

  // 🟢 ثبت
  const onSubmit = async (data: CreateVariantDTO) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: editData!.id, ...data });
        toast.success("✅ واریانت با موفقیت ویرایش شد");
      } else {
        await add.mutateAsync({ ...data, productId });
        toast.success("✅ واریانت جدید اضافه شد");
      }

      onClose();
      reset();
    } catch (err) {
      toast.error(
        isEdit ? "❌ خطا در ویرایش واریانت" : "❌ خطا در افزودن واریانت"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "✏️ ویرایش واریانت" : "➕ افزودن واریانت جدید"}
      </DialogTitle>

      <DialogContent className="space-y-4 mt-2">
        {/* نوع بسته */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            نوع بسته‌بندی
          </label>
          <input
            {...register("packageType")}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>

        {/* تعداد در بسته */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            تعداد در بسته
          </label>
          <input
            type="number"
            {...register("packageQuantity", { valueAsNumber: true })}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>

        {/* قیمت */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            قیمت (تومان)
          </label>
          <input
            type="number"
            {...register("price", { valueAsNumber: true })}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>

        {/* قیمت تخفیفی */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            قیمت تخفیفی (اختیاری)
          </label>
          <input
            type="number"
            {...register("discountPrice", { valueAsNumber: true })}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>

        {/* موجودی */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            موجودی انبار
          </label>
          <input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>

        {/* تاریخ انقضا */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            تاریخ انقضا
          </label>
          <input
            type="date"
            {...register("expiryDate")}
            className="border rounded-md w-full px-3 py-2 text-sm"
          />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          {isEdit ? "ثبت تغییرات" : "افزودن"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
