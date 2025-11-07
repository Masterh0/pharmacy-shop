export default function VariantRow({ variant, onDelete }) {
  return (
    <tr className="border-b text-sm">
      <td className="p-2">{variant.id}</td>
      <td className="p-2">{variant.packageType}</td>
      <td className="p-2">{variant.price.toLocaleString()} تومان</td>
      <td className="p-2">{variant.stock}</td>
      <td className="p-2">
        <button
          onClick={onDelete}
          className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
        >
          حذف
        </button>
      </td>
    </tr>
  );
}
