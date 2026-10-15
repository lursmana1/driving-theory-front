export function ProfileOverviewSkeleton() {
  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="border-b border-line-subtle px-4 py-4 sm:px-5">
        <div className="h-6 w-36 animate-pulse rounded-xs bg-surface-strong" />
      </div>
      <div className="flex justify-center py-12 text-fg-faint">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-fg-faint" />
      </div>
    </section>
  );
}
