import { useState } from "react";
import iranGeo from "@/src/data/iranGeo.json";

export default function ProvinceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const provinces = Object.keys(iranGeo);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#656565] text-sm">استان</label>
      <input
        list="province-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="انتخاب یا جستجو استان..."
        className="border border-[#656565] rounded-lg px-3 py-2 text-sm"
      />
      <datalist id="province-list">
        {provinces.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}
