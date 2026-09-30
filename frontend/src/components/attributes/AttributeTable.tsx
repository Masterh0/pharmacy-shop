"use client";

import { Edit2, Trash, Add } from "iconsax-react";
import { Attribute } from "@/lib/api/attributeApi";

interface Props {
  attributes: Attribute[];
  isLoading: boolean;

  onEdit: (attribute: Attribute) => void;
  onDelete: (attribute: Attribute) => void;
  onManageValues: (attribute: Attribute) => void;
}
export default function AttributeTable({
  attributes,
  isLoading,
  onEdit,
  onDelete,
  onManageValues,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        در حال دریافت ویژگی‌ها...
      </div>
    );
  }

  if (!attributes.length) {
    return (
      <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
        هنوز هیچ ویژگی‌ای ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr className="text-right">
            <th className="p-4">نام</th>
            <th className="p-4">Slug</th>
            <th className="p-4 text-center">متغیر</th>
            <th className="p-4 text-center">فیلتر</th>
            <th className="p-4 text-center">نمایش</th>
            <th className="p-4 text-center">عملیات</th>
          </tr>
        </thead>

        <tbody>
          {attributes.map((attribute) => (
            <tr
              key={attribute.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-4 font-medium">{attribute.name}</td>

              <td className="p-4 text-gray-500">{attribute.slug}</td>

              <td className="text-center">
                {attribute.variation ? "✅" : "❌"}
              </td>

              <td className="text-center">
                {attribute.filterable ? "✅" : "❌"}
              </td>

              <td className="text-center">{attribute.visible ? "✅" : "❌"}</td>

              <td>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onManageValues(attribute)}
                    title="مدیریت مقادیر"
                    className="rounded-lg p-2 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Add size={18} color="#2563eb" variant="Bold" />
                  </button>

                  <button
                    onClick={() => onEdit(attribute)}
                    title="ویرایش"
                    className="rounded-lg p-2 bg-yellow-50 hover:bg-yellow-100 transition"
                  >
                    <Edit2 size={18} color="#d97706" variant="Bold" />
                  </button>

                  <button
                    onClick={() => onDelete(attribute)}
                    title="حذف"
                    className="rounded-lg p-2 bg-red-50 hover:bg-red-100 transition"
                  >
                    <Trash size={18} color="#ef4444" variant="Bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
