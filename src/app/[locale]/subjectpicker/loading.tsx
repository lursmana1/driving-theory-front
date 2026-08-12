import SubjectPickerSkeleton from "@/components/SubjectPicker/SubjectPickerSkeleton";

export default function SubjectPickerLoading() {
  return (
    <div className="section flex flex-col gap-5 bg-slate-50 py-6 sm:gap-6 sm:py-8">
      <div className="relative -mx-6 h-[5.5rem] animate-pulse rounded-xl bg-slate-200/70 sm:-mx-8" />
      <SubjectPickerSkeleton />
    </div>
  );
}
