import AddCategoryForm from "@/src/components/categories/AddCategoryForm";
import CategoryTree from "@/src/components/categories/CategoryTree";

export default function CategoriesPage() {
  return (
    <div className="p-6 space-y-6">
      <AddCategoryForm />
      <CategoryTree />
    </div>
  );
}
