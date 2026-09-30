"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import Select from "react-select";

import { attributeApi } from "@/lib/api/attributeApi";
import { CreateProductDTO } from "@/lib/validators/productSchema";

export default function ProductAttributeSelector() {
  const { control, setValue } = useFormContext<CreateProductDTO>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const attributesState = useWatch({
    control,
    name: "attributes",
  });

  const { data: attributes = [] } = useQuery({
    
    queryKey: ["product-attributes"],
    queryFn: attributeApi.listProduct,
    
  });
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-5 mt-6">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-sm">
          ویژگی‌های محصول
        </h4>

        <button
          type="button"
          className="text-sky-500 text-sm hover:underline"
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

      {fields.length === 0 && (
        <p className="text-sm text-gray-400">
          هنوز ویژگی‌ای اضافه نشده است.
        </p>
      )}

      {fields.map((field, index) => {
        const selectedAttributeId =
          attributesState?.[index]?.attributeId;

        const selectedAttribute = attributes.find(
          (a) => a.id === selectedAttributeId
        );

        const usedIds =
          attributesState
            ?.map((a) => a?.attributeId)
            .filter(Boolean) ?? [];

        const attributeOptions = attributes
          .filter(
            (a) =>
              !usedIds.includes(a.id) ||
              a.id === selectedAttributeId
          )
          .map((a) => ({
            value: a.id,
            label: a.name,
          }));

        const valueOptions =
          selectedAttribute?.values.map((v) => ({
            value: v.id,
            label: v.value,
          })) ?? [];

        return (
          <div
            key={field.id}
            className="border rounded-xl p-4 mb-4 bg-gray-50"
          >
            <div className="grid grid-cols-2 gap-4">

              <Controller
                control={control}
                name={`attributes.${index}.attributeId`}
                render={({ field }) => (
                  <div>
                    <label className="block text-xs mb-1">
                      ویژگی
                    </label>

                    <Select
                      options={attributeOptions}
                      placeholder="انتخاب ویژگی"
                      value={
                        attributeOptions.find(
                          (x) => x.value === field.value
                        ) ?? null
                      }
                      onChange={(option) => {
                        field.onChange(option?.value);

                        setValue(
                          `attributes.${index}.valueId`,
                          undefined
                        );
                      }}
                    />
                  </div>
                )}
              />

              <Controller
                control={control}
                name={`attributes.${index}.valueId`}
                render={({ field }) => (
                  <div>
                    <label className="block text-xs mb-1">
                      مقدار
                    </label>

                    <Select
                      isDisabled={!selectedAttribute}
                      options={valueOptions}
                      placeholder="انتخاب مقدار"
                      value={
                        valueOptions.find(
                          (x) => x.value === field.value
                        ) ?? null
                      }
                      onChange={(option) =>
                        field.onChange(option?.value)
                      }
                    />
                  </div>
                )}
              />

            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 text-sm mt-4 hover:underline"
            >
              حذف ویژگی
            </button>
          </div>
        );
      })}
    </div>
  );
}