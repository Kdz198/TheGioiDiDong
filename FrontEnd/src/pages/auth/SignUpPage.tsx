import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/router/routes.const";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { registerSchema, type RegisterFormData } from "@/validations/auth.validation";
import { toast } from "sonner";

export function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false as unknown as true,
    },
  });

  const agreeTerms = watch("agreeTerms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const result = await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      login(
        {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
          isActive: result.user.isActive,
          avatar: result.user.avatar,
        },
        result.token
      );
      toast.success("Đăng ký thành công!");
      navigate(ROUTES.HOME);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Tạo tài khoản</h1>
        <p className="mt-2 text-sm text-gray-500">Đăng ký để mua sắm tại TechGear</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input id="fullName" placeholder="Nguyễn Văn A" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" placeholder="0901234567" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeTerms"
            checked={agreeTerms === true}
            onCheckedChange={(checked) =>
              setValue("agreeTerms", checked === true ? true : (false as unknown as true))
            }
          />
          <Label htmlFor="agreeTerms" className="text-sm leading-tight">
            Tôi đồng ý với{" "}
            <span className="cursor-pointer text-teal-500 hover:underline">Điều khoản sử dụng</span>{" "}
            và{" "}
            <span className="cursor-pointer text-teal-500 hover:underline">Chính sách bảo mật</span>
          </Label>
        </div>
        {errors.agreeTerms && <p className="text-sm text-red-500">{errors.agreeTerms.message}</p>}

        <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Đăng ký
        </Button>
      </form>

      <Separator />

      <div className="text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link to={ROUTES.LOGIN} className="text-teal-500 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
