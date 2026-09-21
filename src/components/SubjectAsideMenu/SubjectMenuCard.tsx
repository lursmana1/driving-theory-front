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

  const newParams = new URLSearchParams();
  if (sp.size) newParams.set("size", sp.size);
  if (!isActive) newParams.set("subjects", String(subject.id));
  const query = newParams.toString();

  return (
    <Link
      href={`/tickets/${category}${query ? `?${query}` : ""}`}
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
