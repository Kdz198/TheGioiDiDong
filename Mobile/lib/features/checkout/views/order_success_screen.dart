import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/dummy_data.dart';

class OrderSuccessScreen extends StatelessWidget {
  final int orderId;

  const OrderSuccessScreen({
    super.key,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context) {
    final order = DummyData.orders.firstWhere(
      (o) => o.id == orderId,
      orElse: () => DummyData.orders.first,
    );
    final address = DummyData.addresses.first;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/'),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'TECH',
              style: AppTextStyles.headingSm
                  .copyWith(
                color: AppColors.primary,
              ),
            ),
            Text(
              'GEAR',
              style: AppTextStyles.headingSm
                  .copyWith(
                color: AppColors.accent,
              ),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 24),
            // Success icon
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: AppColors.primary
                    .withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check,
                color: AppColors.primary,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Đặt hàng thành công!',
              style: AppTextStyles.displayMedium,
            ),
            const SizedBox(height: 12),
            Text(
              'Cảm ơn bạn đã tin tưởng lựa chọn '
              'TechGear. Đơn hàng của bạn '
              'đang được xử lý.',
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            // Order summary card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.borderLight,
                ),
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
                  // Order code
                  Text(
                    'MÃ ĐƠN HÀNG',
                    style: AppTextStyles.caption
                        .copyWith(
                      letterSpacing: 0.8,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    order.orderCode,
                    style: AppTextStyles.labelBold,
                  ),
                  const SizedBox(height: 16),
                  const Divider(
                    color: AppColors.borderLight,
                  ),
                  const SizedBox(height: 16),
                  // Estimated delivery
                  Row(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.local_shipping,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment:
                            CrossAxisAlignment
                                .start,
                        children: [
                          Text(
                            'DỰ KIẾN GIAO HÀNG',
                            style: AppTextStyles
                                .caption
                                .copyWith(
                              letterSpacing: 0.5,
                              fontWeight:
                                  FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Thứ Năm, 24 '
                            'Tháng 10, 2026',
                            style: AppTextStyles
                                .labelBold,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Delivery address
                  Row(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.location_on,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment
                                  .start,
                          children: [
                            Text(
                              'ĐỊA CHỈ NHẬN HÀNG',
                              style: AppTextStyles
                                  .caption
                                  .copyWith(
                                letterSpacing: 0.5,
                                fontWeight:
                                    FontWeight.w700,
                              ),
                            ),
                            const SizedBox(
                              height: 4,
                            ),
                            Text(
                              address
                                  .recipientName,
                              style: AppTextStyles
                                  .bodyMd,
                            ),
                            Text(
                              address.fullAddress,
                              style: AppTextStyles
                                  .bodyMd
                                  .copyWith(
                                color: AppColors
                                    .textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Action buttons
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text(
                  'Tiếp tục mua sắm',
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton(
                onPressed: () => context.push(
                  '/orders/$orderId',
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(
                    color: AppColors.border,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  'Xem chi tiết đơn hàng',
                  style: AppTextStyles.buttonLg
                      .copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Mọi thắc mắc vui lòng liên hệ',
              style: AppTextStyles.bodySm,
            ),
            Text(
              '1900 1234',
              style: AppTextStyles.labelBold
                  .copyWith(
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
