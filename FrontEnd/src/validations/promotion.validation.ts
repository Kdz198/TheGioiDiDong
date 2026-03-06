import { z } from "zod/v4";

export const createVoucherSchema = z.object({
  code: z
    .string()
    .min(1, "Vui lòng nhập mã giảm giá")
    .min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
    .regex(/^[A-Z0-9_-]+$/, "Mã giảm giá chỉ chứa chữ in hoa, số, gạch ngang và gạch dưới"),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"], {
    error: "Vui lòng chọn loại giảm giá",
  }),
  discountValue: z
    .number({ error: "Vui lòng nhập giá trị giảm giá" })
    .positive("Giá trị giảm giá phải lớn hơn 0"),
  minOrderValue: z
    .number({ error: "Vui lòng nhập giá trị đơn hàng tối thiểu" })
    .min(0, "Giá trị không được âm"),
  maxDiscountAmount: z.number().positive("Giá trị giảm tối đa phải lớn hơn 0").optional(),
  usageLimit: z
    .number({ error: "Vui lòng nhập giới hạn sử dụng" })
    .int("Số lượng phải là số nguyên")
    .positive("Giới hạn sử dụng phải lớn hơn 0"),
  expiresAt: z.string().min(1, "Vui lòng chọn ngày hết hạn"),
  isActive: z.boolean().optional(),
});

export type CreateVoucherFormData = z.infer<typeof createVoucherSchema>;

export const createPromotionSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên khuyến mãi")
    .min(3, "Tên khuyến mãi phải có ít nhất 3 ký tự"),
  description: z.string().min(1, "Vui lòng nhập mô tả khuyến mãi"),
  type: z.enum(["flash_sale", "category_discount", "bundle", "voucher"], {
    error: "Vui lòng chọn loại khuyến mãi",
  }),
  discountValue: z
    .number({ error: "Vui lòng nhập giá trị giảm giá" })
    .positive("Giá trị giảm giá phải lớn hơn 0"),
  appliesTo: z.enum(["all", "category", "product"], {
    error: "Vui lòng chọn phạm vi áp dụng",
  }),
  startAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endAt: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean().optional(),
});

export type CreatePromotionFormData = z.infer<typeof createPromotionSchema>;
