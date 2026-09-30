"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { categoryApi } from "@/lib/api/category";
import api from "@/lib/axios";
import InnerImageZoom from "react-inner-image-zoom";
import { useCart } from "@/lib/hooks/useAddToCart";
import { toast } from "sonner";
import CartSuccessModal from "@/src/components/CartSuccessModal";
import { Product } from "@/lib/types/product";
import WishlistButton from "@/src/components/WishlistButton";
import { ProductVariant } from "@/lib/types/variant";
import { productApi } from "@/lib/api/products";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttributeValueRef {
  id: number;
  value: string;
  attributeId: number;
  attribute: { id: number; name: string };
}

interface VariantAttribute {
  valueId: number;
  variantId: number;
  value: AttributeValueRef;
}

interface VariantWithAttrs extends ProductVariant {
  attributes: VariantAttribute[];
  expiryDate?: string | null;
  images?: { url: string; displayOrder: number }[];
  id: number;
}

interface ProductSpecification {
  title: string;
  value: string;
}

interface ProductWithAttrs extends Product {
  displayVariant?: VariantWithAttrs | null;
  variants: VariantWithAttrs[];
  shortDescription?: string;
  productSpecifications?: ProductSpecification[];
  variantSpecifications?: ProductSpecification[];
  effectivePrice?: number;
  displayPrice?: number;
  displayDiscountPrice?: number | null;
  requiresSelection?: boolean;
}

interface ClientProductViewProps {
  product: ProductWithAttrs;
  baseUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullUrl(url: string, baseUrl: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${baseUrl}/${url.replace(/^\/+/, "")}`;
}

function getExpiryBadge(expiryDate?: string | null) {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMonths =
    (exp.getFullYear() - now.getFullYear()) * 12 +
    (exp.getMonth() - now.getMonth());
  if (diffMonths <= 0) return null;
  if (diffMonths >= 12)
    return {
      text: "بیش از ۱ سال تا انقضا",
      className: "bg-green-50 text-[#16A34A] border-green-200",
    };
  if (diffMonths >= 6)
    return {
      text: "بیش از ۶ ماه تا انقضا",
      className: "bg-green-50 text-[#16A34A] border-green-200",
    };
  if (diffMonths >= 3)
    return {
      text: "بیش از ۳ ماه تا انقضا",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
  if (diffMonths >= 1)
    return {
      text: "کمتر از ۳ ماه تا انقضا",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    };
  return {
    text: "نزدیک به تاریخ انقضا",
    className: "bg-red-50 text-[#E53935] border-red-200",
  };
}

function buildAttributeGroups(variants: VariantWithAttrs[]) {
  const groups = new Map<
    number,
    { name: string; values: Map<number, string> }
  >();
  for (const v of variants) {
    for (const a of v.attributes ?? []) {
      if (!a?.value?.attribute) continue;
      const attrId = a.value.attribute.id;
      const attrName = a.value.attribute.name;
      if (!groups.has(attrId))
        groups.set(attrId, { name: attrName, values: new Map() });
      groups.get(attrId)!.values.set(a.valueId, a.value.value);
    }
  }
  return Array.from(groups.entries()).map(([attrId, { name, values }]) => ({
    attrId,
    name,
    values: Array.from(values.entries()).map(([id, value]) => ({ id, value })),
  }));
}

function findMatchingVariant(
  variants: VariantWithAttrs[],
  selected: Record<number, number>,
): VariantWithAttrs | undefined {
  return variants.find((v) =>
    Object.entries(selected).every(([attrId, valueId]) =>
      v.attributes?.some(
        (a) =>
          a?.value?.attribute?.id === Number(attrId) && a.valueId === valueId,
      ),
    ),
  );
}

function isValueAvailable(
  variants: VariantWithAttrs[],
  selected: Record<number, number>,
  attrId: number,
  valueId: number,
): boolean {
  const hypothetical = { ...selected, [attrId]: valueId };
  return variants.some((v) =>
    Object.entries(hypothetical).every(([aid, vid]) =>
      v.attributes?.some(
        (a) => a?.value?.attribute?.id === Number(aid) && a.valueId === vid,
      ),
    ),
  );
}

function buildImages(
  variant: VariantWithAttrs | undefined,
  product: ProductWithAttrs,
  baseUrl: string,
) {
  if (variant?.images?.length) {
    const sorted = [...variant.images].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    return {
      main: fullUrl(sorted[0].url, baseUrl),
      thumbnails: sorted.map((i) => fullUrl(i.url, baseUrl)),
    };
  }
  return { main: fullUrl(product.imageUrl, baseUrl), thumbnails: [] };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TruckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00B4D8"
      strokeWidth="1.8"
    >
      <path d="M3 16V6a1 1 0 0 1 1-1h10v11H4a1 1 0 0 1-1-1Z" />
      <path d="M14 9h4l3 3v4h-7V9Z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00B4D8"
      strokeWidth="1.8"
    >
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function HeadsetIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00B4D8"
      strokeWidth="1.8"
    >
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientProductView({
  product,
  baseUrl,
}: ClientProductViewProps) {
  const variants = product.variants ?? [];

  const initialSelected = useMemo<Record<number, number>>(() => {
    const dv = product.displayVariant;
    if (!dv?.attributes?.length) return {};
    return Object.fromEntries(
      dv.attributes
        .filter((a) => a?.value?.attribute?.id != null)
        .map((a) => [a.value.attribute.id, a.valueId]),
    );
  }, [product.displayVariant]);

  const [selectedAttrs, setSelectedAttrs] =
    useState<Record<number, number>>(initialSelected);
  const [count, setCount] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "questions">(
    "specs",
  );

  const selectedVariant = useMemo(
    () =>
      findMatchingVariant(variants, selectedAttrs) ??
      product.displayVariant ??
      undefined,
    [variants, selectedAttrs, product.displayVariant],
  );

  const { main: mainImageBase, thumbnails: thumbnailsBase } = useMemo(
    () => buildImages(selectedVariant, product, baseUrl),
    [selectedVariant, product, baseUrl],
  );

  const [mainImage, setMainImage] = useState(mainImageBase);

  useEffect(() => {
    setMainImage(mainImageBase);
  }, [mainImageBase]);

  const attributeGroups = useMemo(
    () => buildAttributeGroups(variants),
    [variants],
  );

  const handleSelectAttr = useCallback((attrId: number, valueId: number) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrId]: valueId }));
  }, []);

  const price = useMemo(
    () => Number(selectedVariant?.price ?? 0),
    [selectedVariant],
  );
  const discount = useMemo(
    () => Number(selectedVariant?.discountPrice ?? 0),
    [selectedVariant],
  );
  const hasDiscount = discount > 0 && discount < price;

  const effectivePrice = hasDiscount ? discount : price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discount) / price) * 100)
    : null;
  const isOutOfStock = useMemo(
    () => !selectedVariant || (selectedVariant.stock ?? 0) === 0,
    [selectedVariant],
  );

  const expiryBadge = getExpiryBadge(selectedVariant?.expiryDate);
  const specifications = product.productSpecifications ?? [];

  const { data: breadcrumb } = useQuery<Breadcrumb[]>({
    queryKey: ["breadcrumb", product.categoryId],
    queryFn: async () => {
      if (!product.categoryId) return [];
      const chain: Breadcrumb[] = [];
      let current = await categoryApi.getById(product.categoryId);
      while (current?.parentId) {
        chain.unshift(current);
        current = await categoryApi.getById(current.parentId);
      }
      if (current) chain.unshift(current);
      return chain;
    },
    enabled: !!product.categoryId,
  });
  const { data: similarProducts } = useQuery<Product[]>({
    queryKey: ["similar", product.id],
    queryFn: () => productApi.getSimilarProducts(product.id),
    enabled: !!product.id,
  });
  const viewSentRef = useRef(false);
  useEffect(() => {
    if (!product?.id || viewSentRef.current) return;
    const viewedKey = `viewed_product_${product.id}`;
    const lastView = localStorage.getItem(viewedKey);
    if (lastView && Number(lastView) > Date.now() - 6 * 60 * 60 * 1000) return;
    viewSentRef.current = true;
    api
      .post(`/products/${product.id}/view`)
      .then(() => localStorage.setItem(viewedKey, Date.now().toString()))
      .catch((err) => console.error("خطا در افزایش viewCount:", err));
  }, [product?.id]);

  const { addItem, isAdding } = useCart();

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant?.id) {
      toast.error("لطفاً ویژگی‌های محصول را انتخاب کنید");
      return;
    }
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: count,
        priceAtAdd: hasDiscount ? discount : price, // یا effectivePrice بک‌اند
        product: { name: product.name, brand: product.brand },
        variant: { attributes: selectedVariant.attributes ?? [] },
      },
      {
        onSuccess: () => {
          setShowPopup(true);
          setCount(1);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.error ??
              err?.error ??
              err?.message ??
              "خطا در افزودن به سبد خرید",
          );
        },
      },
    );
  }, [selectedVariant, product.id, count, addItem]);

  const PurchaseActions = (
    <div className="flex flex-row gap-3 items-stretch">
      <div className="flex flex-row items-center justify-between border border-[#EDEDED] rounded-xl h-[52px] px-3 w-[120px] shrink-0">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="text-[#242424] text-xl w-7 h-7 flex items-center justify-center hover:text-[#00B4D8]"
        >
          +
        </button>
        <span className="text-[15px] font-semibold select-none">{count}</span>
        <button
          onClick={() => setCount((c) => (c > 1 ? c - 1 : 1))}
          className="text-[#242424] text-xl w-7 h-7 flex items-center justify-center hover:text-[#00B4D8]"
        >
          –
        </button>
      </div>
      {isOutOfStock ? (
        <button
          disabled
          className="flex-1 h-[52px] bg-gray-100 text-[#6B7280] rounded-xl cursor-not-allowed text-[14px] font-medium"
        >
          ناموجود
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex-1 flex items-center justify-center gap-2 h-[52px] rounded-xl font-medium text-[15px] transition-all duration-200 ${
            isAdding
              ? "bg-gray-300 text-white cursor-wait"
              : "bg-gradient-to-l from-[#00B4D8] to-[#0077B6] text-white hover:opacity-90 hover:shadow-md"
          }`}
        >
          {isAdding ? "در حال افزودن..." : "افزودن به سبد خرید"}
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="w-[92%] lg:w-[85%] mx-auto flex flex-col mt-6 lg:mt-8 font-vazirmatn text-[#242424] pb-24 lg:pb-8">
        {/* Breadcrumb */}
        <div className="text-[#6B7280] text-[13px] lg:text-[14px] mb-4 lg:mb-6 flex gap-1 items-center flex-wrap">
          {breadcrumb?.map((cat, i) => (
            <span key={cat.id} className="flex items-center gap-1">
              <Link
                href={`/categories/${cat.slug}?id=${cat.id}`}
                className="hover:text-[#0077B6] transition-colors"
              >
                {cat.name}
              </Link>
              {i < breadcrumb.length && <span>›</span>}
            </span>
          ))}
          <span className="text-[#0077B6] font-semibold">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">
          {/* Info column */}
          <div className="order-2 lg:order-1 h-fit bg-white rounded-2xl border border-[#EDEDED] shadow-sm p-6 lg:p-8 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-2xl lg:text-3xl text-[#242424] leading-snug">
                  {product.name}
                </h1>
                {product.brand && (
                  <Link
                    href={`/brands/${product.brand.slug}`}
                    className="text-[13px] lg:text-[14px] text-[#0077B6] hover:underline w-fit"
                  >
                    {product.brand.name}
                  </Link>
                )}
              </div>
              <WishlistButton
                productId={product.id}
                size={26}
                showLabel={false}
              />
            </div>

            {product.shortDescription && (
              <div className="bg-[#F0FAFF] border border-[#BAE6FD] rounded-xl p-4">
                <p className="text-[14px] leading-[26px] text-[#0369A1]">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Price & badges */}
            <div className="flex flex-col gap-1">
              {hasDiscount && (
                <span className="text-[14px] text-[#E53935] line-through decoration-[#E53935] w-fit">
                  {price.toLocaleString("fa-IR")} تومان
                </span>
              )}
              <span className="text-[28px] lg:text-[32px] font-bold text-[#242424]">
                {effectivePrice.toLocaleString("fa-IR")}{" "}
                <span className="text-[14px] font-normal text-[#6B7280]">
                  تومان
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {!isOutOfStock && (
                  <span className="text-[11px] text-[#16A34A] font-medium bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                    موجود در انبار
                  </span>
                )}
                {expiryBadge && (
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${expiryBadge.className}`}
                  >
                    {expiryBadge.text}
                  </span>
                )}
              </div>
            </div>

            {/* Attribute selectors */}
            {attributeGroups.map(({ attrId, name, values }) => (
              <div key={attrId} className="flex flex-col gap-2">
                <span className="font-bold text-[#242424] text-[14px]">
                  {name}:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {values.map(({ id, value }) => {
                    const available = isValueAvailable(
                      variants,
                      selectedAttrs,
                      attrId,
                      id,
                    );
                    const selected = selectedAttrs[attrId] === id;
                    return (
                      <button
                        key={`${attrId}-${id}`}
                        disabled={!available}
                        onClick={() => handleSelectAttr(attrId, id)}
                        className={`px-4 py-2 rounded-full border text-[13px] font-medium transition-colors duration-200 relative
                          ${selected ? "bg-[#00B4D8] text-white border-[#00B4D8]" : ""}
                          ${!available ? "border-[#EDEDED] text-[#9CA3AF] cursor-not-allowed line-through" : ""}
                          ${available && !selected ? "border-[#EDEDED] text-[#242424] hover:border-[#00B4D8] hover:text-[#0077B6]" : ""}
                        `}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="hidden lg:block pt-2 border-t border-[#EDEDED] mt-2">
              {PurchaseActions}
            </div>
          </div>

          {/* Gallery column */}
          <div
            dir="ltr"
            className="order-1 lg:order-2 flex flex-col lg:flex-row-reverse gap-3"
          >
            <div className="flex-1 relative bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">
              {hasDiscount && (
                <div className="absolute top-3 right-3 z-10 bg-[#E53935] text-white text-[13px] font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                  %{discountPercent}
                </div>
              )}
              <div className="w-full h-[340px] lg:h-[540px] flex items-center justify-center overflow-hidden">
                {/* Mobile */}
                <img
                  src={mainImage}
                  alt={product.name}
                  className="lg:hidden w-full h-full object-contain"
                />

                {/* Desktop */}
                <div className="hidden lg:flex w-full h-full items-center justify-center">
                  <InnerImageZoom
                    src={mainImage}
                    zoomSrc={mainImage}
                    zoomType="hover"
                    zoomScale={1.8}
                    className="max-w-full max-h-full"
                  />
                </div>
              </div>
            </div>
            {thumbnailsBase.length > 0 && (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[540px] lg:w-[84px] shrink-0 pb-1 lg:pb-0">
                {thumbnailsBase.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(thumb)}
                    className={`w-[72px] h-[72px] lg:w-[84px] lg:h-[84px] rounded-xl border-2 transition-colors duration-200 overflow-hidden shrink-0 bg-white ${
                      mainImage === thumb
                        ? "border-[3px] border-[#00B4D8] shadow-sm"
                        : "border-[#EDEDED] hover:border-[#B8E8F5]"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`تصویر ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="mt-6 bg-white border border-[#EDEDED] rounded-2xl shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-[#EDEDED] divide-x-reverse">
            {[
              {
                Icon: TruckIcon,
                title: "ارسال سریع",
                sub: "ارسال در اولین روز",
              },
              {
                Icon: ShieldIcon,
                title: "ضمانت اصالت کالا",
                sub: "ضمانت ۱۰۰٪ اصالت",
              },
              {
                Icon: HeadsetIcon,
                title: "پشتیبانی ",
                sub: " پاسخگوی شما هستیم",
              },
            ].map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="flex flex-col items-center justify-center py-5 gap-2"
              >
                <Icon />
                <span className="text-[14px] font-bold text-[#242424]">
                  {title}
                </span>
                <span className="text-[12px] text-[#9CA3AF]">{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs: مشخصات | نقد و بررسی | پرسش و پاسخ */}
        <div className="mt-6 bg-white border border-[#EDEDED] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-[#EDEDED]">
            {[
              { key: "specs" as const, label: "مشخصات" },
              { key: "description" as const, label: "توضیحات" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 px-6 py-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === key
                    ? "text-[#00B4D8] bg-[#F0FAFF]"
                    : "text-[#6B7280] hover:text-[#0077B6]"
                }`}
              >
                {label}
                {activeTab === key && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00B4D8]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "specs" &&
              (specifications.length > 0 ? (
                <table className="w-full text-right">
                  <tbody>
                    {specifications.map((spec, i) => (
                      <tr
                        key={`${spec.title}-${i}`}
                        className={i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}
                      >
                        <td className="px-4 py-3 text-[13px] text-[#6B7280] w-[40%] font-medium">
                          {spec.title}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#242424]">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[#9CA3AF] text-[14px]">
                  مشخصاتی برای نمایش وجود ندارد.
                </p>
              ))}

            {activeTab === "description" &&
              (product.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="text-[14px] leading-[28px] text-[#6B7280]"
                />
              ) : (
                <p className="text-[#9CA3AF] text-[14px]">
                  توضیحاتی برای نمایش وجود ندارد.
                </p>
              ))}
          </div>
        </div>

        {/* Description (اختیاری — می‌تونی این بخش رو توی یکی از تب‌ها جا ب */}

        {/* Related Products (محصولات مشابه) */}
        {/* Related Products */}
        {/* محصولات مشابه */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-8 bg-white border border-[#EDEDED] rounded-2xl shadow-sm p-6">
            <h3 className="text-[18px] font-bold text-[#242424] mb-5">
              محصولات مشابه
            </h3>
            <div
              className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: "none" }}
              onMouseDown={(e) => {
                const el = e.currentTarget;
                let startX = e.pageX - el.offsetLeft;
                let scrollLeft = el.scrollLeft;
                const onMove = (ev: MouseEvent) => {
                  el.scrollLeft =
                    scrollLeft - (ev.pageX - el.offsetLeft - startX);
                };
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            >
              {(similarProducts ?? []).slice(0, 10).map((p) => {
                const dv = (p as ProductWithAttrs).displayVariant;
                const imgUrl = dv?.images?.[0]?.url
                  ? fullUrl(dv.images[0].url, baseUrl)
                  : fullUrl(p.imageUrl, baseUrl);
                const price = Number(dv?.price ?? 0);
                const discount = Number(dv?.discountPrice ?? 0);
                const effective =
                  discount > 0 && discount < price ? discount : price;

                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}-${p.slug}`}
                    className="border border-[#EDEDED] rounded-xl p-3 hover:shadow-md transition-shadow flex flex-col flex-shrink-0 w-[180px]"
                    draggable={false}
                  >
                    <div className="bg-[#F9FAFB] rounded-lg h-[140px] mb-3 overflow-hidden flex items-center justify-center relative">
                      {discount > 0 && discount < price && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[11px] font-bold rounded-full w-9 h-9 flex items-center justify-center z-10">
                          {Math.round((1 - discount / price) * 100)}٪
                        </span>
                      )}
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="h-full w-full object-contain p-2"
                          draggable={false}
                        />
                      ) : (
                        <span className="text-[#9CA3AF] text-[13px]">
                          بدون تصویر
                        </span>
                      )}
                    </div>
                    {p.brand && (
                      <span className="text-[11px] text-[#9CA3AF] mb-1">
                        {typeof p.brand === "string" ? p.brand : p.brand.name}
                      </span>
                    )}

                    <h4 className="text-[14px] font-semibold text-[#242424] line-clamp-2 mb-2 flex-1">
                      {p.name}
                    </h4>
                    {discount > 0 && discount < price && (
                      <span className="text-[12px] text-[#9CA3AF] line-through">
                        {price.toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                    <span className="text-[15px] font-bold text-[#00B4D8]">
                      {effective.toLocaleString("fa-IR")} تومان
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-[64px] inset-x-0 z-50 bg-white border-t border-[#EDEDED] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3 font-vazirmatn">
        {" "}
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[12px] text-[#E53935] line-through leading-none">
                {price.toLocaleString("fa-IR")}
              </span>
            )}
            <span className="text-[17px] font-bold text-[#242424] leading-tight">
              {effectivePrice.toLocaleString("fa-IR")}{" "}
              <span className="text-[12px] font-normal text-[#6B7280]">
                تومان
              </span>
            </span>
          </div>
          <div className="flex gap-2 flex-1 items-center">
            <div className="flex flex-row items-center justify-between border border-[#EDEDED] rounded-xl h-[44px] px-2 w-[100px] shrink-0">
              <button
                onClick={() =>
                  setCount((c) =>
                    selectedVariant && c < selectedVariant.stock ? c + 1 : c,
                  )
                }
                className="text-[#242424] text-lg w-6 h-6 flex items-center justify-center hover:text-[#00B4D8]"
              >
                +
              </button>
              <span className="text-[14px] font-semibold select-none">
                {count}
              </span>
              <button
                onClick={() => setCount((c) => (c > 1 ? c - 1 : 1))}
                className="text-[#242424] text-lg w-6 h-6 flex items-center justify-center hover:text-[#00B4D8]"
              >
                –
              </button>
            </div>
            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 h-[44px] bg-gray-100 text-[#6B7280] rounded-xl cursor-not-allowed text-[13px] font-medium"
              >
                ناموجود
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 h-[44px] rounded-xl font-medium text-[14px] transition-all duration-200 ${
                  isAdding
                    ? "bg-gray-300 text-white cursor-wait"
                    : "bg-gradient-to-l from-[#00B4D8] to-[#0077B6] text-white hover:opacity-90"
                }`}
              >
                {isAdding ? "در حال افزودن..." : "افزودن به سبد"}
              </button>
            )}
          </div>
        </div>
      </div>

      <CartSuccessModal show={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
