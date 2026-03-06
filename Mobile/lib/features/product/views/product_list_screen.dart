import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';
import '../../../data/models/product_model.dart';

class ProductListScreen extends StatelessWidget {
  const ProductListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final products = DummyData.products;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cửa hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(
                  Icons.shopping_cart_outlined,
                ),
                onPressed: () {},
              ),
              Positioned(
                top: 4,
                right: 4,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '2',
                      style: AppTextStyles.caption
                          .copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 9,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Category/count bar
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(
                bottom: BorderSide(
                  color: AppColors.divider,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Danh Mục Sạc Dự Phòng',
                  style: AppTextStyles.labelBold,
                ),
                Text(
                  '${products.length} sản phẩm',
                  style: AppTextStyles.bodySm,
                ),
              ],
            ),
          ),
          // Filter chip row
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(
                bottom: BorderSide(
                  color: AppColors.divider,
                ),
              ),
            ),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(
                  label: 'Bộ lọc',
                  isActive: true,
                  icon: Icons.tune,
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: '10.000mAh',
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: '20.000mAh',
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Fast Charging',
                  isActive: true,
                ),
              ],
            ),
          ),
          // Product grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.55,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return _ProductGridCard(
                  product: product,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isActive;
  final IconData? icon;

  const _FilterChip({
    required this.label,
    this.isActive = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: isActive
            ? AppColors.primary
            : AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isActive
              ? AppColors.primary
              : AppColors.border,
        ),
        boxShadow: isActive
            ? const [
                BoxShadow(
                  color: AppColors.primaryShadow,
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 16,
              color: isActive
                  ? Colors.white
                  : AppColors.primary,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTextStyles.labelMd.copyWith(
              color: isActive
                  ? Colors.white
                  : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductGridCard extends StatelessWidget {
  final ProductModel product;

  const _ProductGridCard({
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
          // Image
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
          // Info
          Expanded(
            child: Padding(
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
                  const Spacer(),
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
          ),
        ],
      ),
    );
  }
}
