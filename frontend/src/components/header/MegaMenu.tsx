import { Category } from "@/lib/types/category";
import Link from "next/link";
import { useCategoryStore } from "@/lib/stores/categoryStore"; // ✅ مسیر درست طبق ساختار جدید

interface MegaMenuProps {
  categories: Category[];
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const { setSelectedCategory } = useCategoryStore();

  return (
    <div
      className="
        absolute top-[52px] right-0
        w-[528px] bg-white
        border border-[#D6D6D6]
        rounded-b-[16px]
        px-[30px] py-[22px]
        flex flex-col items-end gap-[16px]
        shadow-md z-20
      "
    >
      {categories.map((category) => (
        <div key={category.id} className="w-full flex flex-col items-end">
          {/* سطح دوم */}
          <Link
            href={`/categories/${category.slug}`}
            onClick={() =>
              setSelectedCategory({ id: category.id, name: category.name })
            } // ✅ ذخیره وضعیت در Zustand
            className="text-[12px] font-bold text-[#242424] mb-[8px] hover:text-[#0077B6] transition-colors"
          >
            {category.name}
          </Link>

          {/* سطح سوم */}
          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap justify-end gap-[8px]">
              {category.subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  onClick={() =>
                    setSelectedCategory({ id: sub.id, name: sub.name })
                  } // ✅ برای subCategory هم
                  className="
                    bg-[#F0F0F0] text-[#242424] text-[10px]
                    rounded-[8px] py-[8px] px-[16px]
                    hover:bg-[#E5E5E5] hover:text-[#0077B6]
                    transition-colors
                  "
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
