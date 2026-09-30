"use client";

import { useEffect, useRef, useState } from "react";
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
import { numberToPersianText } from "@/lib/utils/numberToText";
import { RichTextEditor } from "../inputs/RichTextEditor";
import { MultiImageUploader } from "../inputs/MultiImageUploader";
import VariantAttributeSelector from "./VariantAttributeSelector";
import ProductAttributeSelector from "./ProductAttributeSelector";
import { useAutoSaveDraft } from "@/lib/hooks/useAutoSaveDraft";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
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
  const { loadDraft, clearDraft, discardDraft } = useAutoSaveDraft(
    form,
    mode === "add", // فقط در حالت add فعال باشد
  );
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = form;
  const draftLoadedRef = useRef(false);
  // 🔁 مقداردهی اولیه برای حالت ویرایش
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug ?? "",
        description: initialData.description ?? "",
        shortDescription: initialData.shortDescription ?? "",
        metaTitle: initialData.metaTitle ?? "",
        metaDescription: initialData.metaDescription ?? "",
        brandId: initialData.brandId,
        categoryId: initialData.categoryId,
        isBlock: initialData.isBlock ?? false,
        image: undefined,
        variants:
          initialData.variants.length > 0
            ? initialData.variants.map((v) => ({
                sku: v.sku ?? "",
                barcode: v.barcode ?? "",
                purchasePrice: v.purchasePrice
                  ? Number(v.purchasePrice)
                  : undefined,
                price: Number(v.price),
                discountPrice: v.discountPrice
                  ? Number(v.discountPrice)
                  : undefined,
                stock: v.stock,
                expiryDate: v.expiryDate
                  ? v.expiryDate.split("T")[0]
                  : undefined,

                // عکس‌های جدید فعلاً خالی
                images: [],

                // ویژگی‌های واریانت
                attributes: v.attributes ?? [],
              }))
            : [
                {
                  sku: "",
                  barcode: "",
                  purchasePrice: undefined,
                  price: 0,
                  discountPrice: 0,
                  stock: 0,
                  expiryDate: "",
                  images: [],
                  attributes: [],
                },
              ],
      });
    } else {
      if (draftLoadedRef.current) return;
      draftLoadedRef.current = true;

      const draft = loadDraft();
      if (draft) {
        reset(draft);
        toast.info("پیش‌نویس قبلی بازیابی شد.");
      } else {
        reset({
          name: "",
          description: "",
          slug: "",
          shortDescription: "",
          brandId: undefined,
          categoryId: undefined,
          image: undefined,
          variants: [
            {
              sku: "",
              barcode: "",
              purchasePrice: undefined,
              price: 0,
              discountPrice: 0,
              stock: 0,
              expiryDate: "",
              images: [],
              attributes: [],
            },
          ],
        });
      }
    }
  }, [mode, initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const [priceTexts, setPriceTexts] = useState<string[]>([]);
  const [discountTexts, setDiscountTexts] = useState<string[]>([]);
  const [purchasePrice, setpurchasePrice] = useState<string[]>([]);
  useEffect(() => {
    setPriceTexts(Array(fields.length).fill(""));
    setDiscountTexts(Array(fields.length).fill(""));
    setpurchasePrice(Array(fields.length).fill(""));
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
      toast.success("✅ محصول با موفقیت ثبت شد");

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      if (mode === "add") {
        clearDraft();

        reset({
          name: "",
          slug: "",
          description: "",
          shortDescription: "",
          metaTitle: "",
          metaDescription: "",
          brandId: undefined,
          categoryId: undefined,
          isBlock: false,
          image: undefined,
          attributes: [],
          variants: [
            {
              sku: "",
              barcode: "",
              purchasePrice: undefined,
              price: 0,
              discountPrice: 0,
              stock: 0,
              expiryDate: "",
              images: [],
              attributes: [],
            },
          ],
        });

        setPriceTexts([""]);
        setDiscountTexts([""]);
        setpurchasePrice([""]);
        setPreview(null);
      }
    },
    onError: (error: any) => {
      console.error("❌ PRODUCT MUTATION ERROR:", error);

      const message =
        error?.response?.data?.message || error?.message || "خطا در ارسال داده";

      toast.error(message);
    },
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
        {mode === "add" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("پیش‌نویس حذف شود؟")) {
                clearDraft();
                reset({
                  name: "",
                  description: "",
                  shortDescription: "",
                  metaTitle: "",
                  metaDescription: "",
                  brandId: undefined,
                  categoryId: undefined,
                  image: undefined,
                  attributes: [],
                  variants: [
                    {
                      sku: "",
                      barcode: "",
                      purchasePrice: undefined,
                      price: 0,
                      discountPrice: 0,
                      stock: 0,
                      expiryDate: "",
                      images: [],
                      attributes: [],
                    },
                  ],
                });
              }
            }}
            className="text-red-500 text-[14px] px-4 py-2 rounded-[8px] border border-red-300 hover:bg-red-50"
          >
            حذف پیش‌نویس
          </button>
        )}
        <div className="space-y-2">
          <ImageUploader name="image" label="تصویر اصلی محصول" />
          {errors.image && (
            <p className="text-xs text-red-500">
              {errors.image.message as string}
            </p>
          )}
        </div>

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
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              dir="ltr"
              placeholder="magnesium-citrate-200mg"
              className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] ${
                errors.slug ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />

            <p className="text-xs text-gray-400 mt-1" dir="rtl">
              فقط حروف انگلیسی، عدد و خط تیره مجاز است.
            </p>
          </FormField>
          <FormField
            label="توضیح کوتاه"
            error={errors.shortDescription?.message}
          >
            <textarea
              rows={4}
              {...register("shortDescription")}
              className={`w-full border px-3 py-2 rounded-[8px] ${
                errors.shortDescription ? "border-red-500" : "border-[#D6D6D6]"
              }`}
            />
          </FormField>
          {/* ----- برند ----- */}
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
          <RichTextEditor control={control} name="description" />
          <div className="grid grid-cols-2 gap-8">
            <FormField label="Meta Title" error={errors.metaTitle?.message}>
              <input
                {...register("metaTitle")}
                className={`w-full h-[40px] border px-3 rounded-[8px] ${
                  errors.metaTitle ? "border-red-500" : "border-[#D6D6D6]"
                }`}
              />
            </FormField>
            <FormField
              label="Meta Description"
              error={errors.metaDescription?.message}
            >
              <textarea
                rows={4}
                {...register("metaDescription")}
                className={`w-full border px-3 py-2 rounded-[8px] ${
                  errors.metaDescription ? "border-red-500" : "border-[#D6D6D6]"
                }`}
              />
            </FormField>
          </div>
          <ProductAttributeSelector />
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
                {/* قیمت */}
                <FormField label="SKU">
                  <input {...register(`variants.${i}.sku`)} />
                </FormField>
                <FormField label="بارکد">
                  <input {...register(`variants.${i}.barcode`)} />
                </FormField>
                <FormField
                  label="قیمت خرید"
                  error={errors.variants?.[i]?.purchasePrice?.message}
                >
                  <div className="flex flex-col">
                    <input
                      type="text"
                      {...register(`variants.${i}.purchasePrice`)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");

                        // فقط عدد
                        if (!/^\d*$/.test(raw)) {
                          e.target.value = e.target.value.replace(
                            /[^\d,]/g,
                            "",
                          );
                          return;
                        }

                        // فرمت سه رقم سه رقم
                        const formatted = raw.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ",",
                        );
                        e.target.value = formatted;

                        // نمایش به حروف
                        const newText = numberToPersianText(formatted);
                        setpurchasePrice((prev) =>
                          prev.map((t, idx) => (idx === i ? newText : t)),
                        );
                      }}
                      className={`w-full h-[40px] border px-3 rounded-[8px] text-[13px] ${
                        errors.variants?.[i]?.purchasePrice
                          ? "border-red-500"
                          : "border-[#D6D6D6]"
                      }`}
                    />
                    {purchasePrice[i] && (
                      <p className="text-xs mt-1 text-gray-600">
                        {purchasePrice[i]}
                      </p>
                    )}
                  </div>
                </FormField>
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
                            "",
                          );
                          return;
                        }

                        // فرمت سه رقم سه رقم
                        const formatted = raw.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ",",
                        );
                        e.target.value = formatted;

                        // نمایش به حروف
                        const newText = numberToPersianText(formatted);
                        setPriceTexts((prev) =>
                          prev.map((t, idx) => (idx === i ? newText : t)),
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
                            "",
                          );
                          return;
                        }

                        const formatted = raw.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ",",
                        );
                        e.target.value = formatted;

                        // نمایش به حروف
                        const newText = numberToPersianText(formatted);
                        setDiscountTexts((prev) =>
                          prev.map((t, idx) => (idx === i ? newText : t)),
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
                  <div className="mt-5">
                    <Controller
                      name={`variants.${i}.images`}
                      control={control}
                      render={({ field }) => (
                        <MultiImageUploader
                          images={field.value || []}
                          onChange={field.onChange}
                          maxFiles={10}
                          existingImages={
                            initialData?.variants?.[i]?.images ?? []
                          }
                        />
                      )}
                    />
                  </div>
                </FormField>
              </div>
              <VariantAttributeSelector control={control} index={i} />
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
                sku: "",

                barcode: "",

                purchasePrice: undefined,

                price: 0,

                discountPrice: 0,

                stock: 0,

                expiryDate: "",

                images: [],

                attributes: [],
              })
            }
            className="text-[#00B4D8] text-[14px] self-start hover:underline"
          >
            + افزودن واریانت جدید
          </button>
        </div>

        {/* دکمه */}
        <div className="flex justify-between items-center mt-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#00B4D8] hover:bg-[#009DC1] transition text-white text-[14px] font-medium px-8 py-2 rounded-[8px] mr-auto"
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
