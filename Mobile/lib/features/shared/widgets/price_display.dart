import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';

class PriceDisplay extends StatelessWidget {
  final double price;
  final double? originalPrice;
  final String size;

  const PriceDisplay({
    super.key,
    required this.price,
    this.originalPrice,
    this.size = 'md',
  });

  @override
  Widget build(BuildContext context) {
    final priceStyle = switch (size) {
      'sm' => AppTextStyles.priceSm,
      'lg' => AppTextStyles.priceLg,
      _ => AppTextStyles.priceMd,
    };
    final isOnSale = originalPrice != null &&
        originalPrice! > price;

    return Row(
      crossAxisAlignment:
          CrossAxisAlignment.end,
      children: [
        Text(
          formatVND(price),
          style: priceStyle,
        ),
        if (isOnSale) ...[
          const SizedBox(width: 8),
          Text(
            formatVND(originalPrice!),
            style: AppTextStyles.priceStrike,
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 6,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: AppColors.error,
              borderRadius:
                  BorderRadius.circular(4),
            ),
            child: Text(
              '-${((originalPrice! - price) / originalPrice! * 100).round()}%',
              style: AppTextStyles.labelSm
                  .copyWith(
                color: Colors.white,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
