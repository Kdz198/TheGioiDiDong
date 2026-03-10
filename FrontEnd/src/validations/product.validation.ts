import { z } from "zod/v4";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên sản phẩm")
    .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  description: z.string().min(1, "Vui lòng nhập mô tả chi tiết"),
  categoryId: z.number({ error: "Vui lòng chọn danh mục" }).positive("Vui lòng chọn danh mục"),
  brandId: z.number({ error: "Vui lòng chọn thương hiệu" }).positive("Vui lòng chọn thương hiệu"),
  flashSaleEndAt: z.string().optional(),
  active: z.boolean().optional(),
  price: z
    .number({ error: "Vui lòng nhập giá bán" })
    .int("Giá bán phải là số nguyên")
    .positive("Giá bán phải lớn hơn 0"),
  stockQuantity: z
    .number({ error: "Vui lòng nhập số lượng tồn kho" })
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

export const productVariantSchema = z.object({
  sku: z.string().min(1, "Vui lòng nhập SKU"),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.number({ error: "Vui lòng nhập giá bán" }).positive("Giá bán phải lớn hơn 0"),
  originalPrice: z.number({ error: "Vui lòng nhập giá gốc" }).positive("Giá gốc phải lớn hơn 0"),
  stockQuantity: z
    .number({ error: "Vui lòng nhập số lượng tồn kho" })
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm"),
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;

export const updateProductSchema = createProductSchema;

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
