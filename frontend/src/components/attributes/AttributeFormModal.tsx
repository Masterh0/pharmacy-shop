"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attributeApi, Attribute } from "@/lib/api/attributeApi";

const schema = z.object({
  name: z.string().min(1, "نام ویژگی الزامی است"),
  variation: z.boolean(),
  filterable: z.boolean(),
  visible: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  attribute?: Attribute | null;
}

export default function AttributeFormModal({
  open,
  onClose,
  attribute,
}: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      variation: false,
      filterable: true,
      visible: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) return;

    if (attribute) {
      reset({
        name: attribute.name,
        variation: attribute.variation,
        filterable: attribute.filterable,
        visible: attribute.visible,
      });
    } else {
      reset({
        name: "",
        variation: false,
        filterable: true,
        visible: true,
      });
    }
  }, [attribute, open, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (attribute) {
        return attributeApi.update(attribute.id, data);
      }

      return attributeApi.create(data);
    },

    onSuccess: () => {
      toast.success(
        attribute
          ? "ویژگی ویرایش شد."
          : "ویژگی ایجاد شد."
      );

      queryClient.invalidateQueries({
        queryKey: ["attributes"],
      });

      onClose();
    },

    onError: () => {
      toast.error("خطا در ذخیره اطلاعات");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] p-6">

        <h2 className="text-lg font-bold mb-6">
          {attribute ? "ویرایش ویژگی" : "افزودن ویژگی"}
        </h2>

        <form
          className="space-y-5"
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
        >
          <div>
            <label className="block mb-2 text-sm">
              نام ویژگی
            </label>

            <input
              {...register("name")}
              className="border rounded-lg w-full h-10 px-3"
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("variation")}
            />

            ویژگی متغیر
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("filterable")}
            />

            قابل فیلتر
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("visible")}
            />

            نمایش در سایت
          </label>

          <div className="flex justify-end gap-3 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 rounded-lg bg-sky-500 text-white"
            >
              {mutation.isPending
                ? "درحال ذخیره..."
                : "ذخیره"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}