export default function TeamLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/5 p-3 w-12 h-12 animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Team Members Skeleton */}
        <section className="space-y-4">
          <div className="h-7 w-40 bg-white/5 rounded animate-pulse" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/10 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Row Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Invite Section Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-56 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
