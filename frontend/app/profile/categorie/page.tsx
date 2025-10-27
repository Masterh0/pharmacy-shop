import AddCategoryForm from "@/src/components/categories/AddCategoryForm";
import CategoryTree from "@/src/components/categories/CategoryTree";

export default function CategoriesPage() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <AddCategoryForm />
      </div>
      <div>
        <CategoryTree />
      </div>
    </div>
  );
}
