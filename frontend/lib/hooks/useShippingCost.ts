"use client";

import { useQuery } from "@tanstack/react-query";
import { shippingApi } from "@/lib/api/shipping";

export function useShippingCost(addressId?: number) {
  return useQuery({
    queryKey: ["shipping-cost", addressId],
    queryFn: () => shippingApi.getCost(addressId!),
    enabled: !!addressId,
  });
}
