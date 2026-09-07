import { Link } from "@/i18n/navigation";

type SubjectAllCardProps = {
  category: string;
  sp: {
    page?: string;
    size?: string;
    subjects?: string;
  };
  label: string;
};

export default function SubjectAllCard({
  category,
  sp,
  label,
}: SubjectAllCardProps) {
  const isActive = !sp.subjects || sp.subjects.trim() === "";

  const params = new URLSearchParams();
  if (sp.size) params.set("size", sp.size);
  params.set("page", "1");
  params.delete("subjects");

  return (
    <Link
      href={`/tickets/${category}?${params.toString()}`}
      className={`
        block p-3 rounded-xl border transition
        ${
          isActive
            ? "bg-accent text-white border-accent"
            : "bg-white hover:bg-slate-50 border-slate-200"
        }
      `}
    >
      <div className="font-medium">{label}</div>
    </Link>
  );
}
