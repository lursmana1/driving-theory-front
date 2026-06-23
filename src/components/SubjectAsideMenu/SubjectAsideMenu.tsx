import { getLocalizedSubjects } from "@/CONSTS/subjects";
import SubjectMenuCard from "./SubjectMenuCard";
import SubjectAllCard from "./SubjectAllCard";
import { getLocale, getTranslations } from "next-intl/server";
import SubjectSelectMobile from "./SubjectSelets";

type SubjectAsideMenuProps = {
  category: string;
  sp: {
    page?: string;
    size?: string;
    subjects?: string;
  };
};

const SubjectAsideMenu = async ({ category, sp }: SubjectAsideMenuProps) => {
  const locale = await getLocale();
  const t = await getTranslations("Tickets");
  const subjects = getLocalizedSubjects(locale);

  return (
    <aside className="z-10 w-full shrink-0 space-y-4 lg:w-72 lg:sticky lg:top-20">
      {/* MOBILE dropdown */}
      <SubjectSelectMobile
        category={category}
        sp={sp}
        subjects={subjects}
        label={t("subjects")}
        allSubjectsLabel={t("allSubjects")}
      />

      {/* Subject cards - 2 cols mobile, 1 col desktop */}
      <div className="max-lg:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 lg:p-4">
          <h2 className="font-semibold text-sm lg:text-lg mb-3">
            {t("subjects")}
          </h2>

          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-1.5 lg:gap-2 max-h-[70vh] overflow-y-auto pr-1">
            <SubjectAllCard category={category} sp={sp} label={t("allSubjects")} />
            {subjects.map((subject) => (
              <SubjectMenuCard
                key={subject.id}
                category={category}
                sp={sp}
                subject={subject}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SubjectAsideMenu;
