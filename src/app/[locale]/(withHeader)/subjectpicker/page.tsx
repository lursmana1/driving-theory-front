import {
  getExamRules,
  licenseCategories,
  resolveCategoryId,
} from "@/CONSTS/categories";
import { getLocalizedSubjects } from "@/CONSTS/subjects";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import SubjectPicker from "@/components/SubjectPicker/SubjectPicker";
import { getLocale } from "next-intl/server";

type PageProps = {
  searchParams?: Promise<{ category?: string }>;
};

const SubjectPickerPage = async ({ searchParams }: PageProps) => {
  const sp = searchParams ? await searchParams : {};
  const locale = await getLocale();

  const requestedCategoryId = sp.category ? Number(sp.category) : undefined;
  const categoryId = resolveCategoryId(requestedCategoryId);
  const examRules = getExamRules(categoryId);

  const subjects = getLocalizedSubjects(locale);

  return (
    <div className="section flex flex-col gap-5 bg-slate-50 py-6 sm:gap-6 sm:py-8">
      <CategoryPickerBar
        categories={licenseCategories}
        activeCategoryId={categoryId}
      />
      <SubjectPicker
        key={categoryId}
        categoryId={categoryId}
        subjects={subjects}
        examRules={examRules}
      />
    </div>
  );
};

export default SubjectPickerPage;
