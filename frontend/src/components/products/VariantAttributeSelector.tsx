"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Control,
  Controller,
  useFieldArray,
  useWatch,
  useFormContext,
} from "react-hook-form";
import Select from "react-select";

import { CreateProductDTO } from "@/lib/validators/productSchema";
import { attributeApi } from "@/lib/api/attributeApi";

interface Props {
  control: Control<CreateProductDTO>;
  index: number;
}

export default function VariantAttributeSelector({ control, index }: Props) {
  const { setValue } = useFormContext<CreateProductDTO>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${index}.attributes`,
  });

  const variantAttributes = useWatch({
    control,
    name: `variants.${index}.attributes`,
  });

  const { data: attributes = [] } = useQuery({
    queryKey: ["variation-attributes"],
    queryFn: () => attributeApi.listVariation(),
  });

  return (
    <div className="w-full border border-gray-200 rounded-xl p-5 mt-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-sm">ویژگی‌های واریانت</h4>

        <button
          type="button"
          className="text-sky-500 text-sm font-medium hover:underline"
          onClick={() =>
            append({
              attributeId: undefined,
              valueId: undefined,
            })
          }
        >
          + افزودن ویژگی
        </button>
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
          هنوز ویژگی‌ای اضافه نشده است.
        </div>
      )}

      {/* Attributes */}
      <div className="flex flex-col gap-4">
        {fields.map((item, attributeIndex) => {
          const selectedAttributeId =
            variantAttributes?.[attributeIndex]?.attributeId;

          const selectedAttribute = attributes.find(
            (a: any) => a.id === selectedAttributeId,
          );

          const usedIds =
            variantAttributes
              ?.map((x: any) => x?.attributeId)
              .filter(Boolean) ?? [];

          const attributeOptions = attributes
            .filter(
              (a: any) =>
                !usedIds.includes(a.id) || a.id === selectedAttributeId,
            )
            .map((a: any) => ({
              value: a.id,
              label: a.name,
            }));

          const valueOptions =
            selectedAttribute?.values?.map((v: any) => ({
              value: v.id,
              label: v.value,
            })) ?? [];

          return (
            <div
              key={item.id}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-end">
                {/* Attribute */}
                <Controller
                  control={control}
                  name={`variants.${index}.attributes.${attributeIndex}.attributeId`}
                  render={({ field }) => (
                    <div className="min-w-0">
                      <label className="text-xs font-medium mb-1.5 block text-gray-700">
                        ویژگی
                      </label>

                      <Select
                        className="w-full"
                        classNamePrefix="attribute-select"
                        options={attributeOptions}
                        placeholder="انتخاب ویژگی"
                        value={
                          attributeOptions.find(
                            (x) => x.value === field.value,
                          ) ?? null
                        }
                        onChange={(option) => {
                          field.onChange(option?.value);

                          setValue(
                            `variants.${index}.attributes.${attributeIndex}.valueId`,
                            undefined,
                          );
                        }}
                        isSearchable
                        noOptionsMessage={() => "ویژگی دیگری وجود ندارد"}
                      />
                    </div>
                  )}
                />

                {/* Value */}
                <Controller
                  control={control}
                  name={`variants.${index}.attributes.${attributeIndex}.valueId`}
                  render={({ field }) => (
                    <div className="min-w-0">
                      <label className="text-xs font-medium mb-1.5 block text-gray-700">
                        مقدار
                      </label>

                      <Select
                        className="w-full"
                        classNamePrefix="value-select"
                        isDisabled={!selectedAttribute}
                        options={valueOptions}
                        placeholder="انتخاب مقدار"
                        value={
                          valueOptions.find((x) => x.value === field.value) ??
                          null
                        }
                        onChange={(option) => field.onChange(option?.value)}
                        isSearchable
                        noOptionsMessage={() => "مقداری وجود ندارد"}
                      />
                    </div>
                  )}
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(attributeIndex)}
                  className="h-[40px] px-4 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50 transition whitespace-nowrap"
                >
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
