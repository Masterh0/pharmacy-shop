"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { attributeApi } from "@/lib/api/attributeApi";

import {
  CreateAttributeValueDTO,
} from "@/lib/validators/attributeSchema";

export function useAttributeValues(
  attributeId?: number,
) {
  return useQuery({
    queryKey: [
      "attribute-values",
      attributeId,
    ],

    queryFn: () =>
      attributeApi.listValues(attributeId!),

    enabled: !!attributeId,
  });
}

export function useCreateAttributeValue(
  attributeId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateAttributeValueDTO,
    ) =>
      attributeApi.createValue(
        attributeId,
        data,
      ),

    onSuccess: () => {
      toast.success("مقدار ثبت شد.");

      queryClient.invalidateQueries({
        queryKey: [
          "attribute-values",
          attributeId,
        ],
      });
    },
  });
}

export function useUpdateAttributeValue(
  attributeId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      value,
    }: {
      id: number;
      value: string;
    }) =>
      attributeApi.updateValue(id, {
        value,
      }),

    onSuccess: () => {
      toast.success("ویرایش شد.");

      queryClient.invalidateQueries({
        queryKey: [
          "attribute-values",
          attributeId,
        ],
      });
    },
  });
}

export function useDeleteAttributeValue(
  attributeId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attributeApi.removeValue,

    onSuccess: () => {
      toast.success("حذف شد.");

      queryClient.invalidateQueries({
        queryKey: [
          "attribute-values",
          attributeId,
        ],
      });
    },
  });
}