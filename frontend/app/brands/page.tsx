"use client";

import AddBrandForm from "@/src/components/brand/AddBrandForm";
import BrandList from "@/src/components/brand/BrandList";

export default function BrandsPage() {
  return (
    <div className="p-6 flex flex-col items-center gap-6">
      <AddBrandForm />
      <BrandList />
    </div>
  );
}
