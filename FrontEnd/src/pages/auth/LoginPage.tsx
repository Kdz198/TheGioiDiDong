import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/router/routes.const";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginFormData } from "@/validations/auth.validation";
import { toast } from "sonner";

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Quản trị viên",
    email: "superadmin@gmail.com",
    password: "123",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  {
    label: "Nhân viên",
    email: "staff@gmail.com",
    password: "123",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  {
    label: "Khách hàng",
    email: "user@gmail.com",
    password: "123",
    color: "bg-teal-500 hover:bg-teal-600 text-white",
  },
];

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingEmail, setDemoLoadingEmail] = useState<string | null>(null);
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

  const handleLoginSuccess = (result: Awaited<ReturnType<typeof authService.login>>) => {
    login(result.user, result.token, result.expiresIn);
    toast.success("Đăng nhập thành công!");

    const role = result.user.role;
    const returnUrl = searchParams.get("returnUrl");

    // Validate returnUrl against the user's actual role to avoid 403.
    // Admin routes require "admin", staff routes require "staff" only.
    const canAccessReturnUrl =
      !!returnUrl &&
      ((!returnUrl.startsWith("/admin") && !returnUrl.startsWith("/staff")) ||
        (returnUrl.startsWith("/admin") && role === "admin") ||
        (returnUrl.startsWith("/staff") && role === "staff"));

    if (canAccessReturnUrl) {
      navigate(returnUrl);
    } else if (role === "admin") {
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else if (role === "staff") {
      navigate(ROUTES.STAFF_ORDERS);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await authService.login(data);
      handleLoginSuccess(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (account: DemoAccount) => {
    try {
      setDemoLoadingEmail(account.email);
      const result = await authService.login({
        email: account.email,
        password: account.password,
      });
      handleLoginSuccess(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập demo thất bại. Vui lòng thử lại."
      );
    } finally {
      setDemoLoadingEmail(null);
    }
  };

  const isAnyLoading = isLoading || demoLoadingEmail !== null;

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

        <Button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600"
          disabled={isAnyLoading}>
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
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleDemo(account)}
              disabled={isAnyLoading}
              className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-60 ${account.color}`}>
              {demoLoadingEmail === account.email && <Loader2 className="h-3 w-3 animate-spin" />}
              {account.label}
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
