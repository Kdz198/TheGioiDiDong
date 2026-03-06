import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class StarRatingDisplay extends StatelessWidget {
  final double rating;
  final int? reviewCount;

  const StarRatingDisplay({
    super.key,
    required this.rating,
    this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (index) {
          if (index < rating.floor()) {
            return const Icon(
              Icons.star,
              color: AppColors.star,
              size: 16,
            );
          }
          if (index < rating.ceil() &&
              rating - index >= 0.5) {
            return const Icon(
              Icons.star_half,
              color: AppColors.star,
              size: 16,
            );
          }
          return const Icon(
            Icons.star_border,
            color: AppColors.star,
            size: 16,
          );
        }),
        const SizedBox(width: 4),
        Text(
          rating.toStringAsFixed(1),
          style: AppTextStyles.labelMd,
        ),
        if (reviewCount != null) ...[
          const SizedBox(width: 4),
          Text(
            '($reviewCount đánh giá)',
            style: AppTextStyles.bodySm,
          ),
        ],
      ],
    );
  }
}
