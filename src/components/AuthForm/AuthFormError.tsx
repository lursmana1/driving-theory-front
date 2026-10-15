export default function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-control border border-danger-muted bg-danger-soft px-4 py-3 text-sm text-danger-strong"
    >
      {message}
    </div>
  );
}
