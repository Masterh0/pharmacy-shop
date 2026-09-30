"use client";

import React, { useState, useEffect } from "react";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { ArrowDown2 } from "iconsax-react";

interface PersianDatePickerProps {
  value?: string;
  onChange: (isoDate: string) => void;
}

const PERSIAN_MONTHS = [
  { value: 1, label: "فروردین" },
  { value: 2, label: "اردیبهشت" },
  { value: 3, label: "خرداد" },
  { value: 4, label: "تیر" },
  { value: 5, label: "مرداد" },
  { value: 6, label: "شهریور" },
  { value: 7, label: "مهر" },
  { value: 8, label: "آبان" },
  { value: 9, label: "آذر" },
  { value: 10, label: "دی" },
  { value: 11, label: "بهمن" },
  { value: 12, label: "اسفند" },
];

const toPersianNum = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function PersianDatePicker({
  value,
  onChange,
}: PersianDatePickerProps) {
  const currentJalaliYear = toJalaali(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  ).jy;

  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");

  useEffect(() => {
    if (!value) return;
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        setYear(j.jy);
        setMonth(j.jm);
        setDay(j.jd);
      }
    } catch (e) {
      console.error("Invalid ISO date", e);
    }
  }, [value]);

  const handleDateChange = (
    newYear: number | "",
    newMonth: number | "",
    newDay: number | "",
  ) => {
    if (newYear && newMonth && newDay) {
      const maxDays = jalaaliMonthLength(newYear, newMonth);
      const validDay = Math.min(newDay, maxDays);
      if (validDay !== newDay) setDay(validDay);

      const g = toGregorian(newYear, newMonth, validDay);
      const pad = (n: number) => String(n).padStart(2, "0");
      const iso = `${g.gy}-${pad(g.gm)}-${pad(g.gd)}T00:00:00.000Z`;
      onChange(iso);
    }
  };

  const years = Array.from(
    { length: currentJalaliYear - 1315 + 1 },
    (_, i) => currentJalaliYear - i,
  );

  const daysInSelectedMonth =
    year && month ? jalaaliMonthLength(Number(year), Number(month)) : 31;
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-3 gap-2 w-full" dir="rtl">
      {/* روز */}
      <div className="relative">
        <select
          value={day}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : "";
            setDay(val);
            handleDateChange(year, month, val);
          }}
          className="w-full h-11 pr-3 pl-7 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00B4D8] rounded-xl text-xs sm:text-sm font-medium text-gray-800 appearance-none focus:outline-none transition shadow-sm cursor-pointer"
        >
          <option value="" disabled>
            روز
          </option>
          {days.map((d) => (
            <option key={d} value={d}>
              {toPersianNum(d)}
            </option>
          ))}
        </select>
        <ArrowDown2
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* ماه */}
      <div className="relative">
        <select
          value={month}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : "";
            setMonth(val);
            handleDateChange(year, val, day);
          }}
          className="w-full h-11 pr-3 pl-7 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00B4D8] rounded-xl text-xs sm:text-sm font-medium text-gray-800 appearance-none focus:outline-none transition shadow-sm cursor-pointer"
        >
          <option value="" disabled>
            ماه
          </option>
          {PERSIAN_MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ArrowDown2
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* سال */}
      <div className="relative">
        <select
          value={year}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : "";
            setYear(val);
            handleDateChange(val, month, day);
          }}
          className="w-full h-11 pr-3 pl-7 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00B4D8] rounded-xl text-xs sm:text-sm font-medium text-gray-800 appearance-none focus:outline-none transition shadow-sm cursor-pointer"
        >
          <option value="" disabled>
            سال
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {toPersianNum(y)}
            </option>
          ))}
        </select>
        <ArrowDown2
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
