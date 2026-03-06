import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/router/routes.const";
import { authService } from "@/services/authService";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/validations/auth.validation";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setIsSent(true);
      toast.success("Link đặt lại mật khẩu đã được gửi!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gửi yêu cầu thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-gray-500">Nhập email để nhận link đặt lại mật khẩu</p>
      </div>

      {isSent ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center">
          <p className="text-sm text-teal-700">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600"
            disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi link đặt lại
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1 text-sm text-teal-500 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
