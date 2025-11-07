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

/* --------------------------------------------------------- */
/* 🎯 فرم نهایی ویرایش محصول (بدون بخش واریانت‌ها) */
/* --------------------------------------------------------- */

interface EditProductFormProps {
  initialData: Product;
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const queryClient = useQueryClient();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const [preview, setPreview] = useState<string | null>(
    initialData.imageUrl || initialData.image || null
  );

  console.log("🔍 initialData دریافت‌شده:", initialData);
  console.log("🔍 برندها:", brands);
  console.log("🔍 دسته‌بندی‌ها:", categories);
  console.log("🔍 preview اولیه:", preview);

  /* --------------------------------------------------------- */
  /* 🎯 مقداردهی فرم با داده اولیه */
  /* --------------------------------------------------------- */
  const form = useForm<CreateProductDTO>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      description: initialData?.description ?? "",
      brandId: Number(initialData?.brandId ?? ""),
      categoryId: Number(initialData?.categoryId ?? ""),
      isBlock: !!initialData?.isBlock,
      image: undefined,
    },
  });

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  // 🎯 در صورت تغییر initialData یا کوئری‌ها، ریست کن
  useEffect(() => {
    console.log("📦 useEffect اجرا شد / مقداردهی مجدد فرم");
    if (initialData) {
      reset({
        name: initialData.name ?? "",
        sku: initialData.sku ?? "",
        description: initialData.description ?? "",
        brandId: Number(initialData.brandId ?? ""),
        categoryId: Number(initialData.categoryId ?? ""),
        isBlock: !!initialData.isBlock,
        image: undefined,
      });
      setPreview(initialData.imageUrl || initialData.image || null);
    }
  }, [initialData, reset]);
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      console.log("👀 تغییر در فرم:", name, value);
    });
    return () => subscription.unsubscribe();
  }, [form]);
  /* --------------------------------------------------------- */
  /* 🚀 Mutation: Update Product */
  /* --------------------------------------------------------- */
  const mutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      console.log("🧩 شروع mutation / داده‌های فرم:", data);

      if (!initialData?.id) throw new Error("شناسه محصول نامعتبر است");

      const formData = new FormData();
      formData.append("name", data.name || initialData.name);
      formData.append("sku", data.sku || initialData.sku || "");
      formData.append(
        "description",
        data.description || initialData.description || ""
      );
      formData.append("brandId", String(data.brandId || initialData.brandId));
      formData.append(
        "categoryId",
        String(data.categoryId || initialData.categoryId)
      );
      formData.append(
        "isBlock",
        String(data.isBlock ?? initialData.isBlock ?? false)
      );

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
        console.log("📸 فایل جدید اضافه شد:", data.image);
      } else {
        console.log("📸 بدون تغییر تصویر ارسال شد");
      }

      console.log(
        "🚀 ارسال به API productApi.update:",
        `/products/${initialData.id}`
      );

      // ✅ بهینه‌ترین نسخهٔ update با هندل پاسخ API
      const res = await productApi.update(initialData.id, formData);
      console.log("📦 پاسخ از سرور:", res);
      return res;
    },

    onSuccess: (res) => {
      console.log("✅ پاسخ موفقیت از API:", res);
      toast.success("✅ محصول با موفقیت ویرایش شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (err: any) => {
      console.error("❌ خطا در mutation:", err);
      toast.error("❌ خطا در بروزرسانی محصول");
    },
  });

  /* --------------------------------------------------------- */
  /* 📤 ارسال فرم */
  /* --------------------------------------------------------- */
  const onSubmit = async (data: CreateProductDTO) => {
  console.log("🧨 RHF فراخوان شد، داده‌های خام:", data);

  // همه ارورها از فرم زنده کنسول کن
  console.log("🐞 errors (react-hook-form):", errors);

  // تایید کن که این لاگ اجرا میشه
  alert("Form Submitted! Go check console 🧠");

  try {
    const parsed = editProductSchema.safeParse(data);
    console.log("📦 نتیجه زود:", parsed);

    if (!parsed.success) {
      console.error("❌ زود ناموفق شد:", parsed.error.errors);
      toast.error("⚠️ Validation شکست خورد");
      return;
    }

    console.log("✅ زود تأیید شد:", parsed.data);

    await mutation.mutateAsync(parsed.data);
  } catch (err) {
    console.error("💥 خطا در mutateAsync:", err);
  }
};
  /* --------------------------------------------------------- */
  /* 🧩 UI قالب فرم */
  /* --------------------------------------------------------- */
  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="w-[808px] bg-white border border-[#EDEDED] rounded-[16px] p-8 flex flex-col gap-8 font-vazir text-[#434343]"
      >
        {/* 🖼 تصویر محصول */}
        <ImageUploader name="image" defaultPreview={preview} />

        <div className="grid grid-cols-2 gap-8">
          {/* 🔹 نام */}
          <FormField label="نام محصول" error={errors.name?.message}>
            <input
              {...register("name")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.name ? "border-red-500" : "border-[#D6D6D6]"
              }`}
              placeholder="نام محصول را وارد کنید"
            />
          </FormField>

          {/* 🔹 SKU */}
          <FormField label="کد محصول (SKU)" error={errors.sku?.message}>
            <input
              {...register("sku")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.sku ? "border-red-500" : "border-[#D6D6D6]"
              }`}
              placeholder="کد محصول را وارد کنید"
            />
          </FormField>

          {/* 🔹 برند */}
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

          {/* 🔹 دسته‌بندی */}
          <FormField label="دسته‌بندی" error={errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategorySelectSearch
                  value={field.value}
                  onChange={(val) => {
                    console.log("📦 دسته‌بندی انتخاب شد:", val);
                    field.onChange(val ? Number(val) : undefined);
                  }}
                  defaultValue={Number(initialData.categoryId)}
                />
              )}
            />
          </FormField>
        </div>

        {/* 🔹 توضیحات */}
        <FormField label="توضیحات" error={errors.description?.message}>
          <textarea
            {...register("description")}
            className={`w-full border px-3 py-2 rounded-[8px] text-[13px] resize-none ${
              errors.description ? "border-red-500" : "border-[#D6D6D6]"
            }`}
            rows={3}
            placeholder="توضیحات محصول..."
          />
        </FormField>

        {/* 🔹 دکمه ثبت */}
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

/* --------------------------------------------------------- */
/* 📦 FormField Component */
/* --------------------------------------------------------- */
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
