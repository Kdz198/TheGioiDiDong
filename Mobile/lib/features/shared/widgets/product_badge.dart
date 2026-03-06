import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

enum BadgeType { hot, newBadge, sale, flash }

class ProductBadge extends StatelessWidget {
  final BadgeType type;
  final String? discountText;

  const ProductBadge({
    super.key,
    required this.type,
    this.discountText,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    String label;

    switch (type) {
      case BadgeType.hot:
        bgColor = AppColors.accent;
        label = 'HOT';
      case BadgeType.newBadge:
        bgColor = AppColors.primary;
        label = 'NEW';
      case BadgeType.sale:
        bgColor = AppColors.error;
        label = discountText ?? 'SALE';
      case BadgeType.flash:
        bgColor = AppColors.accent;
        label = '⚡ FLASH';
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: AppTextStyles.labelSm.copyWith(
          color: Colors.white,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
