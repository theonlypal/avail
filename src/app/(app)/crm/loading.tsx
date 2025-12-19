export default function CRMLoading() {
  return (
    <div className="relative min-h-screen">
      <div className="space-y-5 pb-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-7 w-32 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-11 bg-slate-900/50 border border-white/10 rounded-lg animate-pulse" />
          <div className="h-11 w-32 bg-slate-900/50 border border-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 bg-slate-900/50">
            <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse mt-2" />
          </div>

          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5">
                <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse hidden md:block" />
                <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse hidden lg:block" />
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse hidden xl:block" />
                <div className="w-8 h-8 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
