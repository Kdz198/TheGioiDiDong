import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() =>
      _CheckoutScreenState();
}

class _CheckoutScreenState
    extends State<CheckoutScreen> {
  String _paymentMethod = 'cod';

  @override
  Widget build(BuildContext context) {
    final address = DummyData.addresses.first;
    const total = 3530000.0;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Thanh toán'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Delivery address
          _SectionCard(
            title: 'ĐỊA CHỈ GIAO HÀNG',
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      address.recipientName,
                      style:
                          AppTextStyles.labelBold,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      address.phone,
                      style:
                          AppTextStyles.bodySm,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  address.fullAddress,
                  style: AppTextStyles.bodyMd
                      .copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => context.push(
                    '/checkout/addresses',
                  ),
                  child: Text(
                    'Thay đổi',
                    style: AppTextStyles.labelBold
                        .copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // 2. Payment method
          _SectionCard(
            title: 'PHƯƠNG THỨC THANH TOÁN',
            child: Column(
              children: [
                _PaymentOption(
                  icon: Icons.account_balance_wallet,
                  label: 'Ví MoMo',
                  value: 'momo',
                  groupValue: _paymentMethod,
                  onChanged: (v) {
                    setState(() {
                      _paymentMethod = v!;
                    });
                  },
                ),
                _PaymentOption(
                  icon: Icons.credit_card,
                  label: 'VNPay',
                  value: 'vnpay',
                  groupValue: _paymentMethod,
                  onChanged: (v) {
                    setState(() {
                      _paymentMethod = v!;
                    });
                  },
                ),
                _PaymentOption(
                  icon: Icons.local_shipping,
                  label:
                      'Thanh toán khi nhận hàng',
                  value: 'cod',
                  groupValue: _paymentMethod,
                  onChanged: (v) {
                    setState(() {
                      _paymentMethod = v!;
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // 3. Price breakdown
          _SectionCard(
            title: 'CHI TIẾT THANH TOÁN',
            child: Column(
              children: [
                _PriceRow(
                  'Tạm tính',
                  formatVND(3750000),
                ),
                const SizedBox(height: 8),
                _PriceRow(
                  'Giảm giá',
                  '-${formatVND(250000)}',
                  color: AppColors.success,
                ),
                const SizedBox(height: 8),
                _PriceRow(
                  'Phí vận chuyển',
                  'Miễn phí',
                  color: AppColors.success,
                ),
                const SizedBox(height: 8),
                const Divider(
                  color: AppColors.divider,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment
                          .spaceBetween,
                  children: [
                    Text(
                      'Tổng cộng',
                      style:
                          AppTextStyles.headingSm,
                    ),
                    Text(
                      formatVND(total),
                      style: AppTextStyles.priceLg,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
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
        child: SizedBox(
          height: 56,
          child: ElevatedButton(
            onPressed: () => context.push(
              '/order-success/1',
            ),
            child: Text(
              'Đặt hàng — ${formatVND(total)}',
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
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
            title,
            style: AppTextStyles.labelSm.copyWith(
              color: AppColors.textSecondary,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String groupValue;
  final ValueChanged<String?> onChanged;

  const _PaymentOption({
    required this.icon,
    required this.label,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return RadioListTile<String>(
      value: value,
      groupValue: groupValue,
      onChanged: onChanged,
      contentPadding: EdgeInsets.zero,
      secondary: Icon(
        icon,
        color: AppColors.primary,
      ),
      title: Text(
        label,
        style: AppTextStyles.bodyMd,
      ),
      activeColor: AppColors.primary,
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _PriceRow(
    this.label,
    this.value, {
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment:
          MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.bodyMd.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.labelBold.copyWith(
            color: color,
          ),
        ),
      ],
    );
  }
}
