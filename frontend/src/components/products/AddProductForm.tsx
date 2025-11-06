"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
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
import { packageTypeOptions } from "@/src/constants/productOptions";
import Select from "react-select";
import { numberToPersianText } from "@/lib/utils/numberToText";

/* --------------------------------------------------------- */
/* ✅ فرم بیسیک + پشتیبانی از Error UI و Toast */
/* --------------------------------------------------------- */

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
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

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

  // 🔁 مقداردهی اولیه برای حالت ویرایش
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
                  price: "",
                  stock: 0,
                  discountPrice: "",
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
        image: undefined,
        variants: [
          {
            packageQuantity: 1,
            packageType: "",
            price: 0,
            stock: 0,
          },
        ],
      });
    }
  }, [mode, initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const [priceTexts, setPriceTexts] = useState<string[]>([]);
  const [discountTexts, setDiscountTexts] = useState<string[]>([]);
  useEffect(() => {
    setPriceTexts(Array(fields.length).fill(""));
    setDiscountTexts(Array(fields.length).fill(""));
  }, [fields.length]);
  // 🚀 درخواست API
  const mutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      if (mode === "edit") {
        if (!initialData?.id) throw new Error("شناسه محصول نامعتبر است");
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

  const onSubmit = (data: CreateProductDTO) => {
    if (!data.variants?.length) {
      toast.error("حداقل یک واریانت باید ثبت شود");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className="w-[808px] bg-white border border-[#EDEDED] rounded-[16px] p-8 flex flex-col gap-8 font-vazir text-[#434343]"
      >
        {/* تصویر محصول */}
        <ImageUploader name="image" />

        <div className="grid grid-cols-2 gap-8">
          {/* ----- نام محصول ----- */}
          <FormField label="نام محصول" error={errors.name?.message}>
            <input
              {...register("name")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.name ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />
          </FormField>

          {/* ----- کد SKU ----- */}
          <FormField label="کد محصول (SKU)" error={errors.sku?.message}>
            <input
              {...register("sku")}
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.sku ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />
          </FormField>

          {/* ----- برند ----- */}
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

          {/* ----- دسته‌بندی ----- */}
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

        {/* توضیحات */}
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

        {/* واریانت‌ها */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[16px] font-semibold text-[#242424]">
            📦 واریانت‌ها
          </h3>

          {fields.map((field, i) => (
            <div
              key={field.id}
              className="border border-[#D6D6D6] bg-gray-50 rounded-[12px] p-5 flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* تعداد در بسته */}
                <FormField
                  label="تعداد در بسته"
                  error={errors.variants?.[i]?.packageQuantity?.message}
                >
                  <input
                    type="number"
                    {...register(`variants.${i}.packageQuantity`, {
                      valueAsNumber: true,
                    })}
                    className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                      errors.variants?.[i]?.packageQuantity
                        ? "border-red-500"
                        : "border-[#D6D6D6]"
                    }`}
                  />
                </FormField>

                {/* نوع بسته‌بندی */}
                <FormField
                  label="نوع بسته‌بندی"
                  error={errors.variants?.[i]?.packageType?.message}
                >
                  <Controller
                    name={`variants.${i}.packageType`}
                    control={control}
                    render={({ field }) => {
                      type OptionType = { value: string; label: string };
                      return (
                        <Select<OptionType>
                          options={packageTypeOptions}
                          placeholder="انتخاب نوع بسته"
                          isSearchable
                          value={
                            packageTypeOptions.find(
                              (opt) => opt.value === field.value
                            ) || null
                          }
                          onChange={(opt) =>
                            field.onChange(opt ? opt.value : "")
                          }
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: "40px",
                              borderRadius: "8px",
                              borderColor: errors.variants?.[i]?.packageType
                                ? "#EF4444"
                                : "#D6D6D6",
                            }),
                          }}
                        />
                      );
                    }}
                  />
                </FormField>

                {/* قیمت */}
                <FormField
                  label="قیمت (تومان)"
                  error={errors.variants?.[i]?.price?.message}
                >
                  <div className="flex flex-col">
                    <input
                      type="text"
                      {...register(`variants.${i}.price`)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");

                        // فقط عدد
                        if (!/^\d*$/.test(raw)) {
                          e.target.value = e.target.value.replace(
                            /[^\d,]/g,
                            ""
                          );
                          return;
                        }

                        // فرمت سه رقم سه رقم
                        const formatted = raw.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        );
                        e.target.value = formatted;

                        // نمایش به حروف
                        const newText = numberToPersianText(formatted);
                        setPriceTexts((prev) =>
                          prev.map((t, idx) => (idx === i ? newText : t))
                        );
                      }}
                      className={`w-full h-[40px] border px-3 rounded-[8px] text-[13px] ${
                        errors.variants?.[i]?.price
                          ? "border-red-500"
                          : "border-[#D6D6D6]"
                      }`}
                    />
                    {priceTexts[i] && (
                      <p className="text-xs mt-1 text-gray-600">
                        {priceTexts[i]}
                      </p>
                    )}
                  </div>
                </FormField>

                {/* موجودی */}
                <FormField
                  label="موجودی"
                  error={errors.variants?.[i]?.stock?.message}
                >
                  <input
                    type="number"
                    {...register(`variants.${i}.stock`, {
                      valueAsNumber: true,
                    })}
                    className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                      errors.variants?.[i]?.stock
                        ? "border-red-500"
                        : "border-[#D6D6D6]"
                    }`}
                  />
                </FormField>

                {/* قیمت با تخفیف */}
                <FormField
                  label="قیمت با تخفیف (تومان)"
                  error={errors.variants?.[i]?.discountPrice?.message}
                >
                  <div className="flex flex-col">
                    <input
                      type="text"
                      {...register(`variants.${i}.discountPrice`)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");
                        if (!/^\d*$/.test(raw)) {
                          e.target.value = e.target.value.replace(
                            /[^\d,]/g,
                            ""
                          );
                          return;
                        }

                        const formatted = raw.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        );
                        e.target.value = formatted;

                        // نمایش به حروف
                        const newText = numberToPersianText(formatted);
                        setDiscountTexts((prev) =>
                          prev.map((t, idx) => (idx === i ? newText : t))
                        );
                      }}
                      className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                        errors.variants?.[i]?.discountPrice
                          ? "border-red-500"
                          : "border-[#D6D6D6]"
                      }`}
                    />
                    {discountTexts[i] && (
                      <p className="text-xs mt-1 text-gray-600">
                        {discountTexts[i]}
                      </p>
                    )}
                  </div>
                </FormField>
                {/* تاریخ انقضا */}
                <FormField
                  label="تاریخ انقضا"
                  error={errors.variants?.[i]?.expiryDate?.message}
                >
                  <input
                    type="date"
                    {...register(`variants.${i}.expiryDate`)}
                    className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                      errors.variants?.[i]?.expiryDate
                        ? "border-red-500"
                        : "border-[#D6D6D6]"
                    }`}
                  />
                </FormField>
              </div>

              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-500 text-sm self-end hover:underline"
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
                price: 0, // ✅ رشته خالی
                discountPrice: 0, // ✅ رشته خالی
                stock: 0,
                expiryDate: undefined,
              })
            }
            className="text-[#00B4D8] text-[14px] self-start hover:underline"
          >
            + افزودن واریانت جدید
          </button>
        </div>

        {/* دکمه */}
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#00B4D8] hover:bg-[#009DC1] transition text-white text-[14px] font-medium px-8 py-2 rounded-[8px]"
          >
            {mutation.isPending
              ? "در حال ارسال..."
              : mode === "edit"
              ? "ثبت تغییرات"
              : "ثبت محصول"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

/* --------------------------------------------------------- */
/* 📦 FormField component - نمایش خطاها در تمام فیلدها */
/* --------------------------------------------------------- */
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}
const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-[14px]">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
