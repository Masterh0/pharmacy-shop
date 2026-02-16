"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { categoryApi } from "@/lib/api/category";
import api from "@/lib/axios";
import InnerImageZoom from "react-inner-image-zoom";
import { useCart } from "@/lib/hooks/useAddToCart";
import { toast } from "sonner";
import CartSuccessModal from "@/src/components/CartSuccessModal";
import { Product, ProductVariant, Breadcrumb } from "@/lib/types/product";
import WishlistButton from "@/src/components/WishlistButton";
interface ClientProductViewProps {
  product: Product;
  variants: ProductVariant[];
  flavors: string[];
  packages: number[];
  baseUrl: string;
  initialVariant?: ProductVariant;
}

export default function ClientProductView({
  product,
  variants,
  flavors,
  packages,
  baseUrl,
  initialVariant,
  isOutOfStock,
}: ClientProductViewProps) {
  // 🔍 LOG 1: بررسی داده‌های اولیه
  console.log("🎯 === INITIAL DATA ===");
  console.log("📦 Product:", product);
  console.log("🎨 Variants:", variants);
  console.log("🍫 Flavors:", flavors);
  console.log("📦 Packages:", packages);
  console.log("🌐 BaseURL:", baseUrl);
  console.log("⭐ Initial Variant:", initialVariant);
  console.log("🖼️ Initial Variant Images:", initialVariant?.images);

  const [selectedFlavor, setSelectedFlavor] = useState(
    initialVariant?.flavor || ""
  );
  const [selectedPackage, setSelectedPackage] = useState(
    initialVariant?.packageQuantity || 0
  );
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >(initialVariant);
  const [count, setCount] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  // 🖼️ تصویر اصلی نمایشی (محصول یا واریانت)
  const [mainImage, setMainImage] = useState<string>(product.imageUrl);

  // 🎨 لیست تصاویر کوچک (thumbnails)
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // 🔍 LOG 2: بررسی state اولیه
  console.log("🎯 === INITIAL STATE ===");
  console.log("🎨 Selected Flavor:", selectedFlavor);
  console.log("📦 Selected Package:", selectedPackage);
  console.log("⭐ Selected Variant:", selectedVariant);
  console.log("🖼️ Main Image:", mainImage);
  console.log("🎨 Thumbnails:", thumbnails);

  function updateVariant(flavor: string, pkg: number) {
    console.log("\n🔄 === UPDATE VARIANT CALLED ===");
    console.log("🍫 Flavor:", flavor);
    console.log("📦 Package:", pkg);

    const found = variants.find(
      (v) =>
        (!flavor || v.flavor === flavor) && (!pkg || v.packageQuantity === pkg)
    );

    console.log("🔍 Found Variant:", found);
    console.log("🖼️ Found Variant Images:", found?.images);

    if (found) {
      setSelectedVariant(found);

      // ⭐ اگر واریانت عکس داشت، اولین عکسش رو نشون بده
      if (found.images && found.images.length > 0) {
        console.log("✅ Variant HAS images!");
        console.log("📸 Images Array:", found.images);

        const sortedImages = [...found.images].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        console.log("🔢 Sorted Images:", sortedImages);

        const firstImage = sortedImages[0].url;
        console.log("🖼️ First Image URL:", firstImage);

        const fullImageUrl = firstImage.startsWith("http")
          ? firstImage
          : `${baseUrl}${firstImage}`;

        console.log("🌐 Full Main Image URL:", fullImageUrl);
        setMainImage(fullImageUrl);

        const thumbnailUrls = sortedImages.map((img) => {
          const url = img.url.startsWith("http")
            ? img.url
            : `${baseUrl}${img.url}`;
          console.log(`🎨 Thumbnail ${img.displayOrder}:`, url);
          return url;
        });

        console.log("🎨 All Thumbnails:", thumbnailUrls);
        setThumbnails(thumbnailUrls);
      } else {
        console.log("❌ Variant has NO images - using product image");

        // ✅ اگه واریانت عکس نداشت، به تصویر اصلی محصول برگرد
        const productImageUrl = product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `${baseUrl}/${product.imageUrl.replace(/^\/+/, "")}`;

        console.log("🖼️ Fallback to Product Image:", productImageUrl);
        setMainImage(productImageUrl);
        setThumbnails([]);
      }
    } else {
      console.log("❌ NO variant found for flavor:", flavor, "package:", pkg);
    }
  }

  // 🔍 LOG 3: تغییرات state را رصد کن
  useEffect(() => {
    console.log("\n📊 === STATE CHANGED ===");
    console.log("⭐ Selected Variant:", selectedVariant);
    console.log("🖼️ Main Image:", mainImage);
    console.log("🎨 Thumbnails:", thumbnails);
  }, [selectedVariant, mainImage, thumbnails]);

  // 🔍 LOG 4: اولین واریانت رو بررسی کن
  useEffect(() => {
    console.log("\n🚀 === COMPONENT MOUNTED ===");

    if (initialVariant) {
      console.log("✅ Has initial variant");
      console.log("🖼️ Initial variant images:", initialVariant.images);

      // اگر واریانت اولیه عکس داشت، بارگذاری کن
      if (initialVariant.images && initialVariant.images.length > 0) {
        console.log("📸 Loading initial variant images...");
        updateVariant(
          initialVariant.flavor || "",
          initialVariant.packageQuantity || 0
        );
      }
    } else {
      console.log("⚠️ No initial variant");
    }
  }, []);

  const { data: breadcrumb } = useQuery<Breadcrumb[]>({
    queryKey: ["breadcrumb", product.categoryId],
    queryFn: async () => {
      if (!product.categoryId) return [];
      const chain: Breadcrumb[] = [];
      let current = await categoryApi.getById(product.categoryId);

      while (current && current.parentId) {
        chain.unshift(current);
        current = await categoryApi.getById(current.parentId);
      }

      if (current) chain.unshift(current);
      return chain;
    },
    enabled: !!product.categoryId,
  });

  useEffect(() => {
    window.scrollTo({ top: 250, behavior: "smooth" });
  }, []);

  const viewSentRef = useRef(false);
  useEffect(() => {
    if (!product?.id || viewSentRef.current) return;
    const viewedKey = `viewed_product_${product.id}`;
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const lastView = localStorage.getItem(viewedKey);

    if (lastView && Number(lastView) > sixHoursAgo) return;

    viewSentRef.current = true;
    api
      .post(`/products/${product.id}/view`)
      .then(() => {
        localStorage.setItem(viewedKey, Date.now().toString());
      })
      .catch((err) => console.error("❌ خطا در افزایش viewCount:", err));
  }, [product?.id]);

  const { addItem, isAdding } = useCart();

  function handleAddToCart() {
    if (!selectedVariant?.id) {
      toast.error("لطفاً طعم و بسته را انتخاب کنید");
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: count,
      },
      {
        onSuccess: () => {
          toast.success("✅ به سبد خرید اضافه شد");
          setShowPopup(true);
          setCount(1);
        },
        onError: (err: any) => {
          console.error("❌ خطا در افزودن به سبد:", err);

          // پیام خطا را با ترتیب اولویت زیر پیدا کن
          const message =
            err?.response?.data?.error || // برای axios
            err?.error || // برخی کتابخانه‌ها
            err?.message || // پیام عمومی جاوااسکریپت
            "خطا در افزودن به سبد خرید"; // پیام fallback فارسی

          toast.error(message);
        },
      }
    );
  }

  return (
    <>
      <div className="w-[85%] mx-auto flex flex-col mt-12 font-vazirmatn text-[#434343]">
        {/* 🗂️ Breadcrumb */}
        <div className="text-[#898989] text-[14px] mb-8 flex gap-1 items-center flex-wrap">
          {breadcrumb?.map((cat, i) => (
            <span key={cat.id} className="flex items-center gap-1">
              <Link
                href={`/categories/${cat.slug}?id=${cat.id}`}
                className={
                  i === breadcrumb.length
                    ? "text-[#0077B6] font-semibold"
                    : "hover:text-[#0077B6] transition-colors"
                }
              >
                {cat.name}
              </Link>
              {i < breadcrumb.length && <span>›</span>}
            </span>
          ))}
          <span className="text-[#0077B6] font-semibold">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-[64px] items-start">
          {/* 🖼️ بخش تصاویر */}
          <div className="flex flex-col gap-4">
            {/* 🔍 تصویر اصلی با زوم */}
            <div className="w-full max-w-[530px] h-[576px] bg-white rounded-[16px] flex items-center justify-center border border-[#EDEDED] overflow-hidden">
              <InnerImageZoom
                src={mainImage}
                zoomSrc={mainImage}
                zoomType="hover"
                zoomScale={1.8}
                className="rounded-[8px] object-contain w-full h-full"
              />
            </div>

            {/* 🎨 Thumbnails (فقط اگر واریانت عکس داشت) */}
            {thumbnails.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      console.log("🖱️ Thumbnail clicked:", thumb);
                      setMainImage(thumb);
                    }}
                    className={`
                      flex-shrink-0 w-[100px] h-[100px] rounded-[8px] 
                      border-2 transition-all overflow-hidden
                      ${
                        mainImage === thumb
                          ? "border-[#00B4D8] shadow-md"
                          : "border-[#EDEDED] hover:border-[#00B4D8]"
                      }
                    `}
                  >
                    <img
                      src={thumb}
                      alt={`تصویر ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📝 توضیحات محصول */}
          <div className="flex flex-col gap-8">
            <h1 className="text-[#000] text-[28px] font-bold">
              {product.name}
            </h1>
            <WishlistButton
              productId={product.id}
              size={28}
              showLabel={false}
            />
            <h3 className="border-b border-[#EDEDED] text-[#656565] pb-1 font-semibold text-lg">
              مشخصات محصول
            </h3>

            <div
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="text-[16px] leading-[32px] text-right space-y-2 [&_strong]:text-[#000]"
            />

            {/* 🍫 انتخاب طعم */}
            {flavors.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="font-bold text-[#000]">طعم:</span>
                <div className="flex gap-3 flex-wrap">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => {
                        console.log("🍫 Flavor selected:", flavor);
                        setSelectedFlavor(flavor);
                        updateVariant(flavor, selectedPackage);
                      }}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        flavor === selectedFlavor
                          ? "bg-[#00B4D8] text-white border-[#00B4D8]"
                          : "border-[#00B4D8] text-[#0077B6] hover:bg-[#E0F7FA]"
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 📦 انتخاب بسته */}
            {packages.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="font-bold text-[#000]">تعداد در بسته:</span>
                <div className="flex gap-3 flex-wrap">
                  {packages.map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => {
                        console.log("📦 Package selected:", pkg);
                        setSelectedPackage(pkg);
                        updateVariant(selectedFlavor, pkg);
                      }}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        pkg === selectedPackage
                          ? "bg-[#0077B6] text-white border-[#0077B6]"
                          : "border-[#00B4D8] text-[#0077B6] hover:bg-[#E0F7FA]"
                      }`}
                    >
                      {pkg} عدد
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 💰 قیمت و خرید */}
            <div className="mt-6 flex flex-col gap-8 w-full max-w-[392px]">
              <div className="flex flex-col gap-1">
                {selectedVariant?.discountPrice ? (
                  <>
                    <span className="text-[14px] text-[#E53935] line-through decoration-[#E53935]">
                      {Number(selectedVariant.price).toLocaleString("fa-IR")}{" "}
                      تومان
                    </span>
                    <span className="text-[24px] font-bold text-[#242424]">
                      {Number(selectedVariant.discountPrice).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </span>
                  </>
                ) : (
                  <span className="text-[24px] font-bold text-[#242424]">
                    {selectedVariant?.price
                      ? `${Number(selectedVariant.price).toLocaleString(
                          "fa-IR"
                        )} تومان`
                      : "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-row gap-6 items-center">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 text-gray-500 rounded-full cursor-not-allowed"
                  >
                    ناموجود
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`flex items-center justify-center gap-2 w-[184px] h-[48px] rounded-[8px] font-medium transition-all 
                    ${
                      isAdding
                        ? "bg-gray-400 cursor-wait"
                        : "bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white hover:opacity-90"
                    }`}
                  >
                    {isAdding ? "در حال افزودن..." : "افزودن به سبد خرید"}
                  </button>
                )}

                <div className="flex flex-row items-center justify-center border border-[#00B4D8] rounded-[8px] w-[184px] h-[48px] px-6 gap-4">
                  <button
                    onClick={() => setCount((c) => c + 1)}
                    className="text-[#00B4D8] text-xl"
                  >
                    +
                  </button>
                  <span className="text-[14px] font-medium text-[#00B4D8] select-none">
                    {count} عدد
                  </span>
                  <button
                    onClick={() => setCount((c) => (c > 1 ? c - 1 : 1))}
                    className="text-[#00B4D8] text-xl"
                  >
                    –
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ مودال موفقیت */}
      <CartSuccessModal show={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
