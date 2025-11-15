"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import type { ReactQuillProps } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps<T extends FieldValues> {
  /** کنترلر فرم اصلی RHF */
  control: Control<T>;
  /** نام فیلد داخل فرم */
  name: Path<T>;
  /** برچسب نمایشی بالای ویرایشگر */
  label?: string;
}

// 🧠 ایمپورت داینامیک برای جلوگیری از ارور SSR در Next.js
const ReactQuill = dynamic<ReactQuillProps>(
  () => import("react-quill-new"),
  { ssr: false }
);

export const RichTextEditor = <T extends FieldValues>({
  control,
  name,
  label = "توضیحات محصول",
}: RichTextEditorProps<T>) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="flex flex-col gap-2">
      {/* برچسب بالای ویرایشگر */}
      <label className="text-[14px] font-medium text-[#0077B6]">
        {label}
      </label>

      {/* اتصال RHFController با ReactQuill */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ReactQuill
            theme="snow"
            value={(field.value as string) || ""}
            onChange={(val: string) => field.onChange(val)}
            modules={modules}
            className="
              min-h-[200px] rounded-lg border border-[#D6D6D6]
              text-[13px] font-[400]
              [&_.ql-toolbar]:rounded-t-lg
              [&_.ql-toolbar]:bg-[#F9FAFB]
              [&_.ql-container]:rounded-b-lg
              [&_.ql-editor]:text-right
              [&_.ql-editor]:font-vazirmatn
              [&_.ql-editor]:leading-[2.2]
              [&_.ql-editor]:min-h-[180px]
            "
          />
        )}
      />
    </div>
  );
};
