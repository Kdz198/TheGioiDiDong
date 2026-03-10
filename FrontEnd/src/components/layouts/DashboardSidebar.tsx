import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import {
  BarChart3,
  Bookmark,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminItems: SidebarItem[] = [
  { label: "Tổng quan", href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: "Báo cáo", href: ROUTES.ADMIN_REPORTS, icon: BarChart3 },
  { label: "Người dùng", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Nhân viên", href: ROUTES.ADMIN_EMPLOYEES, icon: UserCog },
  { label: "Thanh toán", href: ROUTES.ADMIN_PAYMENTS, icon: CreditCard },
];

const staffItems: SidebarItem[] = [
  { label: "Sản phẩm", href: ROUTES.STAFF_PRODUCTS, icon: Package },
  { label: "Thương hiệu", href: ROUTES.STAFF_BRANDS, icon: Bookmark },
  { label: "Đơn hàng", href: ROUTES.STAFF_ORDERS, icon: ShoppingCart },
  { label: "Danh mục", href: ROUTES.STAFF_CATEGORIES, icon: FolderTree },
  { label: "Khuyến mãi", href: ROUTES.STAFF_PROMOTIONS, icon: Tag },
  { label: "Khách hàng", href: ROUTES.STAFF_USERS, icon: Users },
  { label: "Phản hồi", href: ROUTES.STAFF_FEEDBACK, icon: MessageSquare },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const items = isAdmin ? adminItems : staffItems;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="border-b p-4">
        <Link to={ROUTES.HOME} className="text-xl font-bold">
          <span className="text-teal-500">Tech</span>
          <span className="text-zinc-700">Gear</span>
        </Link>
        <p className="mt-1 text-xs text-gray-400">{isAdmin ? "Quản trị viên" : "Nhân viên"}</p>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-teal-50 font-medium text-teal-600"
                : "text-gray-600 hover:bg-gray-50"
            )}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
