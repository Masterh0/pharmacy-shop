"use client";

import { useEffect } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProductSchema,
  EditProductDTO,
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
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import ProductAttributeSelector from "./ProductAttributeSelector";

interface EditProductFormProps {
  initialData: Product;
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const queryClient = useQueryClient();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const form = useForm<EditProductDTO>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: initialData.name ?? "",
      slug: initialData.slug ?? "",
      description: initialData.description ?? "",
      shortDescription: initialData.shortDescription ?? "",
      metaTitle: initialData.metaTitle ?? "",
      metaDescription: initialData.metaDescription ?? "",
      brandId: Number(initialData.brandId),
      categoryId: Number(initialData.categoryId),
      isBlock: initialData.isBlock ?? false,
      image: undefined,
      attributes:
        initialData.attributes?.map((a) => ({
          attributeId: a.attributeId,
          valueId: a.valueId,
        })) ?? [],
    },
  });

  const {
    control,
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      name: initialData.name ?? "",
      slug: initialData.slug ?? "",
      description: initialData.description ?? "",
      shortDescription: initialData.shortDescription ?? "",
      metaTitle: initialData.metaTitle ?? "",
      metaDescription: initialData.metaDescription ?? "",
      brandId: Number(initialData.brandId),
      categoryId: Number(initialData.categoryId),
      isBlock: initialData.isBlock ?? false,
      image: initialData.imageUrl ?? undefined,
      attributes:
        initialData.attributes?.map((a) => ({
          attributeId: a.value.attributeId,
          valueId: a.valueId,
        })) ?? [],
    });
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: EditProductDTO) => {
      const formData = new FormData();
      
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      if (data.shortDescription)
        formData.append("shortDescription", data.shortDescription);
      if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
      if (data.metaDescription)
        formData.append("metaDescription", data.metaDescription);
      formData.append("brandId", String(data.brandId));
      formData.append("categoryId", String(data.categoryId));
      if (data.isBlock !== undefined)
        formData.append("isBlock", String(data.isBlock));
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.attributes?.length)
        formData.append("attributes", JSON.stringify(data.attributes));
      return productApi.update(initialData.id, formData);
    },
    onSuccess: () => {
      toast.success("✅ تغییرات ذخیره شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
    },
    onError: () => toast.error("❌ خطا در بروزرسانی محصول"),
  });

  const onSubmit = (data: EditProductDTO) => mutation.mutate(data);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="w-[808px] bg-white border border-[#EDEDED] rounded-[16px] p-8 flex flex-col gap-8 font-vazir text-[#434343]"
      >
        <div className="space-y-2">
          <ImageUploader name="image" label="تصویر اصلی محصول" />
          {errors.image && (
            <p className="text-xs text-red-500">
              {errors.image.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8">
          <FormField label="نام محصول" error={errors.name?.message}>
            <input
              {...register("name")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${errors.name ? "border-red-500" : "border-[#D6D6D6]"}`}
            />
          </FormField>
          <FormField label="Slug" error={errors.slug?.message}>
            <input
              {...register("slug", {
                required: "Slug الزامی است",
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message:
                    "Slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشد",
                },
              })}
              onChange={(e) => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/-+/g, "-")
                  .replace(/^-+|-+$/g, "");

                setValue("slug", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              dir="ltr"
              placeholder="magnesium-citrate-200mg"
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.slug ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />

            <p className="text-xs text-gray-400 mt-1" dir="rtl">
              فاصله‌ها به خط تیره تبدیل می‌شوند.
            </p>
          </FormField>
          <FormField
            label="توضیح کوتاه"
            error={errors.shortDescription?.message}
          >
            <textarea
              rows={4}
              {...register("shortDescription")}
              className={`w-full border px-3 py-2 rounded-[8px] ${errors.shortDescription ? "border-red-500" : "border-[#D6D6D6]"}`}
            />
          </FormField>

          <FormField label="برند" error={errors.brandId?.message}>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={brands ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.brandId}
                />
              )}
            />
          </FormField>

          <FormField label="دسته‌بندی" error={errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategorySelectSearch
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        </div>

        <FormField label="توضیحات" error={errors.description?.message}>
          <RichTextEditor control={control} name="description" />
          <div className="grid grid-cols-2 gap-8 mt-4">
            <FormField label="Meta Title" error={errors.metaTitle?.message}>
              <input
                {...register("metaTitle")}
                className={`w-full h-[40px] border px-3 rounded-[8px] ${errors.metaTitle ? "border-red-500" : "border-[#D6D6D6]"}`}
              />
            </FormField>
            <FormField
              label="Meta Description"
              error={errors.metaDescription?.message}
            >
              <textarea
                rows={4}
                {...register("metaDescription")}
                className={`w-full border px-3 py-2 rounded-[8px] ${errors.metaDescription ? "border-red-500" : "border-[#D6D6D6]"}`}
              />
            </FormField>
          </div>
          <ProductAttributeSelector />
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
