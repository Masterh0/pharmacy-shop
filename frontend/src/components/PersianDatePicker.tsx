"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "iconsax-react";

// تبدیل اعداد لاتین به فارسی
const toPersianNum = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// تبدیل اعداد فارسی به لاتین
const toEnglishNum = (n: string): string =>
  n.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

const PERSIAN_MONTHS = [
  "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
  "مهر","آبان","آذر","دی","بهمن","اسفند",
];

// تبدیل میلادی به شمسی
function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_no = [0,31,(gy%4===0&&gy%100!==0)||(gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let g_day_no = 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400);
  for (let i=0;i<gm;i++) g_day_no += g_d_no[i];
  g_day_no += gd - 1;
  let j_day_no = g_day_no - 79;
  const j_np = Math.floor(j_day_no/12053);
  j_day_no %= 12053;
  jy += 33*j_np + 4*Math.floor(j_day_no/1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) { jy += Math.floor((j_day_no-1)/365); j_day_no = (j_day_no-1)%365; }
  const j_days = [31,31,31,31,31,31,30,30,30,30,30,29];
  let jm = 0, jd = 0;
  for (let i=0;i<12;i++) { if (j_day_no < j_days[i]) { jm=i+1; jd=j_day_no+1; break; } j_day_no -= j_days[i]; }
  return [jy, jm, jd];
}

// تبدیل شمسی به میلادی
function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy += 1595;
  let days = -355779 + 365*jy + Math.floor(jy/33)*8 + Math.floor(((jy%33)+3)/4) + 78 + jd + (jm<7?(jm-1)*31:((jm-7)*30)+186);
  let gy = 400 * Math.floor(days/146097);
  days %= 146097;
  if (days > 36524) { gy += 100*Math.floor(--days/36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days/1461);
  days %= 1461;
  if (days > 365) { gy += Math.floor((days-1)/365); days = (days-1)%365; }
  const gd = days + 1;
  const sal_a = [0,31,((gy%4===0&&gy%100!==0)||(gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
  let gm = 0; let d = gd;
  for (let i=1;i<=12;i++) { if (d <= sal_a[i]) { gm=i; break; } d -= sal_a[i]; }
  return [gy, gm, d];
}

function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const [gy] = toGregorian(jy, 12, 1);
  return ((gy+1)%4===0&&(gy+1)%100!==0)||((gy+1)%400===0) ? 30 : 29;
}

function getFirstDayOfWeek(jy: number, jm: number): number {
  const [gy, gm, gd] = toGregorian(jy, jm, 1);
  const d = new Date(gy, gm-1, gd);
  return (d.getDay() + 1) % 7; // شنبه=0
}

// تبدیل تاریخ شمسی به ISO میلادی برای دیتابیس
function jalaliToISO(jy: number, jm: number, jd: number): string {
  const [gy, gm, gd] = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

// تبدیل ISO میلادی به تاریخ شمسی
function isoToJalali(iso: string): { jy: number; jm: number; jd: number } | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [jy, jm, jd] = toJalali(+match[1], +match[2], +match[3]);
  return { jy, jm, jd };
}

type Step = "year" | "month" | "day";

interface PersianDatePickerProps {
  value?: string; // ISO format: "YYYY-MM-DD" (میلادی)
  onChange?: (value: string) => void; // ISO format
  placeholder?: string;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ تولد",
}) => {
  const today = new Date();
  const [todayJY, todayJM, todayJD] = toJalali(today.getFullYear(), today.getMonth()+1, today.getDate());

  // پارس کردن مقدار اولیه
  const parseInitialValue = () => {
    if (!value) return { jy: 1380, jm: 1, jd: null, page: 115 }; // 1380/12 = 115
    const parsed = isoToJalali(value);
    if (!parsed) return { jy: 1380, jm: 1, jd: null, page: 115 };
    return {
      jy: parsed.jy,
      jm: parsed.jm,
      jd: parsed.jd,
      page: Math.floor(parsed.jy / 12)
    };
  };

  const initial = parseInitialValue();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("year");
  const [selectedYear, setSelectedYear] = useState(initial.jy);
  const [selectedMonth, setSelectedMonth] = useState(initial.jm);
  const [selectedDay, setSelectedDay] = useState<number | null>(initial.jd);
  const [yearPage, setYearPage] = useState(initial.page);
  const [manualInput, setManualInput] = useState("");
  
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // بستن دراپ‌داون با کلیک بیرون
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setManualInput("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // سینک با value از بیرون
  useEffect(() => {
    if (!value) {
      setSelectedYear(1380);
      setSelectedMonth(1);
      setSelectedDay(null);
      setYearPage(115);
      return;
    }
    const parsed = isoToJalali(value);
    if (parsed) {
      setSelectedYear(parsed.jy);
      setSelectedMonth(parsed.jm);
      setSelectedDay(parsed.jd);
      setYearPage(Math.floor(parsed.jy / 12));
    }
  }, [value]);

  // نمایش مقدار در اینپوت
  const displayValue = (() => {
    if (!value) return placeholder;
    const parsed = isoToJalali(value);
    if (!parsed) return placeholder;
    return `${toPersianNum(parsed.jy)}/${toPersianNum(parsed.jm).padStart(2, "۰")}/${toPersianNum(parsed.jd).padStart(2, "۰")}`;
  })();

  // مدیریت ورودی دستی
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // حذف کاراکترهای غیرمجاز
    val = val.replace(/[^\d۰-۹/]/g, "");
    
    // تبدیل به انگلیسی
    val = toEnglishNum(val);
    
    // محدودیت طول و فرمت
    const parts = val.split("/");
    if (parts[0] && parts[0].length > 4) parts[0] = parts[0].slice(0, 4);
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    if (parts[2] && parts[2].length > 2) parts[2] = parts[2].slice(0, 2);
    val = parts.join("/");
    
    // نمایش به فارسی
    setManualInput(toPersianNum(val));
    
    // اگر کامل شد
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(toEnglishNum(val))) {
      const [jy, jm, jd] = toEnglishNum(val).split("/").map(Number);
      
      // اعتبارسنجی ساده
      if (jy >= 1300 && jy <= 1450 && jm >= 1 && jm <= 12) {
        const maxDay = getDaysInJalaliMonth(jy, jm);
        if (jd >= 1 && jd <= maxDay) {
          const iso = jalaliToISO(jy, jm, jd);
          onChange?.(iso);
          setIsOpen(false);
          setManualInput("");
        }
      }
    }
  };

  // ---- YEAR ----
  const years = Array.from({ length: 12 }, (_, i) => {
    const year = yearPage * 12 + i;
    return year;
  });

  const renderYear = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setYearPage(p => p + 1)} 
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-2xl text-gray-500"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-gray-600">انتخاب سال</span>
        <button 
          onClick={() => setYearPage(p => p - 1)} 
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-2xl text-gray-500"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map(y => (
          <button 
            key={`year-${y}`}
            onClick={() => { 
              setSelectedYear(y); 
              setStep("month"); 
            }}
            className={`h-11 rounded-xl text-sm font-bold transition-all
              ${y === selectedYear 
                ? "bg-blue-500 text-white shadow" 
                : y === todayJY
                ? "border-2 border-blue-300 text-blue-600" 
                : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            {toPersianNum(y)}
          </button>
        ))}
      </div>
    </div>
  );

  // ---- MONTH ----
  const renderMonth = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setStep("year")} 
          className="text-xs font-bold text-blue-500 hover:underline"
        >
          ‹ تغییر سال
        </button>
        <span className="text-sm font-bold text-gray-700">{toPersianNum(selectedYear)}</span>
        <div className="w-16"/>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PERSIAN_MONTHS.map((name, idx) => {
          const m = idx + 1;
          const isSelected = m === selectedMonth;
          const isCurrent = selectedYear === todayJY && m === todayJM;
          return (
            <button 
              key={`month-${m}`}
              onClick={() => { 
                setSelectedMonth(m); 
                setStep("day"); 
              }}
              className={`h-11 rounded-xl text-sm font-bold transition-all
                ${isSelected 
                  ? "bg-blue-500 text-white shadow" 
                  : isCurrent 
                  ? "border-2 border-blue-300 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ---- DAY ----
  const renderDay = () => {
    const daysInMonth = getDaysInJalaliMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfWeek(selectedYear, selectedMonth);
    const weekDays = ["ش","ی","د","س","چ","پ","ج"];
    const cells: (number|null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setStep("month")} 
            className="text-xs font-bold text-blue-500 hover:underline"
          >
            ‹ تغییر ماه
          </button>
          <span className="text-sm font-bold text-gray-700">
            {PERSIAN_MONTHS[selectedMonth - 1]} {toPersianNum(selectedYear)}
          </span>
          <div className="w-16"/>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => (
            <div key={`weekday-${d}`} className="h-7 flex items-center justify-center text-xs font-bold text-gray-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`}/>;
            const isToday = selectedYear === todayJY && selectedMonth === todayJM && day === todayJD;
            const isSel = day === selectedDay;
            const isFriday = idx % 7 === 6;
            return (
              <button 
                key={`day-${idx}-${day}`}
                onClick={() => {
                  setSelectedDay(day);
                  const iso = jalaliToISO(selectedYear, selectedMonth, day);
                  onChange?.(iso);
                  setIsOpen(false);
                }}
                className={`h-9 rounded-lg text-xs font-bold transition-all
                  ${isSel 
                    ? "bg-blue-500 text-white shadow" 
                    : isToday 
                    ? "border-2 border-blue-400 text-blue-600" 
                    : isFriday 
                    ? "text-red-500 hover:bg-red-50" 
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {toPersianNum(day)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const stepLabels = ["سال","ماه","روز"];
  const steps: Step[] = ["year","month","day"];

  return (
    <div ref={ref} className="relative w-full" dir="rtl">
      <div 
        onClick={() => { 
          setStep("year"); 
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`flex items-center w-full h-16 px-4 border-2 rounded-xl bg-white cursor-pointer transition-all duration-200
          ${isOpen ? "border-blue-500 shadow-md" : "border-gray-300 hover:border-blue-400 hover:shadow-sm"}`}
      >
        <Calendar className="w-6 h-6 text-blue-500 ml-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? manualInput : displayValue}
          onChange={handleManualInput}
          onClick={(e) => e.stopPropagation()}
          placeholder={placeholder}
          className={`flex-1 text-right text-xl font-bold bg-transparent outline-none
            ${value ? "text-gray-900" : "text-gray-400"}`}
          dir="rtl"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress tabs */}
          <div className="flex border-b border-gray-100">
            {steps.map((s, i) => {
              const isActive = step === s;
              const isDone = steps.indexOf(step) > i;
              return (
                <button 
                  key={`step-${s}`}
                  onClick={() => isDone && setStep(s)}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all
                    ${isActive 
                      ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50" 
                      : isDone 
                      ? "text-gray-500 hover:text-blue-500" 
                      : "text-gray-300 cursor-default"
                    }`}
                >
                  {stepLabels[i]}
                </button>
              );
            })}
          </div>
          
          <div className="px-4 py-2 bg-blue-50 text-xs text-gray-600 text-center border-b">
            💡 می‌تانید مستقیماً تاریخ را تایپ کنید (مثلاً {toPersianNum("1380/05/15")})
          </div>
          
          {step === "year" && renderYear()}
          {step === "month" && renderMonth()}
          {step === "day" && renderDay()}
        </div>
      )}
    </div>
  );
};

export default PersianDatePicker;
