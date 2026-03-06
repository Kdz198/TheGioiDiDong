import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class NewsletterSection extends StatelessWidget {
  const NewsletterSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: 16,
      ),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            'Đừng bỏ lỡ các ưu đãi\nđộc quyền!',
            style: AppTextStyles.headingLg.copyWith(
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Opacity(
            opacity: 0.9,
            child: Text(
              'Đăng ký để nhận tin khuyến mãi '
              'sớm nhất và mã giảm giá '
              'cho đơn hàng đầu tiên.',
              style: AppTextStyles.bodyMd.copyWith(
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                  child: Align(
                    alignment:
                        Alignment.centerLeft,
                    child: Text(
                      'Địa chỉ email của bạn',
                      style: AppTextStyles.bodyMd
                          .copyWith(
                        color: AppColors.textHint,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                height: 48,
                width: 112,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius:
                      BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(
                      color:
                          AppColors.accentShadow,
                      blurRadius: 12,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    'Gửi ngay',
                    style: AppTextStyles.buttonMd,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
