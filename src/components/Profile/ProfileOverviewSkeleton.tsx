export function ProfileOverviewSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex justify-center py-12 text-slate-400">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    </section>
  );
}
