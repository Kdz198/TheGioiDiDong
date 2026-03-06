import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class HomeAppBar extends StatelessWidget {
  const HomeAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(
        16, 12, 16, 12,
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Logo
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius:
                      BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.devices,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'TECH',
                style: AppTextStyles.headingSm
                    .copyWith(
                  color: AppColors.primary,
                ),
              ),
              Text(
                'GEAR',
                style: AppTextStyles.headingSm,
              ),
              const Spacer(),
              // Cart icon with badge
              GestureDetector(
                onTap: () => context.go('/cart'),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Icon(
                      Icons.shopping_cart_outlined,
                      size: 24,
                    ),
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration:
                            const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '3',
                            style: AppTextStyles
                                .caption
                                .copyWith(
                              color: Colors.white,
                              fontWeight:
                                  FontWeight.w700,
                              fontSize: 9,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              const Icon(
                Icons.person_outline,
                size: 24,
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Search bar
          GestureDetector(
            onTap: () => context.push('/search'),
            child: Container(
              height: 44,
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 12,
              ),
              decoration: BoxDecoration(
                color: AppColors.inputBackground,
                borderRadius:
                    BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.borderLight,
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.search,
                    color: AppColors.textHint,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Tìm kiếm phụ kiện '
                    '(ví dụ: sạc nhanh, '
                    'ốp lưng...)',
                    style: AppTextStyles.bodyMd
                        .copyWith(
                      color: AppColors.textHint,
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
