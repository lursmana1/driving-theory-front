type ProfileSectionSpinnerProps = {
  label: string;
};

export function ProfileSectionSpinner({ label }: ProfileSectionSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-10 text-slate-400">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      <span className="ml-3 text-sm">{label}</span>
    </div>
  );
}
