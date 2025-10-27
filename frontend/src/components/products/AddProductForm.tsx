"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  CreateProductDTO,
} from "@/lib/validators/productSchema";
import { productApi } from "@/lib/api/products";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useBrands } from "@/lib/hooks/useBrand";
import { useCategories } from "@/lib/hooks/useCategories";
import { Product } from "@/lib/types/product";
import { FormProvider } from "react-hook-form";
import { CategorySelectSearch } from "@/src/components/inputs/CategorySelectSearch";
import { ImageUploader } from "../inputs/ImageUploader";

interface AddProductFormProps {
  mode?: "add" | "edit";
  initialData?: Product;
}

export default function AddProductForm({
  mode = "add",
  initialData,
}: AddProductFormProps) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  // 📦 داده‌ها
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: categories, isLoading: loadingCats } = useCategories();

  // 🧾 فرم
  const form = useForm<CreateProductDTO>({
    resolver: zodResolver(productSchema),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = form;

  // 🔁 مقداردهی اولیه
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        sku: initialData.sku ?? "",
        description: initialData.description ?? "",
        brandId: initialData.brandId,
        categoryId: initialData.categoryId,
        isBlock: initialData.isBlock ?? false,
        image: undefined,
        variants:
          initialData.variants.length > 0
            ? initialData.variants.map((v) => ({
                packageQuantity: v.packageQuantity,
                packageType: v.packageType || "",
                price: Number(v.price),
                discountPrice: v.discountPrice
                  ? Number(v.discountPrice)
                  : undefined,
                stock: v.stock,
                expiryDate: v.expiryDate
                  ? v.expiryDate.split("T")[0]
                  : undefined,
              }))
            : [
                {
                  packageQuantity: 1,
                  packageType: "",
                  price: 0,
                  stock: 0,
                  discountPrice: undefined,
                  expiryDate: undefined,
                },
              ],
      });
    } else {
      reset({
        name: "",
        sku: "",
        description: "",
        brandId: undefined,
        categoryId: undefined,
        isBlock: false,
        image: undefined,
        variants: [
          {
            packageQuantity: 1,
            packageType: "",
            price: 0,
            stock: 0,
            discountPrice: undefined,
            expiryDate: undefined,
          },
        ],
      });
    }
  }, [mode, initialData, reset]);

  // واریانت‌ها
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // 🧩 submit mutation
  const mutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      if (mode === "edit") {
        if (!initialData?.id) throw new Error("شناسه محصول نامعتبر است.");
        return await productApi.update(initialData.id, data);
      }
      return await productApi.create(data);
    },
    onSuccess: () => {
      toast.success(
        mode === "edit"
          ? "✅ محصول با موفقیت ویرایش شد"
          : "✅ محصول با موفقیت ثبت شد"
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (mode === "add") {
        reset();
        setPreview(null);
      }
    },
    onError: () => toast.error("❌ خطا در ارسال داده"),
  });

  // 🖼️ آپلود تصویر
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ارسال داده
  const onSubmit = (data: CreateProductDTO) => {
    console.log("🧾 داده ارسالی فرم:", data); // ✅ فقط یه خط لاگ دیباگ

    if (!data.sku?.trim()) return toast.error("کد SKU الزامی است");
    if (!data.variants.length) return toast.error("حداقل یک واریانت نیاز است");
    mutation.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="w-[808px] bg-white border border-[#EDEDED] rounded-[16px] p-8 flex flex-col gap-8 font-vazir text-[#434343]"
      >
        {/* عنوان اصلی */}
        {/* <h2 className="text-[20px] font-bold text-[#242424]">
          {mode === "edit" ? "✏️ ویرایش محصول" : "🧾 افزودن محصول جدید"}
        </h2> */}

        {/* 🖼️ تصویر محصول */}
        <div>
          <ImageUploader name="image" />
        </div>

        {/* فیلدهای ثابت محصول */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <label className="block text-[14px] mb-2">نام محصول</label>
            <input
              {...register("name")}
              className="w-full h-[40px] rounded-[8px] border border-[#D6D6D6] px-3 text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[14px] mb-2">کد محصول (SKU)</label>
            <input
              {...register("sku")}
              className="w-full h-[40px] rounded-[8px] border border-[#D6D6D6] px-3 text-[13px]"
            />
          </div>

          <div className="dir: ltr">
            <label className="block text-[14px] mb-2">برند</label>
            <select
              {...register("brandId", { valueAsNumber: true })}
              className="w-full h-[40px] rounded-[8px] border border-[#D6D6D6] px-3 text-[13px] bg-white"
            >
              <option value="">انتخاب برند</option>
              {loadingBrands ? (
                <option>در حال بارگذاری...</option>
              ) : (
                brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-[14px] mb-2">دسته بندی</label>

            {/* ✅ این کامپوننت جایگزین select قبلی */}
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategorySelectSearch
                  value={field.value}
                  onChange={field.onChange} // ← الان مقدار به فرم وصل میشه
                />
              )}
            />
          </div>
        </div>

        {/* توضیحات */}
        <div>
          <label className="block text-[14px] mb-2">توضیحات</label>
          <textarea
            {...register("description")}
            className="w-full border border-[#D6D6D6] rounded-[8px] px-3 py-2 text-[13px] resize-none"
            rows={3}
            placeholder="توضیحات محصول..."
          />
        </div>

        {/* 🧩 واریانت‌ها */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[16px] font-semibold text-[#242424]">
            📦 واریانت‌ها
          </h3>

          {fields.map((field, i) => (
            <div
              key={field.id}
              className="border border-[#D6D6D6] bg-gray-50 rounded-[12px] p-5 flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <label className="block text-[13px] mb-2">
                    تعداد در بسته
                  </label>
                  <input
                    type="number"
                    {...register(`variants.${i}.packageQuantity`, {
                      valueAsNumber: true,
                    })}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] mb-2">
                    نوع بسته‌بندی
                  </label>
                  <input
                    {...register(`variants.${i}.packageType`)}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] mb-2">قیمت (تومان)</label>
                  <input
                    type="number"
                    {...register(`variants.${i}.price`, {
                      valueAsNumber: true,
                    })}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] mb-2">قیمت تخفیفی</label>
                  <input
                    type="number"
                    {...register(`variants.${i}.discountPrice`, {
                      valueAsNumber: true,
                    })}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] mb-2">موجودی</label>
                  <input
                    type="number"
                    {...register(`variants.${i}.stock`, {
                      valueAsNumber: true,
                    })}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] mb-2">تاریخ انقضا</label>
                  <input
                    type="date"
                    {...register(`variants.${i}.expiryDate`)}
                    className="w-full h-[40px] border border-[#D6D6D6] rounded-[8px] px-3 text-[13px]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-500 text-sm self-end"
              >
                حذف واریانت
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                packageQuantity: 1,
                packageType: "",
                price: 0,
                stock: 0,
              })
            }
            className="text-[#00B4D8] text-[14px] self-start hover:underline transition"
          >
            + افزودن واریانت جدید
          </button>
        </div>

        {/* دکمه ارسال */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#00B4D8] hover:bg-[#009DC1] transition text-white text-[14px] font-medium px-8 py-2 rounded-[8px]"
          >
            {mutation.isPending
              ? mode === "edit"
                ? "در حال ویرایش..."
                : "در حال ثبت..."
              : mode === "edit"
              ? "ثبت تغییرات"
              : "ثبت محصول"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
