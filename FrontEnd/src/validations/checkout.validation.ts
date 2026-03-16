import { z } from "zod/v4";

/**
 * Schema validation for checkout form, including shipping information and payment method.
 * @deprecated since backend is currently hardcoded to "payos" and does not support other payment methods. We can re-enable this validation and adjust the payment method options once backend supports more methods.
 */
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

/**
 * Schema for validating the entire checkout form, including shipping information and payment method.
 * @deprecated since backend is currently hardcoded to "payos" and does not support other payment methods. We can re-enable this validation and adjust the payment method options once backend supports more methods.
 */
export const checkoutSchema = z.object({
  shippingInfo: shippingInfoSchema,
  paymentMethod: z.enum(["momo", "vnpay", "cod", "payos"], {
    error: "Vui lòng chọn phương thức thanh toán",
  }),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
