import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';
import '../../../data/models/order_model.dart';

class OrderDetailScreen extends StatelessWidget {
  final int orderId;

  const OrderDetailScreen({
    super.key,
    required this.orderId,
  });

  String _statusLabel(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending:
        return 'Chờ xác nhận';
      case OrderStatus.confirmed:
        return 'Đã xác nhận';
      case OrderStatus.processing:
        return 'Đang chuẩn bị';
      case OrderStatus.shipping:
        return 'Đang giao hàng';
      case OrderStatus.delivered:
        return 'Đã giao hàng';
      case OrderStatus.cancelled:
        return 'Đã hủy';
      case OrderStatus.returned:
        return 'Đã hoàn trả';
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = DummyData.orders.firstWhere(
      (o) => o.id == orderId,
      orElse: () => DummyData.orders.first,
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Chi tiết ${order.orderCode}',
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'Trạng thái đơn hàng',
                  style: AppTextStyles.labelBold,
                ),
                const SizedBox(height: 8),
                Text(
                  _statusLabel(order.status),
                  style: AppTextStyles.headingSm
                      .copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Items
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'Sản phẩm',
                  style: AppTextStyles.labelBold,
                ),
                const SizedBox(height: 12),
                ...order.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(
                      bottom: 12,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors
                                .surfaceDark,
                            borderRadius:
                                BorderRadius
                                    .circular(8),
                          ),
                          child: const Icon(
                            Icons.image_outlined,
                            color: AppColors.border,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment
                                    .start,
                            children: [
                              Text(
                                item.productName,
                                style: AppTextStyles
                                    .labelBold,
                              ),
                              Text(
                                item.brandName,
                                style: AppTextStyles
                                    .caption,
                              ),
                              Text(
                                'x${item.quantity}'
                                ' — '
                                '${formatVND(item.price)}',
                                style: AppTextStyles
                                    .bodySm,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Payment summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _Row(
                  'Tạm tính',
                  formatVND(order.subtotal),
                ),
                const SizedBox(height: 8),
                _Row(
                  'Giảm giá',
                  '-${formatVND(order.discount)}',
                ),
                const SizedBox(height: 8),
                _Row(
                  'Phí vận chuyển',
                  formatVND(order.shippingFee),
                ),
                const Divider(),
                _Row(
                  'Tổng cộng',
                  formatVND(order.total),
                  isBold: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;

  const _Row(
    this.label,
    this.value, {
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment:
          MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: isBold
              ? AppTextStyles.labelBold
              : AppTextStyles.bodyMd.copyWith(
                  color: AppColors.textSecondary,
                ),
        ),
        Text(
          value,
          style: isBold
              ? AppTextStyles.priceMd
              : AppTextStyles.labelBold,
        ),
      ],
    );
  }
}
