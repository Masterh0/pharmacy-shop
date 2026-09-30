const dummyProduct = {
  name: "پروتئین وی گلد استاندارد",
  description: "پودر پروتئین وی مناسب برای افزایش حجم و ریکاوری عضلات",
  sku: "WHEY-001",
  brandId: 1,
  categoryId: 2,
  isBlock: false,

  // تصویر اصلی محصول
  imageUrl: "uploads/products/imageUrl-1781260533677-105215362.webp",

  variants: [
    {
      packageQuantity: 1,
      packageType: "قوطی 1 کیلویی",
      flavor: "شکلات",
      price: 2500000,
      discountPrice: 2200000,
      stock: 15,
      expiryDate: "2027-12-31",

      images: [
        "uploads/products/imageUrl-1781260533677-105215362.webp",
        "uploads/products/imageUrl-1781260533678-345678901.webp",
        "uploads/products/imageUrl-1781260533679-987654321.webp",
      ],
    },

    {
      packageQuantity: 2,
      packageType: "قوطی 2 کیلویی",
      flavor: "وانیل",
      price: 4500000,
      discountPrice: 4100000,
      stock: 8,
      expiryDate: "2027-12-31",

      images: [
        {
          url: "uploads/products/imageUrl-1781260533680-123456789.webp",
          altText: "نمای جلو",
          displayOrder: 0,
          isPrimary: true,
        },
        {
          url: "uploads/products/imageUrl-1781260533681-987123654.webp",
          altText: "نمای پشت",
          displayOrder: 1,
          isPrimary: false,
        },
        {
          url: "uploads/products/imageUrl-1781260533682-456789123.webp",
          altText: "نمای کنار",
          displayOrder: 2,
          isPrimary: false,
        },
      ],
    },
  ],
};
