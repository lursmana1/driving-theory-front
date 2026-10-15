export default function SubjectPickerSkeleton() {
  return (
    <div
      className="mx-auto w-full animate-pulse font-georgian"
      aria-busy="true"
      aria-label="Loading topics"
    >
      <div className="mb-4 hidden h-11 max-w-xs rounded-full bg-surface-strong md:mx-auto md:block" />
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex flex-wrap justify-center gap-6 border-b border-line-subtle px-8 py-4">
          <div className="h-5 w-24 rounded-xs bg-surface-sunken" />
          <div className="h-5 w-24 rounded-xs bg-surface-sunken" />
          <div className="h-5 w-24 rounded-xs bg-surface-sunken" />
        </div>
        <div className="space-y-4 px-8 py-5">
          <div className="h-6 w-36 rounded-xs bg-surface-sunken" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-9 rounded-control bg-surface-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
