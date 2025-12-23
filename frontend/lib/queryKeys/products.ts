export const PRODUCT_KEYS = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
};
