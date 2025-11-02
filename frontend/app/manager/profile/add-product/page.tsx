"use client";

import AddProductForm from "@/src/components/products/AddProductForm";

export default function ProductsPage() {
  return (
    <main className="max-w-2xl mx-auto py-10">
      <h2 className="text-[20px] font-bold text-[#242424] mb-8">
    🧾 افزودن محصول جدید
  </h2>
      <AddProductForm />
    </main>
  );
}
