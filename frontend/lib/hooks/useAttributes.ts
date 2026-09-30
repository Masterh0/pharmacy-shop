"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
  attributeApi,
  Attribute,
} from "@/lib/api/attributeApi";

import {
  CreateAttributeDTO,
} from "@/lib/validators/attributeSchema";

export const attributeKeys = {
  all: ["attributes"] as const,
};

export function useAttributes() {
  return useQuery({
    queryKey: attributeKeys.all,
    queryFn: () => attributeApi.list(),
  });
}

export function useAttribute(id: number) {
  return useQuery({
    queryKey: [...attributeKeys.all, id],
    queryFn: () => attributeApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttributeDTO) =>
      attributeApi.create(data),

    onSuccess: () => {
      toast.success("ویژگی ایجاد شد.");

      queryClient.invalidateQueries({
        queryKey: attributeKeys.all,
      });
    },

    onError: () => {
      toast.error("خطا در ایجاد ویژگی");
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Attribute>;
    }) => attributeApi.update(id, data),

    onSuccess: () => {
      toast.success("ویژگی بروزرسانی شد.");

      queryClient.invalidateQueries({
        queryKey: attributeKeys.all,
      });
    },

    onError: () => {
      toast.error("بروزرسانی انجام نشد");
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attributeApi.remove,

    onSuccess: () => {
      toast.success("ویژگی حذف شد.");

      queryClient.invalidateQueries({
        queryKey: attributeKeys.all,
      });
    },

    onError: () => {
      toast.error("حذف انجام نشد");
    },
  });
}