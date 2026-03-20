import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import {
  BarChart3,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
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
  { label: "Sản phẩm", href: ROUTES.ADMIN_PRODUCTS, icon: Package },
  { label: "Phiên bản SP", href: ROUTES.ADMIN_PRODUCT_VERSIONS, icon: Tag },
  { label: "Thương hiệu", href: ROUTES.ADMIN_BRANDS, icon: Bookmark },
  { label: "Danh mục", href: ROUTES.ADMIN_CATEGORIES, icon: FolderTree },
  { label: "Đơn hàng", href: ROUTES.ADMIN_ORDERS, icon: ShoppingCart },
  { label: "Khuyến mãi", href: ROUTES.ADMIN_PROMOTIONS, icon: Tag },
  { label: "Bài viết", href: ROUTES.ADMIN_BLOGS, icon: Newspaper },
  { label: "Người dùng", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Nhân viên", href: ROUTES.ADMIN_EMPLOYEES, icon: UserCog },
  { label: "Nhật ký SP", href: ROUTES.ADMIN_AUDIT_LOGS, icon: ClipboardList },
];

const staffItems: SidebarItem[] = [
  { label: "Sản phẩm", href: ROUTES.STAFF_PRODUCTS, icon: Package },
  { label: "Phiên bản SP", href: ROUTES.STAFF_PRODUCT_VERSIONS, icon: Tag },
  { label: "Thương hiệu", href: ROUTES.STAFF_BRANDS, icon: Bookmark },
  { label: "Đơn hàng", href: ROUTES.STAFF_ORDERS, icon: ShoppingCart },
  { label: "Danh mục", href: ROUTES.STAFF_CATEGORIES, icon: FolderTree },
  { label: "Khuyến mãi", href: ROUTES.STAFF_PROMOTIONS, icon: Tag },
  { label: "Bài viết", href: ROUTES.STAFF_BLOGS, icon: Newspaper },
  { label: "Khách hàng", href: ROUTES.STAFF_USERS, icon: Users },
];

function NavItems({
  items,
  isCollapsed,
  onNavigate,
}: {
  items: SidebarItem[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          const isActive =
            location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          const link = (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isCollapsed && "justify-center px-2",
                isActive ? "bg-teal-50 font-medium text-teal-600" : "text-gray-600 hover:bg-gray-50"
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
          if (isCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>
    </TooltipProvider>
  );
}

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { level, toggle } = useSidebarStore();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isAdmin = user?.role === "admin";
  const items = isAdmin ? adminItems : staffItems;
  const isCollapsed = level === 2;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 z-40 flex h-14 w-full items-center border-b bg-white px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="border-b p-4">
                <Link to={ROUTES.HOME} className="text-xl font-bold">
                  <span className="text-teal-500">Tech</span>
                  <span className="text-zinc-700">Gear</span>
                </Link>
                <p className="mt-1 text-xs text-gray-400">
                  {isAdmin ? "Quản trị viên" : "Nhân viên"}
                </p>
              </div>
              <div className="flex h-[calc(100%-80px)] flex-col">
                <NavItems items={items} isCollapsed={false} />
                <div className="border-t p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to={ROUTES.HOME} className="ml-3 text-xl font-bold">
            <span className="text-teal-500">Tech</span>
            <span className="text-zinc-700">Gear</span>
          </Link>
        </div>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r bg-white transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
      <div className="flex items-center justify-between border-b p-3">
        {!isCollapsed && (
          <Link to={ROUTES.HOME} className="text-xl font-bold">
            <span className="text-teal-500">Tech</span>
            <span className="text-zinc-700">Gear</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", isCollapsed && "mx-auto")}
          onClick={toggle}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="px-4 pt-1 pb-2">
          <p className="text-xs text-gray-400">{isAdmin ? "Quản trị viên" : "Nhân viên"}</p>
        </div>
      )}

      <NavItems items={items} isCollapsed={isCollapsed} />

      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          )}
        </TooltipProvider>
      </div>
    </aside>
  );
}
