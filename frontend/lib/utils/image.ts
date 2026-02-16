export function resolveImageUrl(
  image?: string | File | null,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || ""
): string {
  if (!image) return "/pic/placeholder-product.png";

  // File جدید
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }

  // URL کامل
  if (image.startsWith("http")) {
    return image;
  }

  // URL نسبی بک‌اند
  return `${baseUrl}/${image.replace(/^\/+/, "")}`;
}
