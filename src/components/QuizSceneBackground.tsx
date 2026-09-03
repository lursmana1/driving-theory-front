import Image from "next/image";

export const QUIZ_SCENE_BG = "/png/download.png";
const QUIZ_SCENE_SIZE = { width: 800, height: 800 } as const;

type QuizSceneBackgroundProps = {
  /** First visible card / exam question — preloads with fetchpriority=high */
  priority?: boolean;
};

export function QuizSceneBackground({
  priority = false,
}: QuizSceneBackgroundProps) {
  return (
    <Image
      src={QUIZ_SCENE_BG}
      alt=""
      width={QUIZ_SCENE_SIZE.width}
      height={QUIZ_SCENE_SIZE.height}
      sizes="100vw"
      priority={priority}
      className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
      aria-hidden
    />
  );
}
