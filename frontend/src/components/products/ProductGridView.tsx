// "use client";
// import { useEffect } from "react";
// import ProductsToolbar from "./ProductsToolbar";
// import ProductsGrid from "./ProductsGrid";
// import ProductsPagination from "./ProductsPagination";
// import ProductsFilterBox from "./ProductsFilterBox";
// import type { Product } from "@/lib/types/product";
// import type { Category } from "@/lib/types/category";
// type SortType =
//   | "newest"
//   | "bestseller"
//   | "cheapest"
//   | "expensive"
//   | "mostViewed";

// type ProductGridViewProps = {
//   title: string;
//   products: Product[];
//   sort: SortType;
//   setSort: (sort: SortType) => void;
//   pagination: {
//     totalPages: number;
//     currentPage: number;
//   };
//   setPage?: (page: number) => void;
// };

// export default function ProductGridView({
//   title,
//   products,
//   sort,
//   setSort,
//   pagination,
//   setPage,
// }: ProductGridViewProps) {
//   // ✅ ذخیره sort در LocalStorage
//   useEffect(() => {
//     localStorage.setItem("productSort", sort);
//   }, [sort]);

//   return (
//     <div className="flex gap-8 items-start">
//       {/* ستون فیلتر سمت راست */}
//       <ProductsFilterBox />

//       {/* ستون محصولات */}
//       <div className="flex-1 flex flex-col">
//         <h2 className="text-[#0077B6] text-3xl font-bold mb-8">{title}</h2>
//         <ProductsToolbar sort={sort} setSort={setSort} />
//         <ProductsGrid products={products} />
//         {pagination && (
//           <ProductsPagination
//             totalPages={pagination.totalPages}
//             currentPage={pagination.currentPage}
//             onPageChange={setPage}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
