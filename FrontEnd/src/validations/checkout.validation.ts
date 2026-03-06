import { z } from "zod/v4";

export const shippingInfoSchema = z.object({
  recipientName: z.string().min(1, "Vui lòng nhập họ tên người nhận"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  streetAddress: z.string().min(1, "Vui lòng nhập địa chỉ cụ thể"),
  deliveryNote: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingInfo: shippingInfoSchema,
  paymentMethod: z.enum(["momo", "vnpay", "cod"], {
    error: "Vui lòng chọn phương thức thanh toán",
  }),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
