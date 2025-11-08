"use client";
import React from "react";
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm, useFieldArray, FormProvider, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "sonner";
import { variantApi } from "@/lib/api/variantApi";
import { packageTypeOptions } from "@/src/constants/productOptions";

export default function VariantsManager({ productId }) {
  const queryClient = useQueryClient();

  /* 🧩 گرفتن واریانت‌ها از سرور */
  const { data: variants, isLoading } = useQuery({
    queryKey: ["variants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
  });

  /* 🧠 فرم RHF */
  const methods = useForm({
    defaultValues: { variants: [] },
  });

  const { control, handleSubmit } = methods;
  const { fields, append, remove, replace } = useFieldArray({
    name: "variants",
    control,
  });

  /* 📦 Mutationها */
  const createMutation = useMutation({
    mutationFn: (payload) => {
      console.log("➡️ [API CREATE] داده‌ی نهایی قبل از ارسال:", payload);
      return variantApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("واریانت با موفقیت افزوده شد ✅");
    },
    onError: (e) => {
      console.error("❌ [API CREATE ERROR]:", e);
      toast.error("خطا در افزودن واریانت ⚠️");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => {
      console.log("✏️ [API UPDATE] شناسه واریانت:", id);
      console.log("📦 [API UPDATE] داده‌ی ارسال‌شده:", payload);
      return variantApi.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("ویرایش انجام شد ✅");
    },
    onError: (e) => {
      console.error("❌ [API UPDATE ERROR]:", e);
      toast.error("خطا در ویرایش ⚠️");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log("🗑️ [API DELETE] حذف واریانت با شناسه:", id);
      return variantApi.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      toast.success("واریانت حذف شد 🗑️");
    },
    onError: (e) => {
      console.error("❌ [API DELETE ERROR]:", e);
      toast.error(e.response?.data?.message || "خطا در حذف واریانت ❌");
    },
  });

  /* 🔄 Sync داده‌های سرور با فرم RHF */
  React.useEffect(() => {
    if (variants) {
      console.log("🔄 [Sync] داده‌های دریافتی از سرور:", variants);
      replace(
        variants.map((v) => ({
          dbId: v.id, // ✅ شناسه واقعی از دیتابیس
          packageType: v.packageType || "",
          packageQuantity: v.packageQuantity ?? 1,
          price: v.price ?? 0,
          discountPrice: v.discountPrice ?? 0,
          stock: v.stock ?? 0,
          expiryDate: v.expiryDate?.slice(0, 10) || "",
        }))
      );
    }
  }, [variants, replace]);

  /* 🚀 افزودن واریانت جدید */
  const onSubmit = async (data) => {
    console.log("🚀 [FORM SUBMIT] کل داده فرم:", data);
    for (const v of data.variants) {
      const payload = { productId, ...v };
      console.log("➡️ [CREATE MUTATION EXEC] داده هر واریانت:", payload);
      await createMutation.mutateAsync(payload);
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500">در حال بارگذاری...</div>;

  /* 🖥️ رندر فرم */
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
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

              {/* تعداد در بسته */}
              <FormField label="تعداد در بسته">
                <input
                  type="number"
                  {...methods.register(`variants.${i}.packageQuantity`, {
                    valueAsNumber: true,
                  })}
                  className="h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                />
              </FormField>

              {/* قیمت */}
              <FormField label="قیمت (تومان)">
                <input
                  type="number"
                  {...methods.register(`variants.${i}.price`, { valueAsNumber: true })}
                  className="h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                />
              </FormField>

              {/* قیمت با تخفیف */}
              <FormField label="قیمت با تخفیف (تومان)">
                <input
                  type="number"
                  {...methods.register(`variants.${i}.discountPrice`, {
                    valueAsNumber: true,
                  })}
                  className="h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                />
              </FormField>

              {/* موجودی */}
              <FormField label="موجودی">
                <input
                  type="number"
                  {...methods.register(`variants.${i}.stock`, {
                    valueAsNumber: true,
                  })}
                  className="h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                />
              </FormField>

              {/* تاریخ انقضا */}
              <FormField label="تاریخ انقضا">
                <input
                  type="date"
                  {...methods.register(`variants.${i}.expiryDate`)}
                  className="h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              {field.dbId && (
                <>
                  {/* دکمه ذخیره تغییرات */}
                  <button
                    type="button"
                    onClick={() => {
                      const payload = methods.getValues(`variants.${i}`);
                      const dbId = Number(field.dbId);
                      console.log("✏️ [UPDATE CLICK] شناسه واقعی:", dbId);
                      console.log("📦 داده برای آپدیت:", payload);
                      updateMutation.mutate({ id: dbId, payload });
                    }}
                    className="bg-[#00B4D8] text-white text-sm px-5 py-2 rounded-[8px] hover:bg-[#0099c0]"
                  >
                    ذخیره تغییرات
                  </button>

                  {/* دکمه حذف */}
                  <button
                    type="button"
                    onClick={() => {
                      const dbId = Number(field.dbId);
                      console.log("🗑️ [DELETE CLICK] شناسه واقعی:", dbId);
                      if (fields.length <= 1) {
                        toast.error("محصول باید حداقل یک واریانت داشته باشد ❌");
                        return;
                      }
                      deleteMutation.mutate(dbId);
                    }}
                    className="text-red-500 text-sm underline hover:text-red-600"
                  >
                    حذف واریانت
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* افزودن جدید */}
        <button
          type="button"
          onClick={() => {
            console.log("➕ [ADD CLICK] افزودن واریانت جدید به فرم");
            append({
              packageType: "",
              packageQuantity: 1,
              price: 0,
              discountPrice: 0,
              stock: 0,
              expiryDate: "",
            });
          }}
          className="text-[#00B4D8] text-[14px] hover:underline"
        >
          + افزودن واریانت جدید
        </button>

        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-[#00B4D8] hover:bg-[#0099c0] text-white text-[14px] font-medium px-8 py-2 rounded-[8px]"
          >
            {createMutation.isPending ? "در حال ارسال..." : "ثبت واریانت جدید"}
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
