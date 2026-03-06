import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/dummy_data.dart';

class DealsScreen extends StatelessWidget {
  const DealsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ưu đãi & Khuyến mãi'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Flash Sale section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0D000000),
                  blurRadius: 2,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.flash_on,
                      color: AppColors.accent,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'FLASH SALE',
                      style: AppTextStyles.headingSm
                          .copyWith(
                        color: AppColors.accent,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.error,
                        borderRadius:
                            BorderRadius.circular(8),
                      ),
                      child: Text(
                        '23:59:59',
                        style: AppTextStyles.labelMd
                            .copyWith(
                          color: Colors.white,
                          fontWeight:
                              FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Giảm giá lên đến 50% cho '
                  'các sản phẩm được chọn!',
                  style: AppTextStyles.bodyMd,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Promotions
          Text(
            'Khuyến mãi đang diễn ra',
            style: AppTextStyles.headingSm,
          ),
          const SizedBox(height: 12),
          ...DummyData.promotions.map(
            (promo) => Container(
              margin: const EdgeInsets.only(
                bottom: 12,
              ),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0D000000),
                    blurRadius: 2,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Text(
                    promo.title,
                    style:
                        AppTextStyles.headingSm,
                  ),
                  if (promo.description != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      promo.description!,
                      style: AppTextStyles.bodyMd
                          .copyWith(
                        color: AppColors
                            .textSecondary,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 40,
                    child: OutlinedButton(
                      onPressed: () {
                        if (promo.targetRoute !=
                            null) {
                          context.push(
                            promo.targetRoute!,
                          );
                        }
                      },
                      style:
                          OutlinedButton.styleFrom(
                        side: const BorderSide(
                          color: AppColors.primary,
                        ),
                        shape:
                            RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(
                            8,
                          ),
                        ),
                      ),
                      child: Text(
                        'Xem ngay',
                        style: AppTextStyles
                            .labelBold
                            .copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ),
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
