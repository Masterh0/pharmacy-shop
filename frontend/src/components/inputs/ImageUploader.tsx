"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

interface ImageUploaderProps {
  name: string;
  label?: string;
}

export function ImageUploader({
  name,
  label = "تصویر محصول",
}: ImageUploaderProps) {
  const { watch, setValue } = useFormContext();
  const file = watch(name);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const [preview, setPreview] = useState<string | null>(null);

  /* -------------------------------------------- */
  /* 🖼 ساخت preview */
  /* -------------------------------------------- */
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    // تصویر قبلی (string)
    if (typeof file === "string") {
      setPreview(
        file.startsWith("http")
          ? file
          : `${baseUrl}/${file.replace(/^\/+/, "")}`,
      );
      return;
    }

    // فایل جدید
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, baseUrl]);

  /* -------------------------------------------- */
  /* 📥 Drop */
  /* -------------------------------------------- */
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

      setValue(name, selected, { shouldValidate: true });
    },
    [name, setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  /* -------------------------------------------- */
  /* 🎨 UI */
  /* -------------------------------------------- */
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-medium">{label}</label>

      <div
        {...getRootProps()}
        className={`h-[180px] border-2 border-dashed rounded-[16px]
        flex items-center justify-center cursor-pointer transition
        ${
          isDragActive
            ? "border-[#00B4D8] bg-[#E0F7FA]"
            : "border-[#D6D6D6] bg-gray-50 hover:border-[#00B4D8]"
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative group">
            <div className="w-[220px] h-[220px] bg-white rounded-[16px] shadow-sm border overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setValue(name, undefined, { shouldValidate: true });
              }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100
              transition bg-red-500 hover:bg-red-600 text-white
              w-8 h-8 rounded-full flex items-center justify-center shadow"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <p className="text-[13px]">کلیک یا درگ برای آپلود تصویر</p>
            <p className="text-[12px] text-gray-400">JPG, PNG – حداکثر ۲MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
