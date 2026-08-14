import Image from "next/image";

export const QUIZ_SCENE_BG = "/png/download.png";

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
      fill
      sizes="100vw"
      priority={priority}
      className="pointer-events-none object-contain object-center"
      aria-hidden
    />
  );
}
