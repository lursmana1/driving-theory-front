import { Category } from "@/lib/types/category";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getCategoryIconSrc } from "@/CONSTS/categoryAssets";

type CategoryCardProps = {
  category: Category;
  isActive?: boolean;
};

const CategoryCard = ({ category, isActive }: CategoryCardProps) => {
  return (
    <Link
      href={`/tickets/${category.id}`}
      className={`
        w-full min-w-0 rounded-lg p-2 lg:p-3
        flex flex-col items-center justify-center
        gap-1 lg:gap-2 text-center
        transition select-none
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }
      `}
    >
      <Image
        src={getCategoryIconSrc(category.iconKey)}
        width={28}
        height={28}
        alt={category.name}
        className={`w-7 h-7 lg:w-8 lg:h-8 shrink-0 ${isActive ? "brightness-0 invert" : "opacity-80"}`}
      />

      <span className="font-medium text-xs lg:text-sm truncate w-full">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
