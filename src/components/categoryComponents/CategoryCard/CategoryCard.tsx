import { Category } from "@/lib/types/category";
import { Link } from "@/i18n/navigation";
import { getCategoryIconSrc } from "@/CONSTS/categoryAssets";
import { CategoryIcon } from "@/components/categoryComponents/CategoryIcon";

type CategoryCardProps = {
  category: Category;
  isActive?: boolean;
};

const CategoryCard = ({ category, isActive }: CategoryCardProps) => {
  return (
    <Link
      href={`/tickets/${category.id}`}
      className={`
        w-full min-w-0 rounded-control p-2 lg:p-3
        flex flex-col items-center justify-center
        gap-1 lg:gap-2 text-center
        transition select-none
        ${
          isActive
            ? "bg-accent text-on-accent shadow-raised"
            : "bg-surface-strong text-fg-muted hover:bg-line-strong"
        }
      `}
    >
      <CategoryIcon
        src={getCategoryIconSrc(category.iconKey, category.id)}
        alt={category.name}
        className="h-7 w-7 lg:h-8 lg:w-8"
        inverted={isActive}
      />

      <span className="font-medium text-xs lg:text-sm truncate w-full">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
