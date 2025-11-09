"use client";
import React, { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import Select from "react-select";
import { toast } from "sonner";
import { variantApi } from "@/lib/api/variantApi";
import { packageTypeOptions } from "@/src/constants/productOptions";

export default function VariantsManager({ productId }) {
  const queryClient = useQueryClient();

  // 🧩 گرفتن واریانت‌ها از سرور
  const { data: variants, isLoading } = useQuery({
    queryKey: ["variants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
  });

  // ✏️ فرم RHF
  const methods = useForm({ defaultValues: { variants: [] } });
  const { control, register, handleSubmit, getValues } = methods;
  const { fields, append, remove, replace } = useFieldArray({
    name: "variants",
    control,
  });

  // 📦 Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => variantApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("✅ واریانت جدید اضافه شد");
    },
    onError: (e) => toast.error("⚠️ خطا در افزودن واریانت"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => variantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("✏️ تغییرات واریانت ذخیره شد");
    },
    onError: () => toast.error("❌ خطا در بروزرسانی واریانت"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => variantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("🗑️ واریانت از دیتابیس حذف شد");
    },
    onError: () => toast.error("⚠️ خطا در حذف واریانت"),
  });

  // 🔄 Sync سرور با فرم
  useEffect(() => {
    if (variants) {
      replace(
        variants.map((v) => ({
          dbId: v.id,
          packageType: v.packageType || "",
          packageQuantity: v.packageQuantity ?? 1,
          price: v.price ?? 0,
          discountPrice: v.discountPrice ?? 0,
          stock: v.stock ?? 0,
          expiryDate: v.expiryDate?.slice(0, 10) || "",
          flavor: v.flavor ?? "",
        }))
      );
    }
  }, [variants, replace]);

  // 🚀 افزودن واریانت جدید
  const handleAddVariant = () => {
    append({
      packageType: "",
      packageQuantity: 1,
      price: 0,
      discountPrice: 0,
      stock: 0,
      expiryDate: "",
      flavor: "",
    });
  };

  // 🧾 ثبت کل واریانت‌ها (در صورت نیاز)
  const onSubmitAll = async (data) => {
    for (const variant of data.variants) {
      const payload = { productId, ...variant };
      await createMutation.mutateAsync(payload);
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500">در حال بارگذاری...</div>;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmitAll)}
        dir="rtl"
        className="mt-8 border-t pt-6 flex flex-col gap-8"
      >
        <h3 className="text-[16px] font-semibold text-[#0077B6] mb-2">
          📦 مدیریت واریانت‌ها
        </h3>

        {fields.map((field, i) => (
          <div
            key={field.id}
            className="border border-[#D6D6D6] bg-gray-50 rounded-[12px] p-5 flex flex-col gap-5"
          >
            <h4 className="font-semibold text-[#0077B6] text-[15px]">
              {field.dbId ? `ویرایش واریانت #${i + 1}` : "واریانت جدید"}
            </h4>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {/* 🔹 فیلد طعم */}
              <FormField label="طعم">
                <input
                  {...register(`variants.${i}.flavor`)}
                  placeholder="مثلاً شکلاتی، وانیلی..."
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>

              {/* نوع بسته‌بندی */}
              <FormField label="نوع بسته‌بندی">
                <Controller
                  name={`variants.${i}.packageType`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={packageTypeOptions}
                      value={packageTypeOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(opt) => field.onChange(opt?.value || "")}
                      placeholder="انتخاب نوع بسته"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "40px",
                          borderRadius: "8px",
                          borderColor: "#D6D6D6",
                        }),
                      }}
                    />
                  )}
                />
              </FormField>

              <FormField label="تعداد در بسته">
                <input
                  type="number"
                  {...register(`variants.${i}.packageQuantity`, { valueAsNumber: true })}
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>

              <FormField label="قیمت (تومان)">
                <input
                  type="number"
                  {...register(`variants.${i}.price`, { valueAsNumber: true })}
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>

              <FormField label="قیمت با تخفیف (تومان)">
                <input
                  type="number"
                  {...register(`variants.${i}.discountPrice`, { valueAsNumber: true })}
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>

              <FormField label="موجودی">
                <input
                  type="number"
                  {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>

              <FormField label="تاریخ انقضا">
                <input
                  type="date"
                  {...register(`variants.${i}.expiryDate`)}
                  className="border border-[#D6D6D6] rounded-[8px] h-[40px] px-3 text-[13px]"
                />
              </FormField>
            </div>

            {/* 🔘 دکمه‌های هر واریانت */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-gray-500 text-sm hover:underline"
                >
                  🔙 بستن فرم واریانت
                </button>

                {field.dbId && (
                  <button
                    type="button"
                    onClick={() => {
                      const dbId = Number(field.dbId);
                      toast.warning("در حال حذف واریانت از دیتابیس...");
                      deleteMutation.mutate(dbId);
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    🗑 حذف واریانت از دیتابیس
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const payload = getValues(`variants.${i}`);
                  const dbId = field.dbId ? Number(field.dbId) : null;
                  dbId
                    ? updateMutation.mutate({ id: dbId, payload })
                    : createMutation.mutate({ productId, ...payload });
                }}
                className="bg-[#00B4D8] hover:bg-[#009DC1] text-white text-[13px] px-6 py-2 rounded-[8px]"
              >
                {field.dbId ? "ثبت تغییرات" : "ثبت واریانت"}
              </button>
            </div>
          </div>
        ))}

        {/* افزودن واریانت جدید */}
        <button
          type="button"
          onClick={handleAddVariant}
          className="text-[#0077B6] text-[14px] hover:underline mt-3 self-end"
        >
          + افزودن واریانت جدید
        </button>

        {/* ثبت کلی فرم */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-[#0077B6] hover:bg-[#009DC1] text-white text-[14px] font-medium px-8 py-2 rounded-[8px]"
          >
            ثبت تمام واریانت‌ها
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

/* ✅ کامپوننت فیلد عمومی */
function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
