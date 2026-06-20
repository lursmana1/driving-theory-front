import { licenseCategories } from "@/CONSTS/categoriesDummy";
import { subjects as subjectList } from "@/CONSTS/subjectDummy";
import CategorySelect from "@/components/categoryComponents/CategorySelect/CategorySelect";
import SubjectPicker from "@/components/SubjectPicker/SubjectPicker";
import { getTranslations } from "next-intl/server";

type PageProps = {
  searchParams?: Promise<{ category?: string }>;
};

const DEFAULT_CATEGORY_ID = 1;

const SubjectPickerPage = async ({ searchParams }: PageProps) => {
  const sp = searchParams ? await searchParams : {};
  const t = await getTranslations("SubjectPicker");

  const requestedCategoryId = sp.category ? Number(sp.category) : undefined;
  const categoryId =
    requestedCategoryId != null &&
    licenseCategories.some((c) => c.id === requestedCategoryId)
      ? requestedCategoryId
      : DEFAULT_CATEGORY_ID;

  const subjects = subjectList.map((s) => ({ ...s, questionsCount: 0 }));

  return (
    <div className="section flex flex-col gap-4 py-6 lg:gap-3 lg:py-4 justify-center items-center">
      <h1 className="font-georgian text-3xl font-bold">
        {t("pageTitle")}
      </h1>
      <CategorySelect
        categories={licenseCategories}
        activeCategoryId={categoryId}
      />
      <SubjectPicker categoryId={categoryId} subjects={subjects} />
    </div>
  );
};

export default SubjectPickerPage;
