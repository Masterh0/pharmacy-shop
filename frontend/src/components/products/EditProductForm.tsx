"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProductSchema,
  CreateProductDTO,
} from "@/lib/validators/productSchema";
import { productApi } from "@/lib/api/products";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBrands } from "@/lib/hooks/useBrand";
import { useCategories } from "@/lib/hooks/useCategories";
import { Product } from "@/lib/types/product";
import { CategorySelectSearch } from "@/src/components/inputs/CategorySelectSearch";
import { ImageUploader } from "../inputs/ImageUploader";
import { RichTextEditor } from "../inputs/RichTextEditor";

interface EditProductFormProps {
  initialData: Product;
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const queryClient = useQueryClient();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const [preview, setPreview] = useState<string | null>(
    initialData.imageUrl || null
  );

  /* -------------------------------------------- */
  /* 📋 مقداردهی اولیه فرم */
  /* -------------------------------------------- */
  const form = useForm<CreateProductDTO>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      description: initialData?.description ?? "",
      brandId: Number(initialData?.brandId ?? ""),
      categoryId: Number(initialData?.categoryId ?? ""),
      isBlock: !!initialData?.isBlock,
      imageUrlص: undefined,
    },
  });

  const { control, register, reset, handleSubmit, formState } = form;
  const { errors } = formState;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? "",
        sku: initialData.sku ?? "",
        description: initialData.description ?? "",
        brandId: Number(initialData.brandId ?? ""),
        categoryId: Number(initialData.categoryId ?? ""),
        isBlock: !!initialData.isBlock,
        imageUrl: undefined,
      });
      setPreview(initialData.imageUrl || initialData.image || null);
    }
  }, [initialData, reset]);

  /* -------------------------------------------- */
  /* 🚀 Mutation برای update محصول */
  /* -------------------------------------------- */
  const mutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      if (!initialData?.id) throw new Error("شناسه محصول نامعتبر است");

      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("sku", data.sku || "");
      formData.append("description", data.description || "");
      formData.append("brandId", String(data.brandId || ""));
      formData.append("categoryId", String(data.categoryId || ""));
      formData.append("isBlock", String(data.isBlock ?? false));

      if (data.imageUrl instanceof File)
        formData.append("imageUrl", data.imageUrl); // فقط در صورت فایل فیزیکی
      else formData.append("imageUrl", data.imageUrl as string);
      const res = await productApi.update(initialData.id, formData);
      return res;
    },
    onSuccess: () => {
      toast.success("✅ تغییرات ذخیره شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      console.error("❌ خطا در بروزرسانی:", err);
      toast.error("❌ خطا در بروزرسانی محصول");
    },
  });

  /* -------------------------------------------- */
  /* 🎯 تابع ارسال فرم */
  /* -------------------------------------------- */
  const onSubmit = async (data: CreateProductDTO) => {
    try {
      const parsed = editProductSchema.safeParse(data);
      if (!parsed.success) {
        console.error("⚠️ خطای اعتبارسنجی:", parsed.error.errors);
        return toast.error("داده نامعتبر است");
      }
      await mutation.mutateAsync(parsed.data);
    } catch (err) {
      console.error("💥 خطا در فراخوانی mutation:", err);
    }
  };

  /* -------------------------------------------- */
  /* 🧩 قالب UI فرم */
  /* -------------------------------------------- */
  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="w-[808px] bg-white border border-[#EDEDED] rounded-[16px] p-8 flex flex-col gap-8 font-vazir text-[#434343]"
      >
        {/* 🖼 تصویر محصول */}
        <ImageUploader name="imageUrl" defaultPreview={preview} />

        <div className="grid grid-cols-2 gap-8">
          <FormField label="نام محصول" error={errors.name?.message}>
            <input
              {...register("name")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.name ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />
          </FormField>

          <FormField label="کد محصول (SKU)" error={errors.sku?.message}>
            <input
              {...register("sku")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.sku ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />
          </FormField>

          <FormField label="برند" error={errors.brandId?.message}>
            <select
              {...register("brandId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.brandId ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            >
              <option value="">انتخاب کنید</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="دسته‌بندی" error={errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategorySelectSearch
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val ? Number(val) : undefined);
                  }}
                  defaultValue={Number(initialData.categoryId)}
                />
              )}
            />
          </FormField>
        </div>

        <FormField label="توضیحات" error={errors.description?.message}>
          <RichTextEditor
    control={control}
    name="description"
    label="توضیحات محصول"
  />
        </FormField>

        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#0077B6] hover:bg-[#009DC1] transition text-white text-[14px] font-medium px-8 py-2 rounded-[8px]"
          >
            {mutation.isPending ? "در حال ارسال..." : "ثبت تغییرات"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

/* -------------------------------------------- */
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}
const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-[14px] font-medium">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
