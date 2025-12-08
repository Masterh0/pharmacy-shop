import api from "@/lib/axios";

export const shippingApi = {
  /** 📦 دریافت هزینه ارسال بر اساس addressId */
  async getCost(addressId: number): Promise<{
    shippingCost: number;
    province: string;
    city: string;
  }> {
    const { data } = await api.get("/shipping/cost", {
      params: { addressId },
    });

    return {
      shippingCost: data.shippingCost,
      province: data.province,
      city: data.city,
    };
  },
};
