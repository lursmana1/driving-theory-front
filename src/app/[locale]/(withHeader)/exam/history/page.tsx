import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { getServerBaseApi } from "@/api/ServerBaseApi";
import type { AttemptsHistoryResponse } from "@/api/examAttempts";
import Pagination from "@/components/Pagination/Pagination";
import { formatDate } from "@/utills/helpers/formatDate";
import { Link } from "@/i18n/navigation";
import { WeakQuestionsChart } from "@/components/ExamHistory/WeakQuestionsChart";
import { WeakSubjectsChart } from "@/components/ExamHistory/WeakSubjectsChart";
import { getLocalizedSubjects } from "@/CONSTS/subjects";

type PageProps = {
  searchParams?: Promise<{ page?: string; size?: string }>;
};

const PAGE_SIZE = 10;

export default async function ExamHistoryPage({ searchParams }: PageProps) {
  const api = await getServerBaseApi();

  const user = await getUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/auth`);
  }

  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(sp.page ?? "1"));
  const size = Math.min(50, Math.max(1, Number(sp.size ?? String(PAGE_SIZE))));

  let data: AttemptsHistoryResponse;
  try {
    const res = await api.get<AttemptsHistoryResponse>("/exam-attempts", {
      params: { page, size },
    });
    data = res.data;
  } catch {
    data = { data: [], total: 0, page: 1, totalPages: 1 };
  }
  let weakQuestions: any;

  try {
    const res = await api.get<any>("/user-stats/weak-questions");
    weakQuestions = res.data;
  } catch {
    weakQuestions = { data: [] };
  }
  let weakSubjects: any;
  try {
    const res = await api.get<any>("/user-stats/weak-subjects");
    weakSubjects = res.data;
  } catch {
    weakSubjects = { data: [] };
  }

  console.log(weakQuestions, "weak");
  console.log(weakSubjects, "weakSubjects");

  const locale = await getLocale();
  const t = await getTranslations("Exam");
  const subjects = getLocalizedSubjects(locale);

  return (
    <main className="section py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold font-georgian">
          {t("historyTitle")}
        </h1>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
            <span>Date</span>
            <span>Score</span>
            <span>Duration</span>
            <span>Result</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {data.data.length === 0 ? (
              <li className="py-12 text-center text-slate-500">
                {t("historyEmpty")}
              </li>
            ) : (
              data.data.map((attempt) => (
                <li
                  key={attempt.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-4 px-3"
                >
                  <time dateTime={attempt.createdAt} className="text-slate-900">
                    {formatDate(attempt.createdAt, locale, "D MMM YYYY, HH:mm")}
                  </time>
                  <span className="font-medium">
                    {attempt.correctCount}/{attempt.questionCount}
                  </span>
                  <span className="text-slate-600">
                    {attempt.durationSeconds != null
                      ? `${Math.floor(attempt.durationSeconds / 60)}:${String(attempt.durationSeconds % 60).padStart(2, "0")}`
                      : "—"}
                  </span>
                  <span
                    className={`font-medium ${
                      attempt.passed === true
                        ? "text-green-600"
                        : attempt.passed === false
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {attempt.passed === true
                      ? "Passed"
                      : attempt.passed === false
                        ? "Failed"
                        : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>

          {data.total > size && (
            <div className="border-t border-slate-200 p-4">
              <Pagination
                page={data.page}
                total={data.total}
                pathname="/exam/history"
                pageSize={size}
              />
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <WeakQuestionsChart
            data={weakQuestions?.data ?? []}
            title={t("weakQuestionsTitle")}
            questionLabel={t("question")}
            wrongLabel={t("wrongCount")}
          />
          <WeakSubjectsChart
            data={weakSubjects?.data ?? []}
            subjects={subjects}
            title={t("weakSubjectsTitle")}
            wrongLabel={t("wrongCount")}
            correctLabel={t("correctCount")}
            totalLabel={t("totalQuestions")}
            unansweredLabel={t("unanswered")}
          />
        </div>

        <div className="mt-6">
          <Link
            href="/subjectpicker"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {t("startNew")}
          </Link>
        </div>
      </div>
    </main>
  );
}
