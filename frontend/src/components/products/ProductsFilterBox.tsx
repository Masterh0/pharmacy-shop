"use client";

import { useRouter, useSearchParams } from "next/navigation";

/* ---------- Types ---------- */
type Brand = {
  id: number;
  name: string;
};

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
};

export default function ProductsFilterBox({ brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* =================================================
   ✅ URL = Single Source of Truth (READ)
  ================================================= */
  const min = Number(searchParams.get("minPrice")) || MIN;
  const max = Number(searchParams.get("maxPrice")) || MAX;

  const hasDiscount = searchParams.get("discount") === "1";
  const inStock = searchParams.get("available") === "1";

  const selectedBrands = searchParams.getAll("brand");

  /* =================================================
   ✅ helper (WRITE URL)
  ================================================= */
  const updateParams = (updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    updater(params);
    console.log("[router.push]", params.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  /* =================================================
   ✅ handlers (URL ONLY)
  ================================================= */
  const setDiscount = (v: boolean) =>
    updateParams((p) =>
      v ? p.set("discount", "1") : p.delete("discount")
    );

  const setStock = (v: boolean) =>
    updateParams((p) =>
      v ? p.set("available", "1") : p.delete("available")
    );

  const setMinPrice = (v: number) =>
    updateParams((p) => p.set("minPrice", String(v)));

  const setMaxPrice = (v: number) =>
    updateParams((p) => p.set("maxPrice", String(v)));

  const toggleBrand = (id: number) =>
    updateParams((p) => {
      const current = p.getAll("brand");
      p.delete("brand");

      const next = current.includes(String(id))
        ? current.filter((b) => b !== String(id))
        : [...current, String(id)];

      next.forEach((b) => p.append("brand", b));
    });

  const clearFilters = () => router.push("?");

  /* =================================================
   ✅ render
  ================================================= */
  return (
    <aside className="sticky top-24 w-[288px] shrink-0 mt-12 mr-12 rounded-lg border border-[#D6D6D6] bg-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
        <span className="text-[16px] font-medium text-[#242424]">
          فیلترها
        </span>
        <button
          onClick={clearFilters}
          className="text-[11px] font-semibold text-[#00B4D8]"
        >
          حذف فیلترها
        </button>
      </div>

      {/* Brand */}
      <div className="border-b border-[#E5E5E5] pb-2">
        <span className="block text-[14px] text-[#434343] mb-2">
          برند
        </span>
        <div className="flex flex-col gap-2 max-h-48 overflow-auto">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 text-[13px] text-[#242424]"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(String(brand.id))}
                onChange={() => toggleBrand(brand.id)}
              />
              {brand.name}
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div className="flex items-center justify-between py-2 border-b border-[#E5E5E5]">
        <span className="text-[14px] text-[#434343]">تخفیف‌دار</span>
        <ToggleSwitch checked={hasDiscount} onChange={setDiscount} />
      </div>

      {/* In stock */}
      <div className="flex items-center justify-between py-2 border-b border-[#E5E5E5]">
        <span className="text-[14px] text-[#434343]">
          فقط کالاهای موجود
        </span>
        <ToggleSwitch checked={inStock} onChange={setStock} />
      </div>

      {/* Price */}
      <div dir="ltr" className="pt-2">
        <div className="relative h-6">
          <div className="absolute inset-y-1/2 -translate-y-1/2 h-2 w-full rounded bg-[#E5E5E5]" />
          <div
            className="absolute inset-y-1/2 -translate-y-1/2 h-2 rounded bg-[#00B4D8]"
            style={{
              left: `${(min / MAX) * 100}%`,
              right: `${100 - (max / MAX) * 100}%`,
            }}
          />
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={min}
            onChange={(e) =>
              setMinPrice(Math.min(+e.target.value, max - STEP))
            }
            className="range-thumb"
          />
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={max}
            onChange={(e) =>
              setMaxPrice(Math.max(+e.target.value, min + STEP))
            }
            className="range-thumb"
          />
        </div>

        <div className="flex justify-between mt-3 text-[12px] text-[#434343]">
          <span>{min.toLocaleString("fa-IR")} تومان</span>
          <span>{max.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
    </aside>
  );
}
