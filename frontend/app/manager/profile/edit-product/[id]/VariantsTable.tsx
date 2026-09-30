"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import Select from "react-select";
import { toast } from "sonner";
import { variantApi } from "@/lib/api/variantApi";
import { MultiImageUploader } from "@/src/components/inputs/MultiImageUploader";
import api from "@/lib/axios";
import { numberToPersianText } from "@/lib/utils/numberToText";

// ✅ Type Definitions
interface VariantFormData {
  dbId?: number;
  packageType: string;
  packageQuantity: number;
  price: number;
  discountPrice: number | null;
  stock: number;
  expiryDate: string;
  images: File[];
  existingImages: string[];
  deletedImages: string[];
}

interface VariantsManagerProps {
  productId: number;
}

export default function VariantsManager({ productId }: VariantsManagerProps) {
  const queryClient = useQueryClient();
  const [priceTexts, setPriceTexts] = useState<string[]>([]);
  const [discountTexts, setDiscountTexts] = useState<string[]>([]);

  // 🧩 گرفتن واریانت‌ها از سرور
  const { data: variants, isLoading } = useQuery({
    queryKey: ["variants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
  });

  // ✏️ فرم RHF
  const methods = useForm<{ variants: VariantFormData[] }>({
    defaultValues: { variants: [] },
  });

  const { control, register, getValues, setValue, watch } = methods;
  const { fields, append, remove, replace } = useFieldArray({
    name: "variants",
    control,
  });

  // 📦 Mutation برای بروزرسانی واریانت
  const updateVariantMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number;
      formData: FormData;
    }) => {
      // ✅ استفاده از axios instance که قبلاً تنظیم شده
      const { data } = await api.put(`/variants/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("✏️ تغییرات واریانت ذخیره شد");
    },
    onError: (error: any) => {
      console.error("❌ خطا در بروزرسانی:", error);
      toast.error(`خطا: ${error.message}`);
    },
  });

  // ➕ Mutation برای ایجاد واریانت جدید
  const createVariantMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/variants", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("✅ واریانت جدید ایجاد شد");
    },
    onError: (error: any) => {
      console.error("❌ خطا در ایجاد:", error);
      toast.error(`خطا: ${error.message}`);
    },
  });

  // 🗑️ Mutation برای حذف واریانت
  const deleteMutation = useMutation({
    mutationFn: (id: number) => variantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("🗑️ واریانت از دیتابیس حذف شد");
    },
    onError: () => toast.error("⚠️ خطا در حذف واریانت"),
  });

  // 🔄 Sync سرور با فرم
  useEffect(() => {
    if (variants) {
      replace(
        variants.map((v: any) => ({
          dbId: v.id,
          packageType: v.packageType || "",
          packageQuantity: v.packageQuantity ?? 1,
          price: Number(v.price) ?? 0,
          discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
          stock: v.stock ?? 0,
          expiryDate: v.expiryDate?.slice(0, 10) || "",
          images: [],
          existingImages:
            v.images?.map((img: any) => img.url).filter(Boolean) || [],
          deletedImages: [],
        })),
      );
      setPriceTexts(
        variants.map((v: any) =>
          v.price ? numberToPersianText(String(v.price)) : "",
        ),
      );
      setDiscountTexts(
        variants.map((v: any) =>
          v.discountPrice ? numberToPersianText(String(v.discountPrice)) : "",
        ),
      );
    }
  }, [variants, replace]);

  // 🚀 افزودن واریانت جدید
  const handleAddVariant = () => {
    append({
      packageType: "",
      packageQuantity: 1,
      price: 0,
      discountPrice: null,
      stock: 0,
      expiryDate: "",
      images: [],
      existingImages: [],
      deletedImages: [],
    });
    setPriceTexts((prev) => [...prev, ""]);
    setDiscountTexts((prev) => [...prev, ""]);
  };

  // 🗑️ حذف تصویر موجود
  const handleRemoveExistingImage = (
    variantIndex: number,
    urlToRemove: string,
  ) => {
    const currentExisting =
      watch(`variants.${variantIndex}.existingImages`) || [];
    const currentDeleted =
      watch(`variants.${variantIndex}.deletedImages`) || [];

    setValue(
      `variants.${variantIndex}.existingImages`,
      currentExisting.filter((url: string) => url !== urlToRemove),
    );

    setValue(`variants.${variantIndex}.deletedImages`, [
      ...currentDeleted,
      urlToRemove,
    ]);

  };

  // 💾 ذخیره واریانت
  // 💾 ذخیره واریانت
  const handleSaveVariant = async (index: number) => {
    try {
      const formData = getValues(`variants.${index}`);
      const variantId = formData.dbId;

      // ✅ ساخت FormData برای ارسال
      const formDataToSend = new FormData();

      // 1️⃣ اضافه کردن فیلدهای معمولی
      formDataToSend.append("productId", productId.toString());
      formDataToSend.append("packageType", formData.packageType);
      formDataToSend.append(
        "packageQuantity",
        formData.packageQuantity.toString(),
      );
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append(
        "discountPrice",
        formData.discountPrice ? formData.discountPrice.toString() : "0",
      );
      formDataToSend.append("stock", formData.stock.toString());

      if (formData.expiryDate) {
        formDataToSend.append("expiryDate", formData.expiryDate);
      }

      // ⭐ 2️⃣ اضافه کردن تصاویر موجود (که حذف نشدن)
      // ✅ این قسمت رو درست کن:
      const remainingExistingImages = formData.existingImages || [];


      if (remainingExistingImages.length > 0) {
        // ✅ فرستادن به صورت JSON array
        formDataToSend.append(
          "existingImages",
          JSON.stringify(remainingExistingImages),
        );
      } else {
        // ✅ اگه هیچی نمونده، یه آرایه خالی بفرست
        formDataToSend.append("existingImages", JSON.stringify([]));
      }

      // 3️⃣ اضافه کردن تصاویر جدید
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }


      // 4️⃣ ارسال به سرور
      if (variantId) {
        // ✏️ بروزرسانی واریانت موجود
        await updateVariantMutation.mutateAsync({
          id: variantId,
          formData: formDataToSend,
        });
      } else {
        // ➕ ایجاد واریانت جدید
        await createVariantMutation.mutateAsync(formDataToSend);
      }

      // 5️⃣ ریست فرم بعد از موفقیت
      setValue(`variants.${index}.images`, []);
      setValue(`variants.${index}.deletedImages`, []);

    } catch (error: any) {
      console.error("❌ خطا در ذخیره واریانت:", error);
      toast.error(error.message || "خطا در ذخیره واریانت");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4D8] mx-auto"></div>
        <p className="text-gray-500 mt-4">در حال بارگذاری واریانت‌ها...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div dir="rtl" className="mt-8 border-t pt-6 flex flex-col gap-8">
        {/* 📋 هدر */}
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[#0077B6]">
            📦 مدیریت واریانت‌ها
          </h3>
          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-[#00B4D8] hover:bg-[#0096C7] text-white px-4 py-2 rounded-[8px] text-[13px] font-medium flex items-center gap-2 transition-all"
          >
            <span className="text-[16px]">+</span>
            افزودن واریانت جدید
          </button>
        </div>

        {/* 📋 لیست واریانت‌ها */}
        {fields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-[12px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-[14px]">
              هنوز واریانتی ثبت نشده است
            </p>
            <button
              type="button"
              onClick={handleAddVariant}
              className="mt-4 text-[#00B4D8] hover:underline text-[13px]"
            >
              اولین واریانت را اضافه کنید
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, i) => (
              <div
                key={field.id}
                className="border-2 border-gray-200 bg-white rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 📌 هدر واریانت */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                  <h4 className="font-bold text-[#0077B6] text-[15px]">
                    {field.dbId ? (
                      <>✏️ ویرایش واریانت #{i + 1}</>
                    ) : (
                      <>✨ واریانت جدید</>
                    )}
                  </h4>
                  {field.dbId && (
                    <span className="text-[11px] bg-[#E0F7FA] text-[#00B4D8] px-3 py-1 rounded-full">
                      ID: {field.dbId}
                    </span>
                  )}
                </div>

                {/* 📝 فیلدهای فرم */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <FormField label="💰 قیمت (تومان)">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        {...register(`variants.${i}.price`)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (!/^\d*$/.test(raw)) {
                            e.target.value = e.target.value.replace(
                              /[^\d,]/g,
                              "",
                            );
                            return;
                          }
                          const formatted = raw.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ",",
                          );
                          e.target.value = formatted;
                          setValue(`variants.${i}.price`, Number(raw) as any);
                          setPriceTexts((prev) =>
                            prev.map((t, idx) =>
                              idx === i ? numberToPersianText(raw) : t,
                            ),
                          );
                        }}
                        placeholder="مثلاً 250,000"
                        className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                      />
                      {priceTexts[i] && (
                        <p className="text-xs mt-1 text-gray-600">
                          {priceTexts[i]}
                        </p>
                      )}
                    </div>
                  </FormField>
                  <FormField label="🏷️ قیمت با تخفیف (تومان)">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        {...register(`variants.${i}.discountPrice`)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (!/^\d*$/.test(raw)) {
                            e.target.value = e.target.value.replace(
                              /[^\d,]/g,
                              "",
                            );
                            return;
                          }
                          const formatted = raw.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ",",
                          );
                          e.target.value = formatted;
                          setValue(
                            `variants.${i}.discountPrice`,
                            raw === "" || raw === "0"
                              ? null
                              : (Number(raw) as any),
                          );
                          setDiscountTexts((prev) =>
                            prev.map((t, idx) =>
                              idx === i ? numberToPersianText(raw) : t,
                            ),
                          );
                        }}
                        placeholder="اختیاری — خالی یا ۰ = بدون تخفیف"
                        className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                      />
                      {discountTexts[i] && (
                        <p className="text-xs mt-1 text-gray-600">
                          {discountTexts[i]}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1 pr-1">
                        ۰ یا خالی = بدون تخفیف
                      </p>
                    </div>
                  </FormField>

                  <FormField label="📊 موجودی">
                    <input
                      type="number"
                      {...register(`variants.${i}.stock`, {
                        valueAsNumber: true,
                      })}
                      placeholder="مثلاً 50"
                      className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                    />
                  </FormField>

                  <FormField label="📅 تاریخ انقضا">
                    <input
                      type="date"
                      {...register(`variants.${i}.expiryDate`)}
                      className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                    />
                  </FormField>
                </div>

                {/* 🖼️ مدیریت تصاویر */}
                <div className="mt-6">
                  <MultiImageUploader
                    images={watch(`variants.${i}.images`) || []}
                    existingImages={watch(`variants.${i}.existingImages`) || []}
                    onChange={(files) =>
                      setValue(`variants.${i}.images`, files)
                    }
                    onRemoveExisting={(url) =>
                      handleRemoveExistingImage(i, url)
                    }
                    maxFiles={5}
                  />
                </div>

                {/* 🎯 دکمه‌های اکشن */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-gray-500 hover:text-gray-700 text-[13px] hover:underline transition-colors"
                    >
                      🔙 بستن فرم
                    </button>

                    {field.dbId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "⚠️ آیا از حذف این واریانت از دیتابیس مطمئن هستید؟\n\n⚠️ توجه: تمام تصاویر این واریانت هم حذف خواهند شد!",
                            )
                          ) {
                            deleteMutation.mutate(field.dbId!);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-[13px] hover:underline transition-colors"
                      >
                        🗑️ حذف کامل از دیتابیس
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveVariant(i)}
                    disabled={
                      updateVariantMutation.isPending ||
                      createVariantMutation.isPending
                    }
                    className="bg-[#00B4D8] hover:bg-[#0096C7] text-white text-[13px] font-medium px-6 py-2.5 rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    {updateVariantMutation.isPending ||
                    createVariantMutation.isPending
                      ? "در حال ذخیره..."
                      : field.dbId
                        ? "💾 ثبت تغییرات"
                        : "✅ ثبت واریانت"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormProvider>
  );
}

/* ✅ کامپوننت فیلد عمومی */
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
