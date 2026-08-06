import { Suspense } from "react";
import SubjectPickerPageClient from "@/components/SubjectPicker/SubjectPickerPageClient";

function SubjectPickerFallback() {
  return (
    <div className="section flex min-h-[40vh] items-center justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
    </div>
  );
}

export default function SubjectPickerPage() {
  return (
    <Suspense fallback={<SubjectPickerFallback />}>
      <SubjectPickerPageClient />
    </Suspense>
  );
}
