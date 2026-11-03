import { YARD_EXAM_VIDEO } from "@/CONSTS/yardExamVideo";

type YardExamVideoProps = {
  title: string;
  caption: string;
  languageNote?: string;
};

/** Vertical (9:16) walkthrough of the yard exam. Loads nothing until play. */
export default function YardExamVideo({
  title,
  caption,
  languageNote,
}: YardExamVideoProps) {
  return (
    <figure className="mx-auto flex w-full max-w-xs flex-col gap-3 lg:mx-0">
      <div className="aspect-9/16 w-full overflow-hidden rounded-panel bg-stage shadow-card">
        <video
          className="h-full w-full object-cover"
          src={YARD_EXAM_VIDEO.src}
          poster={YARD_EXAM_VIDEO.poster}
          width={YARD_EXAM_VIDEO.width}
          height={YARD_EXAM_VIDEO.height}
          controls
          playsInline
          preload="none"
          aria-label={title}
        />
      </div>
      <figcaption className="flex flex-col gap-1">
        <span className="font-georgian text-sm font-semibold text-fg">{title}</span>
        <span className="text-sm leading-6 text-fg-muted">{caption}</span>
        {languageNote ? (
          <span className="text-xs text-fg-subtle">{languageNote}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
