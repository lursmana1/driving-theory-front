import Image from "next/image";
import { ICONS, type IconName } from "@/CONSTS/icons";

type IconProps = {
  name: IconName;
  className?: string;
  size?: number;
};

export function Icon({ name, className, size = 20 }: IconProps) {
  return (
    <Image
      src={ICONS[name]}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
      unoptimized
    />
  );
}
