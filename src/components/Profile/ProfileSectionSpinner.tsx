type ProfileSectionSpinnerProps = {
  label: string;
};

export function ProfileSectionSpinner({ label }: ProfileSectionSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-10 text-fg-faint">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-fg-faint" />
      <span className="ml-3 text-sm">{label}</span>
    </div>
  );
}
