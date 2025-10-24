"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

  // 🧠 گرفتن برند و دسته
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // 🧾 تعریف فرم
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateProductDTO>({
    resolver: zodResolver(productSchema),
  });

  // 🔁 مقداردهی فرم در حالت ویرایش
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
        variants: initialData.variants.map((v) => ({
          packageQuantity: v.packageQuantity,
          packageType: v.packageType || "",
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
          stock: v.stock,
          expiryDate: v.expiryDate ? v.expiryDate.split("T")[0] : undefined,
        })),
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

  // 🧩 فیلدهای داینامیک واریانت
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // 🔄 mutation داینامیک (create / update)
  const mutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      if (mode === "edit") {
        if (!initialData?.id) {
          throw new Error("شناسه محصول نامعتبر است.");
        }
        return await productApi.update(initialData.id, data);
      }
      return await productApi.create(data);
    },
    onSuccess: () => {
      toast.success(
        mode === "edit"
          ? "✅ محصول با موفقیت ویرایش شد"
          : "✅ محصول با موفقیت ایجاد شد"
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });

      if (mode === "add") {
        reset();
        setPreview(null);
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        mode === "edit" ? "❌ خطا در ویرایش محصول" : "❌ خطا در ایجاد محصول"
      );
    },
  });

  // 🚀 onSubmit
  const onSubmit = (data: CreateProductDTO) => {
    if (!data.sku || data.sku.trim() === "") {
      toast.error("کد SKU الزامی است");
      return;
    }
    if (!data.variants || data.variants.length === 0) {
      toast.error("حداقل یک واریانت باید اضافه شود");
      return;
    }
    mutation.mutate(data);
  };

  // 🖼️ مدیریت تصویر
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-md border shadow-sm"
    >
      {/* عنوان */}
      <h2 className="text-xl font-bold mb-4">
        {mode === "edit" ? "✏️ ویرایش محصول" : "🧾 ایجاد محصول جدید"}
      </h2>

      {/* نام محصول */}
      <div>
        <label className="block font-medium">نام محصول</label>
        <input {...register("name")} className="input" />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* SKU */}
      <div>
        <label className="block font-medium">کد محصول (SKU)</label>
        <input {...register("sku")} className="input" />
        {errors.sku && (
          <p className="text-red-500 text-sm">{errors.sku.message}</p>
        )}
      </div>

      {/* برند */}
      <div>
        <label>برند</label>
        {brandsLoading ? (
          <p>در حال بارگذاری برندها...</p>
        ) : (
          <select
            {...register("brandId", { valueAsNumber: true })}
            className="input"
          >
            <option value="">انتخاب برند</option>
            {brands?.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* دسته */}
      <div>
        <label>دسته</label>
        {categoriesLoading ? (
          <p>در حال بارگذاری دسته‌ها...</p>
        ) : (
          <select
            {...register("categoryId", { valueAsNumber: true })}
            className="input"
          >
            <option value="">انتخاب دسته</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* توضیحات */}
      <div>
        <label>توضیحات</label>
        <textarea
          {...register("description")}
          className="input resize-none"
          rows={3}
        />
      </div>

      {/* تصویر */}
      <div>
        <label>تصویر محصول</label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {preview && (
          <img src={preview} alt="preview" className="h-20 mt-2 rounded-md" />
        )}

        {/* نمایش تصویر فعلی در حالت ویرایش */}
        {mode === "edit" && !preview && initialData?.imageUrl && (
          <img
            src={
              initialData.imageUrl.startsWith("http")
                ? initialData.imageUrl
                : `${process.env.NEXT_PUBLIC_API_URL}${initialData.imageUrl}`
            }
            alt="current"
            className="h-20 mt-2 rounded-md"
          />
        )}
      </div>

      {/* واریانت‌ها */}
      <div>
        <h3 className="font-semibold mb-2">📦 واریانت‌ها</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-md p-3 mb-3 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>تعداد در بسته</label>
                <input
                  type="number"
                  {...register(`variants.${index}.packageQuantity`, {
                    valueAsNumber: true,
                  })}
                  className="input"
                />
              </div>
              <div>
                <label>نوع بسته‌بندی</label>
                <input
                  {...register(`variants.${index}.packageType`)}
                  className="input"
                />
              </div>
              <div>
                <label>قیمت</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  className="input"
                />
              </div>
              <div>
                <label>قیمت تخفیفی</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`variants.${index}.discountPrice`, {
                    valueAsNumber: true,
                  })}
                  className="input"
                />
              </div>
              <div>
                <label>موجودی</label>
                <input
                  type="number"
                  {...register(`variants.${index}.stock`, {
                    valueAsNumber: true,
                  })}
                  className="input"
                />
              </div>
              <div>
                <label>تاریخ انقضا</label>
                <input
                  type="date"
                  {...register(`variants.${index}.expiryDate`)}
                  className="input"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 mt-2 text-sm"
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
              discountPrice: undefined,
              expiryDate: undefined,
            })
          }
          className="text-blue-500 text-sm"
        >
          + افزودن واریانت جدید
        </button>
      </div>

      {/* دکمه ارسال */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
  );
}
