type SortType = "newest" | "bestseller" | "cheapest" | "expensive";

type ProductsToolbarProps = {
  sort: SortType;
  setSort: (sort: SortType) => void;
};

export default function ProductsToolbar({ sort, setSort }: ProductsToolbarProps) {
  const tabs = [
    { key: "newest", name: "جدیدترین" },
    { key: "bestseller", name: "پرفروش‌ترین" },
    { key: "cheapest", name: "ارزان‌ترین" },
    { key: "expensive", name: "گران‌ترین" },
  ];

  return (
    <div className="flex justify-center gap-6 mb-4 border-b border-gray-200 w-[85%] pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setSort(tab.key as SortType)} // 👈 تغییر sort هنگام کلیک
          className={`py-2 px-4 text-[16px] font-normal transition ${
            sort === tab.key
              ? "text-[#00B4D8] border-b-[2px] border-[#00B4D8]"
              : "text-[#242424] hover:text-[#0077B6]"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
