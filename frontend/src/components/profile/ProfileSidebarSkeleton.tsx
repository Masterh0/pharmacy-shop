// src/components/profile/ProfileSidebarSkeleton.tsx
export default function ProfileSidebarSkeleton() {
  return (
    <aside
      dir="ltr"
      className="w-[310px] flex-shrink-0 bg-white rounded-2xl border border-[#EDEDED] shadow px-4 py-5 flex flex-col self-start sticky top-10"
    >
      {/* Avatar / Name */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
      </div>

      <hr className="border-[#EDEDED] mb-4" />

      {/* Menu items */}
      <div className="flex flex-col gap-[6px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-[6px] px-[10px] rounded-[10px] border-b border-[#EDEDED]"
          >
            <div className="w-[18px] h-[18px] bg-gray-200 rounded animate-pulse" />
            <div
              className="h-3 bg-gray-200 rounded animate-pulse"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
