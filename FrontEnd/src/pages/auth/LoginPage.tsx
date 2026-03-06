import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/interfaces/user.types";
import { ROUTES } from "@/router/routes.const";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginFormData } from "@/validations/auth.validation";
import { toast } from "sonner";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await authService.login(data);
      login(
        {
          id: result.user.id,
          email: result.user.email,
          name: result.user.fullName,
          role: result.user.role,
          avatar: result.user.avatar,
        },
        result.token
      );

      toast.success("Đăng nhập thành công!");

      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        navigate(returnUrl);
      } else if (result.user.role === "admin") {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (result.user.role === "staff") {
        navigate(ROUTES.STAFF_ORDERS);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = (role: UserRole) => {
    const demoUser = {
      id: Date.now(),
      email: `demo+${role}@example.com`,
      name: `Demo ${role}`,
      role,
      avatar: "",
    };

    // Bypass real auth for demo purposes
    login(demoUser, "demo-token");

    if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
    else if (role === "staff") navigate(ROUTES.STAFF_ORDERS);
    else navigate(ROUTES.HOME);
  };

  const demoAccounts = [
    {
      role: "admin" as UserRole,
      label: "Quản trị viên",
      color: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    {
      role: "staff" as UserRole,
      label: "Nhân viên",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    {
      role: "customer" as UserRole,
      label: "Khách hàng",
      color: "bg-teal-500 hover:bg-teal-600 text-white",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="relative text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-1/2 left-0 flex -translate-y-1/2 items-center gap-1 text-sm text-gray-500 transition-colors hover:text-teal-500">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-zinc-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-500">Chào mừng bạn quay lại TechGear</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-teal-500 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Đăng nhập
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <p className="text-center text-xs font-medium tracking-wide text-gray-400 uppercase">
          Tài khoản demo
        </p>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map(({ role, label, color }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleDemo(role)}
              className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${color}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link to={ROUTES.SIGNUP} className="text-teal-500 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
