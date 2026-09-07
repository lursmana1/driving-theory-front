import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type SubjectMenuCardProps = {
  category: string;
  sp: {
    page?: string;
    size?: string;
    subjects?: string;
  };
  subject: {
    id: number;
    name: string;
  };
};

const SubjectMenuCard = async ({ category, sp, subject }: SubjectMenuCardProps) => {
  const t = await getTranslations("Tickets");
  const isActive = sp.subjects === String(subject.id);

  const newParams = new URLSearchParams({
    ...sp,
    page: "1",
    subjects: isActive ? "" : String(subject.id),
  });

  if (!newParams.get("subjects")) {
    newParams.delete("subjects");
  }

  return (
    <Link
      href={`/tickets/${category}?${newParams.toString()}`}
      className={`
        block p-3 rounded-xl border transition
        ${
          isActive
            ? "bg-accent text-white border-accent"
            : "bg-white hover:bg-slate-50 border-slate-200"
        }
      `}
    >
      <div className="font-medium">{subject.name}</div>
      <div className="text-xs opacity-70">{t("subjectNumber", { id: subject.id })}</div>
    </Link>
  );
};

export default SubjectMenuCard;
