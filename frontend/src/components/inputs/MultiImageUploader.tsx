// src/components/inputs/MultiImageUploader.tsx
"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

interface MultiImageUploaderProps {
  images: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export function MultiImageUploader({
  images,
  onChange,
  maxFiles = 10,
  existingImages = [],
  onRemoveExisting,
}: MultiImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  // ✅ ایجاد پیش‌نمایش از فایل‌های جدید
  useEffect(() => {
    const fileImages = images.filter(
      (file): file is File => file instanceof File,
    );

    const newPreviews = fileImages.map((file) => URL.createObjectURL(file));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} تصویر نیست`);
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} بیشتر از ۵ مگابایت است`);
          return false;
        }

        return true;
      });

      const availableSlots = maxFiles - existingImages.length - images.length;

      if (availableSlots <= 0) {
        alert(`حداکثر ${maxFiles} عکس مجاز است`);
        return;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);

      if (filesToAdd.length < validFiles.length) {
        alert(`حداکثر ${maxFiles} عکس مجاز است`);
      }

      onChange([...images, ...filesToAdd]);
    },
    [images, existingImages, onChange, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const totalImages = existingImages.length + images.length;

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[14px] font-medium text-gray-700">
        🖼 عکس‌های واریانت
      </label>

      {/* 📤 منطقه آپلود */}
      <div
        {...getRootProps()}
        className={`h-[120px] border-2 border-dashed rounded-[12px] flex items-center justify-center cursor-pointer transition-all ${
          isDragActive
            ? "border-[#00B4D8] bg-[#E0F7FA] scale-[1.02]"
            : "border-[#D6D6D6] bg-gray-50 hover:border-[#00B4D8] hover:bg-[#F0FBFF]"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Upload className="w-8 h-8 text-[#00B4D8]" strokeWidth={1.5} />
          <p className="text-[13px] font-medium">
            {isDragActive ? "🎯 رها کنید..." : "📁 آپلود تصاویر واریانت"}
          </p>
          <p className="text-[11px] text-gray-400">
            حداکثر {maxFiles} عکس • هر کدام تا ۵ مگابایت
          </p>
          {totalImages > 0 && (
            <p className="text-[11px] text-[#00B4D8] font-medium">
              {totalImages} / {maxFiles} عکس انتخاب شده
            </p>
          )}
        </div>
      </div>

      {/* 🖼 نمایش تصاویر */}
      {totalImages > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {/* ✅ عکس‌های موجود از سرور */}
          {existingImages.map((url, i) => {
            if (!url || typeof url !== "string") return null;

            const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

            return (
              <div
                key={`existing-${i}`}
                className="relative group rounded-[8px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={fullUrl}
                  alt={`existing-${i}`}
                  className="w-full h-[100px] object-cover"
                  onError={(e) => {
                    console.error("❌ خطا در بارگذاری تصویر:", fullUrl);
                    e.currentTarget.src = "/placeholder-image.png"; // تصویر جایگزین
                  }}
                />

                {/* 🗑️ دکمه حذف */}
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(url)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    title="حذف تصویر موجود"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* 🏷 برچسب "اصلی" */}
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-[#00B4D8] text-white text-[10px] px-2 py-0.5 rounded shadow-md">
                    اصلی
                  </span>
                )}
              </div>
            );
          })}

          {/* ✅ عکس‌های جدید آپلود شده */}
          {previews.map((src, i) => (
            <div
              key={`new-${i}`}
              className="relative group rounded-[8px] overflow-hidden border border-dashed border-[#00B4D8] shadow-sm hover:shadow-md transition"
            >
              <img
                src={src}
                alt={`preview-${i}`}
                className="w-full h-[100px] object-cover"
              />

              {/* 🗑️ دکمه حذف */}
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="حذف تصویر جدید"
              >
                <X className="h-4 w-4" />
              </button>

              {/* 🏷 برچسب "جدید" */}
              <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow-md">
                جدید
              </span>

              {/* 🏷 برچسب "اصلی" فقط اگر هیچ عکس موجودی نباشه */}
              {existingImages.length === 0 && i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#00B4D8] text-white text-[10px] px-2 py-0.5 rounded shadow-md">
                  اصلی
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
