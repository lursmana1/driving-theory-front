import Image from "next/image";
import { getQuestionImageSrc } from "@/utills/helpers/getQuestionImageSrc";

type QuestionImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function QuestionImage({
  src,
  alt,
  className = "",
  priority,
}: QuestionImageProps) {
  return (
    <Image
      src={getQuestionImageSrc(src)}
      alt={alt}
      width={1000}
      height={410}
      priority={priority}
      className={`mx-auto w-full object-contain ${className}`}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
