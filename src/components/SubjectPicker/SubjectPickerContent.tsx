import {
  examRulesFromCategory,
  getCategoryById,
} from "@/api/categories";
import { getTranslations } from "next-intl/server";
import SubjectPicker from "@/components/SubjectPicker/SubjectPicker";

type SubjectPickerContentProps = {
  categoryId: number;
  locale: string;
};

export default async function SubjectPickerContent({
  categoryId,
  locale,
}: SubjectPickerContentProps) {
  try {
    const category = await getCategoryById(categoryId, locale);
    const examRules = examRulesFromCategory(category);
    const subjects = (category.subjects ?? []).map((subject) => ({
      id: subject.id,
      name: subject.name,
      questionsCount: subject.questionsCount ?? 0,
    }));

    return (
      <SubjectPicker
        categoryId={categoryId}
        subjects={subjects}
        examRules={examRules}
        durationMinutes={category.durationMinutes ?? 30}
      />
    );
  } catch {
    const t = await getTranslations("SubjectPicker");
    return (
      <p className="py-16 text-center text-slate-500">{t("loadError")}</p>
    );
  }
}
