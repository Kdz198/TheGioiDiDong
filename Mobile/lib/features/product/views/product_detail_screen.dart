import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';

class ProductDetailScreen extends StatelessWidget {
  final int productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  Widget build(BuildContext context) {
    final product = DummyData.products.firstWhere(
      (p) => p.id == productId,
      orElse: () => DummyData.products.first,
    );
    final reviews =
        DummyData.getReviewsForProduct(productId);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(
              Icons.favorite_border,
            ),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            // Image gallery placeholder
            Container(
              height: 300,
              width: double.infinity,
              color: AppColors.inputBackground,
              child: Stack(
                children: [
                  const Center(
                    child: Icon(
                      Icons.image_outlined,
                      size: 80,
                      color: AppColors.border,
                    ),
                  ),
                  if (product.isHot)
                    Positioned(
                      top: 16,
                      left: 16,
                      child: Container(
                        padding:
                            const EdgeInsets
                                .symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius:
                              BorderRadius.circular(
                                  8),
                        ),
                        child: Text(
                          'HOT',
                          style: AppTextStyles
                              .labelSm
                              .copyWith(
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  if (product.isNew)
                    Positioned(
                      top: 16,
                      left: 16,
                      child: Container(
                        padding:
                            const EdgeInsets
                                .symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius:
                              BorderRadius.circular(
                                  8),
                        ),
                        child: Text(
                          'NEW',
                          style: AppTextStyles
                              .labelSm
                              .copyWith(
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Product info
            Padding(
              padding: const EdgeInsets.all(16),
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
                  const SizedBox(height: 8),
                  Text(
                    product.name,
                    style: AppTextStyles.headingLg,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      ...List.generate(
                        5,
                        (i) => Icon(
                          i < product.rating.floor()
                              ? Icons.star
                              : Icons.star_border,
                          color: AppColors.star,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        product.rating
                            .toStringAsFixed(1),
                        style:
                            AppTextStyles.labelBold,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${product.reviewCount} '
                        'đánh giá)',
                        style:
                            AppTextStyles.bodySm,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text(
                        formatVND(product.price),
                        style:
                            AppTextStyles.priceLg,
                      ),
                      if (product.isOnSale) ...[
                        const SizedBox(width: 12),
                        Text(
                          formatVND(
                            product.originalPrice!,
                          ),
                          style: AppTextStyles
                              .priceStrike
                              .copyWith(
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding:
                              const EdgeInsets
                                  .symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.error,
                            borderRadius:
                                BorderRadius
                                    .circular(6),
                          ),
                          child: Text(
                            '-${(product.discountPercent * 100).round()}%',
                            style: AppTextStyles
                                .labelSm
                                .copyWith(
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.isInStock
                        ? 'Còn hàng'
                        : 'Hết hàng',
                    style: AppTextStyles.labelBold
                        .copyWith(
                      color: product.isInStock
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Description
                  Text(
                    'Mô tả sản phẩm',
                    style: AppTextStyles.headingSm,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description,
                    style: AppTextStyles.bodyMd,
                  ),
                  const SizedBox(height: 24),
                  // Specifications
                  if (product
                      .specifications.isNotEmpty) ...[
                    Text(
                      'Thông số kỹ thuật',
                      style:
                          AppTextStyles.headingSm,
                    ),
                    const SizedBox(height: 8),
                    ...product.specifications
                        .entries
                        .map(
                      (entry) => Padding(
                        padding:
                            const EdgeInsets.only(
                          bottom: 8,
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 120,
                              child: Text(
                                entry.key,
                                style: AppTextStyles
                                    .bodyMd
                                    .copyWith(
                                  color: AppColors
                                      .textSecondary,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Text(
                                entry.value,
                                style: AppTextStyles
                                    .bodyMd,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  // Reviews
                  Text(
                    'Đánh giá (${reviews.length})',
                    style: AppTextStyles.headingSm,
                  ),
                  const SizedBox(height: 12),
                  ...reviews.map(
                    (review) => Padding(
                      padding:
                          const EdgeInsets.only(
                        bottom: 16,
                      ),
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment
                                .start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor:
                                    AppColors
                                        .primaryLight,
                                child: Text(
                                  review.userName[0],
                                  style:
                                      AppTextStyles
                                          .labelBold
                                          .copyWith(
                                    color: AppColors
                                        .primary,
                                  ),
                                ),
                              ),
                              const SizedBox(
                                width: 8,
                              ),
                              Text(
                                review.userName,
                                style: AppTextStyles
                                    .labelBold,
                              ),
                              const Spacer(),
                              ...List.generate(
                                5,
                                (i) => Icon(
                                  i < review.rating
                                      ? Icons.star
                                      : Icons
                                          .star_border,
                                  color:
                                      AppColors.star,
                                  size: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            review.comment,
                            style:
                                AppTextStyles.bodyMd,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(
              color: AppColors.borderLight,
            ),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                borderRadius:
                    BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.border,
                ),
              ),
              child: const Icon(
                Icons.favorite_border,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SizedBox(
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: product.isInStock
                      ? () {}
                      : null,
                  icon: const Icon(
                    Icons.shopping_cart_outlined,
                  ),
                  label: Text(
                    product.isInStock
                        ? 'Thêm vào giỏ hàng'
                        : 'Hết hàng',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
