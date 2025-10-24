import { create } from "zustand";
import { CreateBrandDTO } from "../types/brand";

interface BrandStore extends CreateBrandDTO {
  setField: <K extends keyof CreateBrandDTO>(
    field: K,
    value: CreateBrandDTO[K]
  ) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
  name: "",
  slug: "",
  setField: (field, value) => set({ [field]: value }),
  reset: () => set({ name: "", slug: "" }),
}));
