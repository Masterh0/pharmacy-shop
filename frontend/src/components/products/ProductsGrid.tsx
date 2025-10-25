import Image from "next/image";

interface Variant {
  id: number;
  price: number;
}

interface Product {
  id: number;
  name: string;
  variants: Variant[];
  image?: string;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const BASE_URL = "http://localhost:5000";

  return (
    <div className="grid grid-cols-3 gap-8 w-[85%] mt-8">
      {products.map((p) => {
        // کمترین قیمت بین واریانت‌ها
        const minPrice = Math.min(...(p.variants?.map((v) => v.price) ?? [0]));

        // آدرس کامل تصویر
        const imageSrc = p.image
          ? `${BASE_URL}/${p.image.startsWith("uploads") ? p.image : `uploads/${p.image}`}`
          : "/no-image.png"; // عکس پیش‌فرض در صورت نداشتن تصویر

        return (
          <div
            key={p.id}
            className="flex flex-col items-center border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* تصویر محصول */}
            <Image
              src={imageSrc}
              alt={p.name}
              width={180}
              height={180}
              className="object-contain rounded-md"
            />

            {/* نام محصول */}
            <h3 className="text-[#242424] font-medium text-lg mt-4 text-center">
              {p.name}
            </h3>

            {/* قیمت */}
            <p className="text-black font-bold mt-2">
              {minPrice.toLocaleString("fa-IR")} تومان
            </p>

            {/* دکمه افزودن به سبد */}
            <button className="mt-3 bg-[#00B4D8] text-white px-6 py-1 rounded-full hover:bg-[#0077B6] transition">
              افزودن به سبد
            </button>
          </div>
        );
      })}
    </div>
  );
}
