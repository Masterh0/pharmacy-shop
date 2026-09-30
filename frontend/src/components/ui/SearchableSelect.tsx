"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface Option {
  id: number;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
  error?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید",
  error,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => setOpen((p) => !p)}
        className={`w-full h-[40px] border px-3 text-[13px] rounded-[8px] flex items-center justify-between cursor-pointer bg-white ${
          error ? "border-red-500" : "border-[#D6D6D6]"
        }`}
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.name : placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#D6D6D6] rounded-[8px] shadow-md max-h-[220px] overflow-y-auto">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="w-full h-[36px] px-3 text-[13px] border-b border-[#D6D6D6] outline-none"
          />

          <div
            onClick={() => {
              onChange(undefined);
              setOpen(false);
              setSearch("");
            }}
            className="px-3 py-2 text-[13px] text-gray-400 cursor-pointer hover:bg-gray-50"
          >
            انتخاب کنید
          </div>

          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-gray-400">
              نتیجه‌ای یافت نشد
            </div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.id}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                  setSearch("");
                }}
                className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 ${
                  o.id === value ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {o.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
