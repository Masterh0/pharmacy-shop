import slugify from "slugify";

export const makeSlug = (text?: string | null, fallback?: string) => {
  const base = text || fallback;
  if (!base) throw new Error("slugify: no text provided");
  return slugify(base, { lower: true, strict: true });
};
