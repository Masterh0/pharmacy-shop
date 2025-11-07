"use client";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

interface ImageUploaderProps {
  name: string;
  label?: string;
}

export function ImageUploader({ name, label = "تصویر محصول" }: ImageUploaderProps) {
  const { watch, setValue } = useFormContext();
  const file = watch(name);

  // ✅ کنترل Preview از روی URL یا فایل جدید
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (typeof file === "string") {
      // یعنی تصویر قبلی از URL داده اولیه آمده
      setPreview(file);
    } else {
      setPreview(URL.createObjectURL(file));
    }
  }, [file]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      if (!selected) return;
      if (!selected.type.startsWith("image/")) {
        alert("فقط فایل تصویری مجاز است");
        return;
      }
      if (selected.size > 2 * 1024 * 1024) {
        alert("حداکثر حجم مجاز ۲ مگابایت است");
        return;
      }
      setValue(name, selected);
    },
    [name, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  // پاک‌سازی URLهای موقتی
  useEffect(() => {
    return () => {
      if (file && typeof file !== "string") URL.revokeObjectURL(file);
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px]">{label}</label>

      <div
        {...getRootProps()}
        className={`h-[160px] border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center cursor-pointer transition 
        ${
          isDragActive
            ? "border-[#00B4D8] bg-[#E0F7FA]"
            : "border-[#D6D6D6] bg-gray-50 hover:border-[#00B4D8]"
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="product preview"
              className="w-[150px] h-[150px] object-cover rounded-[12px]"
            />
            <button
              type="button"
              onClick={() => setValue(name, null)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#00B4D8" viewBox="0 0 24 24">
              <path
                d="M12 16v-8m0 0l-4 4m4-4l4 4m5 4v5H3v-5"
                stroke="#00B4D8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[13px] text-center">
              {isDragActive ? "رها کنید تا آپلود شود..." : "برای آپلود تصویر کلیک کنید یا فایل را بکشید"}
            </p>
            <p className="text-[12px] text-gray-400">
              فرمت مجاز: JPG, PNG – حداکثر ۲ مگابایت
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
