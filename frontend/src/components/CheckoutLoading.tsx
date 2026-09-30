export default function CheckoutLoading() {
  return (
    <div className="w-full min-h-screen bg-white px-4">
      {/* Stepper Skeleton */}
      <div className="w-full flex justify-center mt-5 lg:mt-[30px] mb-8 lg:mb-[48px]">
        <div className="w-full max-w-[700px] flex items-center justify-center gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse" />
              <div className="w-16 h-3 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main skeleton */}
      <div className="w-full flex justify-center pb-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="h-6 w-32 rounded bg-slate-100 animate-pulse" />

            <div className="h-20 w-full rounded-xl bg-slate-100 animate-pulse" />

            <div className="h-20 w-full rounded-xl bg-slate-100 animate-pulse" />

            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>

          <div className="rounded-2xl border border-slate-100 p-6 space-y-5 h-fit">
            <div className="h-6 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}