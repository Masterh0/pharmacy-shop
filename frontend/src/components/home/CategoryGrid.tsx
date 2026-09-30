import Image from "next/image";
import Link from "next/link";

interface Category {
  id: number;
  title: string;
  image: string;
  href: string;
}

const categories: Category[] = [
  {
    id: 1,
    title: "مکمل‌های ورزشی",
    image: "/pic/categories/category_1_sports_supplements.webp",
    href: "/categories/sports-supplements",
  },
  {
    id: 2,
    title: "محصولات جنسی",
    image: "/pic/categories/category_2_sexual_wellness.webp",
    href: "/categories/sexual-wellness",
  },
  {
    id: 3,
    title: "مادر و کودک",
    image: "/pic/categories/category_3_baby_care.webp",
    href: "/categories/baby-care",
  },
  {
    id: 4,
    title: "ویتامین و مکمل",
    image: "/pic/categories/category_4_vitamins.webp",
    href: "/categories/vitamins",
  },
  {
    id: 5,
    title: "محصولات بهداشتی",
    image: "/pic/categories/category_5_hygiene_products.webp",
    href: "/categories/hygiene",
  },
  {
    id: 6,
    title: "مراقبت پوست و مو",
    image: "/pic/categories/category_6_skincare_cosmetics.webp",
    href: "/categories/skincare",
  },
];

export default function CategoryGrid() {
  return (
    <section className="w-full mx-auto px-4">
      {" "}
      {/* عنوان بخش */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          دسته‌بندی محصولات
        </h2>
        <div className="flex-1 h-[1px] bg-gray-200 mr-2" />
      </div>
      {/* شبکه کارت‌ها (Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group flex flex-col items-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-sm md:text-base font-semibold text-gray-700 text-center group-hover:text-primary transition-colors duration-200">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
