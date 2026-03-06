import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class QuantitySelector extends StatelessWidget {
  final int quantity;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;
  final int min;
  final int? max;

  const QuantitySelector({
    super.key,
    required this.quantity,
    required this.onDecrement,
    required this.onIncrement,
    this.min = 1,
    this.max,
  });

  @override
  Widget build(BuildContext context) {
    final isAtMin = quantity <= min;
    final isAtMax = max != null && quantity >= max!;

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _QtyButton(
            icon: Icons.remove,
            onTap: isAtMin ? null : onDecrement,
            color: AppColors.surface,
            iconColor: isAtMin
                ? AppColors.textHint
                : AppColors.textPrimary,
          ),
          Padding(
            padding:
                const EdgeInsets.symmetric(
              horizontal: 8,
            ),
            child: Text(
              quantity.toString().padLeft(2, '0'),
              style: AppTextStyles.labelMd
                  .copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          _QtyButton(
            icon: Icons.add,
            onTap: isAtMax ? null : onIncrement,
            color: isAtMax
                ? AppColors.textHint
                : AppColors.primary,
            iconColor: Colors.white,
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final Color color;
  final Color iconColor;

  const _QtyButton({
    required this.icon,
    this.onTap,
    required this.color,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          color: color,
          borderRadius:
              BorderRadius.circular(4),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0D000000),
              blurRadius: 2,
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 14,
          color: iconColor,
        ),
      ),
    );
  }
}
