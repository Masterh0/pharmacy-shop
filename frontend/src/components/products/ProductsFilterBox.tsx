"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Brand } from "@/lib/types/brand";
/* ---------- Types ---------- */

/* ---------- Constants ---------- */
const MIN = 0;
const MAX = 20_000_000;
const STEP = 100_000;

/* ---------- Toggle Switch ---------- */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-10 h-5 rounded-full bg-[#E5E5E5] peer-checked:bg-[#00B4D8] transition-colors" />
      <span className="absolute top-[2px] right-[2px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-[-20px]" />
    </label>
  );
}

/* ---------- Props ---------- */
type Props = {
  brands: Brand[];
  onApply?: () => void;
};

export default function ProductsFilterBox({ brands, onApply }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /* =================================================
   ✅ URL → READ (Source of Truth)
  ================================================= */
  const min = Number(searchParams.get("minPrice")) || MIN;
  const max = Number(searchParams.get("maxPrice")) || MAX;
  const hasDiscount = searchParams.get("discount") === "1";
  const inStock = searchParams.get("available") === "1";
  const selectedBrands = searchParams.getAll("brand");

  /* =================================================
   ✅ UI Draft State (TEMP)
  ================================================= */
  const [draft, setDraft] = useState({
    minPrice: min,
    maxPrice: max,
    brands: selectedBrands,
    discount: hasDiscount,
    available: inStock,
  });

  const [brandSearch, setBrandSearch] = useState("");

  /* sync draft when URL changes */
  useEffect(() => {
    setDraft({
      minPrice: min,
      maxPrice: max,
      brands: selectedBrands,
      discount: hasDiscount,
      available: inStock,
    });
  }, [searchParams]);

  /* =================================================
   ✅ Accordion state
  ================================================= */
  const [open, setOpen] = useState({
    brand: false,
    price: false,
  });

  /* =================================================
   ✅ Filter brands by search
  ================================================= */
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  /* =================================================
   ✅ helper → WRITE URL (ONLY ON APPLY)
  ================================================= */
  const applyFilters = () => {
    const q = searchParams.get("q");
    const currentLimit = searchParams.get("limit") || "12";

    const params = new URLSearchParams();

    if (q) params.set("q", q);
    params.set("page", "1");
    params.set("limit", currentLimit);

    draft.brands.forEach((b) => params.append("brand", b));
    if (draft.discount) params.set("discount", "1");
    if (draft.available) params.set("available", "1");
    params.set("minPrice", String(draft.minPrice));
    params.set("maxPrice", String(draft.maxPrice));

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onApply?.();
  };

  const clearFilters = () => {
    const q = searchParams.get("q");
    const currentLimit = searchParams.get("limit") || "12";

    const params = new URLSearchParams();

    if (q) params.set("q", q);
    params.set("page", "1");
    params.set("limit", currentLimit);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onApply?.();
  };

  /* =================================================
   ✅ render
  ================================================= */
  return (
    <aside className="lg:sticky lg:top-[96px] lg:self-start w-full lg:w-[288px] lg:shrink-0 lg:mt-12 rounded-xl border border-[#D6D6D6] bg-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
        <span className="text-[16px] font-medium text-[#242424]">فیلترها</span>
        <button
          onClick={clearFilters}
          className="text-[11px] font-semibold text-[#00B4D8]"
        >
          حذف فیلترها
        </button>
      </div>

      {/* ================= Brand (Accordion) ================= */}
      <div className="rounded-lg border border-[#E5E5E5]">
        <button
          onClick={() => setOpen((s) => ({ ...s, brand: !s.brand }))}
          className="w-full flex items-center justify-between p-3 text-[14px] font-medium"
        >
          برند
          <span
            className={`transition-transform ${open.brand ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {open.brand && (
          <div className="px-3 pb-3">
            <input
              type="text"
              placeholder="جستجوی برند..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 text-[13px] border border-[#E5E5E5] rounded-md focus:outline-none focus:border-[#00B4D8]"
            />
            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00B4D8]/40">
              {filteredBrands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 py-1 text-[13px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={draft.brands.includes(String(brand.id))}
                    onChange={() =>
                      setDraft((d) => ({
                        ...d,
                        brands: d.brands.includes(String(brand.id))
                          ? d.brands.filter((b) => b !== String(brand.id))
                          : [...d.brands, String(brand.id)],
                      }))
                    }
                  />
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {brand.name} ({brand.count ?? 0})
                    </span>
                  </div>
                </label>
              ))}
              {filteredBrands.length === 0 && (
                <p className="text-[12px] text-gray-400 py-2">برندی یافت نشد</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= Discount ================= */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5E5]">
        <span className="text-[14px]">تخفیف‌دار</span>
        <ToggleSwitch
          checked={draft.discount}
          onChange={(v) => setDraft((d) => ({ ...d, discount: v }))}
        />
      </div>

      {/* ================= Stock ================= */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5E5]">
        <span className="text-[14px]">فقط کالاهای موجود</span>
        <ToggleSwitch
          checked={draft.available}
          onChange={(v) => setDraft((d) => ({ ...d, available: v }))}
        />
      </div>

      {/* ================= Price (Accordion) ================= */}
      <div className="rounded-lg border border-[#E5E5E5]">
        <button
          onClick={() => setOpen((s) => ({ ...s, price: !s.price }))}
          className="w-full flex items-center justify-between p-3 text-[14px] font-medium"
        >
          محدوده قیمت
          <span
            className={`transition-transform ${open.price ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {open.price && (
          <div dir="ltr" className="px-3 pb-4">
            <div className="relative h-6 mt-2">
              <div className="absolute inset-y-1/2 -translate-y-1/2 h-2 w-full rounded bg-[#E5E5E5]" />
              <div
                className="absolute inset-y-1/2 -translate-y-1/2 h-2 rounded bg-[#00B4D8]"
                style={{
                  left: `${(draft.minPrice / MAX) * 100}%`,
                  right: `${100 - (draft.maxPrice / MAX) * 100}%`,
                }}
              />

              <input
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={draft.minPrice}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    minPrice: Math.min(+e.target.value, d.maxPrice - STEP),
                  }))
                }
                className="range-thumb"
              />

              <input
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={draft.maxPrice}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    maxPrice: Math.max(+e.target.value, d.minPrice + STEP),
                  }))
                }
                className="range-thumb"
              />
            </div>

            <div className="flex justify-between mt-3 text-[12px]">
              <span>{draft.minPrice.toLocaleString("fa-IR")} تومان</span>
              <span>{draft.maxPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= Apply ================= */}
      <button
        onClick={applyFilters}
        className="mt-2 w-full rounded-lg bg-[#00B4D8] py-3 text-white text-[14px] font-semibold"
      >
        اعمال فیلتر
      </button>
    </aside>
  );
}
