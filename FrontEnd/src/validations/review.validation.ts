import { z } from "zod/v4";

export const createReviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5),
  title: z.string().optional(),
  content: z
    .string()
    .min(10, "Đánh giá phải có ít nhất 10 ký tự")
    .max(1000, "Đánh giá không quá 1000 ký tự"),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
