"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { toast } from "sonner";
import { variantApi } from "@/lib/api/variantApi";
import { MultiImageUploader } from "@/src/components/inputs/MultiImageUploader";
import VariantAttributeSelector from "../products/VariantAttributeSelector";
import api from "@/lib/axios";
import { numberToPersianText } from "@/lib/utils/numberToText";
import { ProductImage, AttributeValue } from "@/lib/types/product";

/* --------------------------------------------------------- */
/* ✅ Type Definitions - مطابق مدل جدید ProductVariant        */
/* --------------------------------------------------------- */
interface VariantFormData {
  dbId?: number;
  sku: string;
  barcode: string;
  purchasePrice: string;
  price: string;
  discountPrice: string;
  stock: number;
  expiryDate: string;
  images: File[]; // تصاویر جدید (هنوز آپلود نشده)
  existingImages: ProductImage[]; // تصاویر موجود روی سرور
  deletedImageIds: number[]; // آیدی تصاویری که باید حذف شوند
  attributes: AttributeValue[];
}

interface VariantsManagerProps {
  productId: number;
}

export default function VariantsManager({ productId }: VariantsManagerProps) {
  const queryClient = useQueryClient();
  const [priceTexts, setPriceTexts] = useState<string[]>([]);
  const [discountTexts, setDiscountTexts] = useState<string[]>([]);
  const [purchaseTexts, setPurchaseTexts] = useState<string[]>([]);

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

  /* --------------------------------------------------------- */
  /* 📦 Mutations                                               */
  /* --------------------------------------------------------- */
  const updateVariantMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number;
      formData: FormData;
    }) => {
      const { data } = await api.put(`/variants/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("✏️ تغییرات واریانت ذخیره شد");
    },
    onError: (error: any) => {
      toast.error(`خطا: ${error.message}`);
    },
  });

  const createVariantMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/variants", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("✅ واریانت جدید ایجاد شد");
    },
    onError: (error: any) => {
      toast.error(`خطا: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => variantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      toast.success("🗑️ واریانت از دیتابیس حذف شد");
    },
    onError: () => toast.error("⚠️ خطا در حذف واریانت"),
  });

  /* --------------------------------------------------------- */
  /* 🔄 Sync سرور با فرم                                        */
  /* --------------------------------------------------------- */
  useEffect(() => {
    if (variants) {
      replace(
        variants.map((v: any) => ({
          dbId: v.id,
          sku: v.sku ?? "",
          barcode: v.barcode ?? "",
          purchasePrice: v.purchasePrice ? String(v.purchasePrice) : "",
          price: v.price ? String(v.price) : "",
          discountPrice: v.discountPrice ? String(v.discountPrice) : "",
          stock: v.stock ?? 0,
          expiryDate: v.expiryDate?.slice(0, 10) || "",
          images: [],
          existingImages: (v.images ?? []) as ProductImage[],
          deletedImageIds: [],
          attributes:
            v.attributes?.map((a: any) => ({
              valueId: a.valueId,
              attributeId: a.value.attributeId,
              value: a.value.value,
              attribute: a.value.attribute,
            })) ?? [],
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
      setPurchaseTexts(
        variants.map((v: any) =>
          v.purchasePrice ? numberToPersianText(String(v.purchasePrice)) : "",
        ),
      );
    }
  }, [variants, replace]);

  /* --------------------------------------------------------- */
  /* 🚀 افزودن واریانت جدید                                     */
  /* --------------------------------------------------------- */
  const handleAddVariant = () => {
    append({
      sku: "",
      barcode: "",
      purchasePrice: "",
      price: "",
      discountPrice: "",
      stock: 0,
      expiryDate: "",
      images: [],
      existingImages: [],
      deletedImageIds: [],
      attributes: [],
    });
    setPriceTexts((prev) => [...prev, ""]);
    setDiscountTexts((prev) => [...prev, ""]);
    setPurchaseTexts((prev) => [...prev, ""]);
  };

  /* --------------------------------------------------------- */
  /* 🗑️ حذف تصویر موجود (soft - علامت‌گذاری برای حذف)          */
  /* --------------------------------------------------------- */
  const handleRemoveExistingImage = (variantIndex: number, imageId: number) => {
    const currentExisting =
      watch(`variants.${variantIndex}.existingImages`) || [];
    const currentDeleted =
      watch(`variants.${variantIndex}.deletedImageIds`) || [];

    setValue(
      `variants.${variantIndex}.existingImages`,
      currentExisting.filter((img) => img.id !== imageId),
    );
    setValue(`variants.${variantIndex}.deletedImageIds`, [
      ...currentDeleted,
      imageId,
    ]);
  };

  /* --------------------------------------------------------- */
  /* ⭐ تنظیم تصویر اصلی (Primary)                              */
  /* --------------------------------------------------------- */
  const handleSetPrimaryImage = (variantIndex: number, imageId: number) => {
    const currentExisting =
      watch(`variants.${variantIndex}.existingImages`) || [];

    setValue(
      `variants.${variantIndex}.existingImages`,
      currentExisting.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    );
  };

  /* --------------------------------------------------------- */
  /* ↕️ تغییر ترتیب نمایش (Display Order)                       */
  /* --------------------------------------------------------- */
  const handleMoveImage = (
    variantIndex: number,
    imageId: number,
    direction: "up" | "down",
  ) => {
    const currentExisting = [
      ...(watch(`variants.${variantIndex}.existingImages`) || []),
    ].sort((a, b) => a.displayOrder - b.displayOrder);

    const idx = currentExisting.findIndex((img) => img.id === imageId);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;

    if (idx === -1 || swapWith < 0 || swapWith >= currentExisting.length) {
      return;
    }

    const tempOrder = currentExisting[idx].displayOrder;
    currentExisting[idx].displayOrder = currentExisting[swapWith].displayOrder;
    currentExisting[swapWith].displayOrder = tempOrder;

    setValue(`variants.${variantIndex}.existingImages`, currentExisting);
  };

  /* --------------------------------------------------------- */
  /* 💾 ذخیره واریانت                                           */
  /* --------------------------------------------------------- */
  const handleSaveVariant = async (index: number) => {
    try {
      const formData = getValues(`variants.${index}`);
      const variantId = formData.dbId;

      const formDataToSend = new FormData();

      formDataToSend.append("productId", productId.toString());
      formDataToSend.append("sku", formData.sku || "");
      formDataToSend.append("barcode", formData.barcode || "");
      formDataToSend.append(
        "purchasePrice",
        formData.purchasePrice ? formData.purchasePrice.replace(/,/g, "") : "0",
      );
      formDataToSend.append("price", formData.price.replace(/,/g, ""));
      formDataToSend.append(
        "discountPrice",
        formData.discountPrice ? formData.discountPrice.replace(/,/g, "") : "0",
      );
      formDataToSend.append("stock", formData.stock.toString());

      if (formData.expiryDate) {
        formDataToSend.append("expiryDate", formData.expiryDate);
      }

      // ⭐ تصاویر موجود باقی‌مانده (شامل isPrimary و displayOrder)
      formDataToSend.append(
        "existingImages",
        JSON.stringify(formData.existingImages || []),
      );

      // 🗑️ تصاویر حذف‌شده
      formDataToSend.append(
        "deletedImageIds",
        JSON.stringify(formData.deletedImageIds || []),
      );

      // 🏷️ ویژگی‌های واریانت
      formDataToSend.append(
        "attributes",
        JSON.stringify((formData.attributes || []).map((x: any) => x.valueId)),
      );

      // 🖼️ تصاویر جدید
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      if (variantId) {
        await updateVariantMutation.mutateAsync({
          id: variantId,
          formData: formDataToSend,
        });
      } else {
        await createVariantMutation.mutateAsync(formDataToSend);
      }

      setValue(`variants.${index}.images`, []);
      setValue(`variants.${index}.deletedImageIds`, []);
    } catch (error: any) {
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
            {fields.map((field, i) => {
              const existingImages =
                watch(`variants.${i}.existingImages`) || [];
              const sortedImages = [...existingImages].sort(
                (a, b) => a.displayOrder - b.displayOrder,
              );

              return (
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
                    <FormField label="🏷️ SKU">
                      <input
                        {...register(`variants.${i}.sku`)}
                        className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                      />
                    </FormField>

                    <FormField label="📊 بارکد">
                      <input
                        {...register(`variants.${i}.barcode`)}
                        className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                      />
                    </FormField>

                    <FormField label="🧾 قیمت خرید (تومان)">
                      <div className="flex flex-col">
                        <input
                          type="text"
                          {...register(`variants.${i}.purchasePrice`)}
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
                            setValue(`variants.${i}.purchasePrice`, formatted);
                            setPurchaseTexts((prev) =>
                              prev.map((t, idx) =>
                                idx === i ? numberToPersianText(raw) : t,
                              ),
                            );
                          }}
                          placeholder="مثلاً 200,000"
                          className="border border-gray-300 rounded-[8px] h-[42px] px-3 text-[13px] focus:border-[#00B4D8] focus:ring-2 focus:ring-[#E0F7FA] transition-all outline-none"
                        />
                        {purchaseTexts[i] && (
                          <p className="text-xs mt-1 text-gray-600">
                            {purchaseTexts[i]}
                          </p>
                        )}
                      </div>
                    </FormField>

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
                            setValue(`variants.${i}.price`, formatted);
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
                            setValue(`variants.${i}.discountPrice`, formatted);
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

                  {/* 🏷️ ویژگی‌های واریانت */}
                  <div className="mt-6">
                    <VariantAttributeSelector control={control} index={i} />
                  </div>

                  {/* 🖼️ مدیریت تصاویر جدید */}
                  <div className="mt-6">
                    <Controller
                      name={`variants.${i}.images`}
                      control={control}
                      render={({ field }) => (
                        <MultiImageUploader
                          images={field.value || []}
                          onChange={field.onChange}
                          maxFiles={10}
                        />
                      )}
                    />
                  </div>

                  {/* 🖼️ تصاویر موجود - Primary + Display Order */}
                  {sortedImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[13px] font-medium text-gray-700 mb-3">
                        تصاویر موجود
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sortedImages.map((img) => (
                          <div
                            key={img.id}
                            className={`relative border rounded-[8px] p-2 flex flex-col gap-2 ${
                              img.isPrimary
                                ? "border-[#00B4D8] ring-2 ring-[#E0F7FA]"
                                : "border-gray-200"
                            }`}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                              alt="variant"
                              className="w-full h-[90px] object-cover rounded-[6px]"
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 right-1 text-[10px] bg-[#00B4D8] text-white px-2 py-0.5 rounded-full">
                                اصلی
                              </span>
                            )}
                            <div className="flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(i, img.id, "up")}
                                className="text-[11px] text-gray-500 hover:text-[#00B4D8]"
                                title="جابجایی به بالا"
                              >
                                ⬆️
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveImage(i, img.id, "down")
                                }
                                className="text-[11px] text-gray-500 hover:text-[#00B4D8]"
                                title="جابجایی به پایین"
                              >
                                ⬇️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(i, img.id)}
                                className="text-[11px] text-[#00B4D8] hover:underline"
                              >
                                اصلی کن
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveExistingImage(i, img.id)
                              }
                              className="text-[11px] text-red-500 hover:underline self-end"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
              );
            })}
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
