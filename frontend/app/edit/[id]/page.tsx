// "use client";

// import { useRouter, useParams } from "next/navigation";
// import { useEffect } from "react";
// import { useProductStore } from "../../../lib/stores/productStore";
// import { useProduct, useUpdateProduct } from "../../../lib/hooks/useProduct";
// import { Product } from "../../../lib/types/product"

// export default function EditProductPage() {
//   const router = useRouter();
//   const params = useParams();
//   const id = Number(params.id);

//   if (!params.id || isNaN(id)) {
//     return <p className="p-4 text-red-600">Invalid product ID</p>;
//   }

//   const { formData, setFormData } = useProductStore();
//   const { data: product, isLoading } = useProduct(id);
//   const updateMutation = useUpdateProduct();

//   // Load product into formData
//   useEffect(() => {
//     if (product) {
//       setFormData({
//         name: product.name,
//         description: product.description || "",
//         price: product.price.toString(),
//         stock: product.stock.toString(),
//         minStock: product.minStock.toString(),
//         expiryDate: product.expiryDate?.slice(0, 10) || "",
//         categoryId: product.categoryId.toString(),
//         brandId: product.brandId.toString(),
//         isPrescriptionRequired: product.isPrescriptionRequired,
//       });
//     }
//   }, [product, setFormData]);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({ [name]: type === "checkbox" ? checked : value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     updateMutation.mutate(
//       {
//         id,
//         data: {
//           ...formData,
//           price: parseFloat(formData.price),
//           stock: parseInt(formData.stock),
//           minStock: parseInt(formData.minStock),
//           categoryId: parseInt(formData.categoryId),
//           brandId: parseInt(formData.brandId),
//         },
//       },
//       {
//         onSuccess: () => router.push("/products"),
//       }
//     );
//   };

//   if (isLoading) {
//     return (
//       <p className="p-4 text-center text-gray-500 animate-pulse">
//         Loading product...
//       </p>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-10">
//       <h1 className="text-3xl font-bold mb-8 text-indigo-600">
//         Edit Product
//       </h1>
//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-2 gap-6 bg-white shadow-lg rounded-lg p-6"
//       >
//         {/* Text Inputs */}
//         <input
//           name="name"
//           value={formData.name || ""}
//           onChange={handleChange}
//           placeholder="Product Name"
//           className="border rounded p-3 col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <textarea
//           name="description"
//           value={formData.description || ""}
//           onChange={handleChange}
//           placeholder="Description"
//           className="border rounded p-3 col-span-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <input
//           name="price"
//           value={formData.price || ""}
//           onChange={handleChange}
//           placeholder="Price"
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <input
//           name="stock"
//           value={formData.stock || ""}
//           onChange={handleChange}
//           placeholder="Stock"
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <input
//           name="minStock"
//           value={formData.minStock || ""}
//           onChange={handleChange}
//           placeholder="Minimum Stock"
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <input
//           type="date"
//           name="expiryDate"
//           value={formData.expiryDate || ""}
//           onChange={handleChange}
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         <select
//           name="categoryId"
//           value={formData.categoryId || ""}
//           onChange={handleChange}
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         >
//           <option value="">Select Category</option>
//           {/* populated from API or fixed values */}
//         </select>

//         <select
//           name="brandId"
//           value={formData.brandId || ""}
//           onChange={handleChange}
//           className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         >
//           <option value="">Select Brand</option>
//           {/* populated from API or fixed values */}
//         </select>

//         {/* Boolean Field */}
//         <label className="flex items-center col-span-2 space-x-2">
//           <input
//             type="checkbox"
//             name="isPrescriptionRequired"
//             checked={formData.isPrescriptionRequired || false}
//             onChange={handleChange}
//             className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
//           />
//           <span>Prescription Required</span>
//         </label>

//         <button
//           type="submit"
//           disabled={updateMutation.isLoading}
//           className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
//         >
//           {updateMutation.isLoading ? "Saving..." : "Update Product"}
//         </button>
//       </form>
//     </div>
//   );
// }
