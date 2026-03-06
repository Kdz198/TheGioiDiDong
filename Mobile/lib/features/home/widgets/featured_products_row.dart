import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/models/product_model.dart';

class FeaturedProductsRow extends StatelessWidget {
  final List<ProductModel> products;

  const FeaturedProductsRow({
    super.key,
    required this.products,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 310,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
        ),
        itemCount: products.length,
        separatorBuilder: (_, __) =>
            const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final product = products[index];
          return _ProductCard(product: product);
        },
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final ProductModel product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(
        '/products/${product.id}',
      ),
      child: Container(
        width: 173,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A000000),
              blurRadius: 3,
              offset: Offset(0, 1),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            // Image area
            Stack(
              children: [
                Container(
                  height: 173,
                  width: double.infinity,
                  color: AppColors.inputBackground,
                  child: const Icon(
                    Icons.image_outlined,
                    size: 48,
                    color: AppColors.border,
                  ),
                ),
                if (product.isHot)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius:
                            BorderRadius.circular(6),
                      ),
                      child: Text(
                        'HOT',
                        style: AppTextStyles.labelSm
                            .copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                if (product.isNew && !product.isHot)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius:
                            BorderRadius.circular(6),
                      ),
                      child: Text(
                        'NEW',
                        style: AppTextStyles.labelSm
                            .copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Info area
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Text(
                    product.brandName,
                    style: AppTextStyles.labelSm
                        .copyWith(
                      color: AppColors.primary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.name,
                    style: AppTextStyles.labelMd,
                    maxLines: 2,
                    overflow:
                        TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        color: AppColors.accent,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        product.rating
                            .toStringAsFixed(1),
                        style:
                            AppTextStyles.labelMd,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    formatVND(product.price),
                    style: AppTextStyles.priceMd,
                  ),
                  if (product.isOnSale)
                    Text(
                      formatVND(
                        product.originalPrice!,
                      ),
                      style:
                          AppTextStyles.priceStrike,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
