import type { Category } from "@/interfaces/product.types";
import {
  BatteryCharging,
  Headphones,
  Laptop,
  Mouse,
  Package,
  Smartphone,
  Watch,
} from "lucide-react";
import { Link } from "react-router-dom";

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return <Package className="h-8 w-8" />;

  const name = categoryName.toLowerCase();

  // Nhận diện từ khóa và trả về icon tương ứng
  if (name.includes("tai nghe") || name.includes("loa")) {
    return <Headphones className="h-8 w-8" />;
  }
  if (name.includes("ốp lưng") || name.includes("điện thoại")) {
    return <Smartphone className="h-8 w-8" />;
  }
  if (name.includes("laptop") || name.includes("máy tính")) {
    return <Laptop className="h-8 w-8" />;
  }
  if (name.includes("chuột") || name.includes("bàn phím")) {
    return <Mouse className="h-8 w-8" />;
  }
  if (name.includes("đồng hồ") || name.includes("watch")) {
    return <Watch className="h-8 w-8" />;
  }
  if (name.includes("sạc") || name.includes("cáp") || name.includes("pin")) {
    return <BatteryCharging className="h-8 w-8" />;
  }

  // Nếu không khớp từ khóa nào, dùng icon chiếc hộp (Package) làm mặc định
  return <Package className="h-8 w-8" />;
};

export function CategoryCard({ category }: { category: Category }) {
  // Thay thế đường dẫn link cho phù hợp (dùng id thay vì slug)
  return (
    <Link
      to={`/category/${category.id}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-transparent p-4 transition-all hover:border-teal-100 hover:bg-teal-50 hover:shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-teal-600 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:shadow-md">
        {getCategoryIcon(category.name)}
      </div>
      <span className="text-center text-sm font-medium text-zinc-700 group-hover:text-teal-600">
        {category.name}
      </span>
    </Link>
  );
}
