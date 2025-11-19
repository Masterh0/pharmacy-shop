import iranGeo from "@/src/data/iranGeo.json";

export default function CitySelect({
  province,
  value,
  onChange,
}: {
  province: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // اگر استان انتخاب نشده، لیست شهرها خالی باشد
  const cities = province && iranGeo[province] ? iranGeo[province] : [];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#656565] text-sm">شهر</label>
      <input
        list="city-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={province ? "انتخاب یا جستجو شهر..." : "ابتدا استان را انتخاب کنید"}
        disabled={!province}
        className="border border-[#656565] rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
      />
      {province && (
        <datalist id="city-list">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}
    </div>
  );
}
