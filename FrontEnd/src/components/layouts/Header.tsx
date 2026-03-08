import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/router/routes.const";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { Heart, LogOut, Menu, Package, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, user, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-1 text-xl font-bold">
          <span className="text-teal-500">Tech</span>
          <span className="text-zinc-700">Gear</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to={ROUTES.HOME} className="text-sm font-medium text-zinc-700 hover:text-teal-500">
            Trang chủ
          </Link>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-sm font-medium text-zinc-700 hover:text-teal-500">
            Sản phẩm
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <Link
              to={ROUTES.WISHLIST}
              className="relative hidden p-2 text-zinc-600 hover:text-teal-500 md:block">
              <Heart className="h-5 w-5" />
            </Link>
          )}

          <Link to={ROUTES.CART} className="relative p-2 text-zinc-600 hover:text-teal-500">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 p-0 text-[10px] text-white">
                {cartCount}
              </Badge>
            )}
          </Link>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{user?.fullName}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.PROFILE}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.ORDER_HISTORY}>
                    <Package className="mr-2 h-4 w-4" />
                    Đơn hàng
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </Button>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600" asChild>
                <Link to={ROUTES.SIGNUP}>Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white p-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <nav className="space-y-2">
            <Link
              to={ROUTES.HOME}
              className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link
              to={ROUTES.PRODUCTS}
              className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}>
              Sản phẩm
            </Link>
            {!isLoggedIn && (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="block rounded-md px-3 py-2 text-sm text-teal-500 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
