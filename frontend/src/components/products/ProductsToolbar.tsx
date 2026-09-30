type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";

type ProductsToolbarProps = {
  sort: SortType;
  setSort: (sort: SortType) => void;
};

export default function ProductsToolbar({
  sort,
  setSort,
}: ProductsToolbarProps) {
  const tabs = [
    { key: "newest", name: "جدیدترین" },
    { key: "bestseller", name: "پرفروش‌ترین" },
    { key: "cheapest", name: "ارزان‌ترین" },
    { key: "expensive", name: "گران‌ترین" },
    { key: "mostViewed", name: "پربازدیدترین" },
  ];

  return (
    <div className="w-full mb-4 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
      <div className="flex gap-1 lg:gap-6 min-w-max lg:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key as SortType)}
            className={`py-2 px-2.5 lg:px-4 text-[13px] lg:text-[16px] font-normal whitespace-nowrap transition ${
              sort === tab.key
                ? "text-[#00B4D8] border-b-[2px] border-[#00B4D8]"
                : "text-[#242424] hover:text-[#0077B6]"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
