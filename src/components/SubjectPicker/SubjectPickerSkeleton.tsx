export default function SubjectPickerSkeleton() {
  return (
    <div
      className="mx-auto w-full animate-pulse font-georgian"
      aria-busy="true"
      aria-label="Loading topics"
    >
      <div className="mb-4 hidden h-11 max-w-xs rounded-full bg-slate-200 md:mx-auto md:block" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap justify-center gap-6 border-b border-slate-100 px-8 py-4">
          <div className="h-5 w-24 rounded bg-slate-100" />
          <div className="h-5 w-24 rounded bg-slate-100" />
          <div className="h-5 w-24 rounded bg-slate-100" />
        </div>
        <div className="space-y-4 px-8 py-5">
          <div className="h-6 w-36 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
