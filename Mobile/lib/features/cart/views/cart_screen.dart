import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Sample cart items from dummy data
    final cartProducts = DummyData.products
        .take(2)
        .toList();
    final subtotal = cartProducts.fold<double>(
      0,
      (sum, p) => sum + p.price,
    );
    const discount = 250000.0;
    final shippingFee =
        subtotal >= 500000 ? 0.0 : 30000.0;
    final total =
        subtotal - discount + shippingFee;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Giỏ hàng của bạn'),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text(
              'Xóa hết',
              style: AppTextStyles.labelBold
                  .copyWith(
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Cart items
          ...cartProducts.map(
            (product) => Container(
              margin: const EdgeInsets.only(
                bottom: 12,
              ),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0D000000),
                    blurRadius: 2,
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Product image
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      borderRadius:
                          BorderRadius.circular(8),
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
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: AppTextStyles
                              .labelBold,
                          maxLines: 2,
                          overflow: TextOverflow
                              .ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          product.brandName,
                          style: AppTextStyles
                              .caption
                              .copyWith(
                            fontWeight:
                                FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment
                                  .spaceBetween,
                          children: [
                            Text(
                              formatVND(
                                product.price,
                              ),
                              style: AppTextStyles
                                  .priceSm,
                            ),
                            // Quantity selector
                            Container(
                              padding:
                                  const EdgeInsets
                                      .all(4),
                              decoration:
                                  BoxDecoration(
                                color: AppColors
                                    .surfaceDark,
                                borderRadius:
                                    BorderRadius
                                        .circular(
                                  8,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration:
                                        BoxDecoration(
                                      color: AppColors
                                          .surface,
                                      borderRadius:
                                          BorderRadius
                                              .circular(
                                        4,
                                      ),
                                    ),
                                    child:
                                        const Icon(
                                      Icons.remove,
                                      size: 14,
                                    ),
                                  ),
                                  Padding(
                                    padding:
                                        const EdgeInsets
                                            .symmetric(
                                      horizontal: 8,
                                    ),
                                    child: Text(
                                      '01',
                                      style:
                                          AppTextStyles
                                              .labelMd
                                              .copyWith(
                                        fontWeight:
                                            FontWeight
                                                .w700,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration:
                                        BoxDecoration(
                                      color: AppColors
                                          .primary,
                                      borderRadius:
                                          BorderRadius
                                              .circular(
                                        4,
                                      ),
                                    ),
                                    child:
                                        const Icon(
                                      Icons.add,
                                      size: 14,
                                      color: Colors
                                          .white,
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
                ],
              ),
            ),
          ),
          // Voucher input
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(12),
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
                  'MÃ GIẢM GIÁ',
                  style: AppTextStyles.labelSm
                      .copyWith(
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 36,
                        padding:
                            const EdgeInsets
                                .symmetric(
                          horizontal: 12,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors
                              .inputBackground,
                          borderRadius:
                              BorderRadius.circular(
                            8,
                          ),
                          border: Border.all(
                            color:
                                AppColors.divider,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons
                                  .confirmation_number_outlined,
                              size: 16,
                              color: AppColors
                                  .textHint,
                            ),
                            const SizedBox(
                              width: 8,
                            ),
                            Text(
                              'Nhập mã giảm giá',
                              style: AppTextStyles
                                  .bodyMd
                                  .copyWith(
                                color: AppColors
                                    .textHint,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      height: 36,
                      width: 80,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius:
                            BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          'Áp dụng',
                          style: AppTextStyles
                              .labelBold
                              .copyWith(
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius:
                  BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0D000000),
                  blurRadius: 2,
                ),
              ],
            ),
            child: Column(
              children: [
                _SummaryRow(
                  'Tạm tính',
                  formatVND(subtotal),
                ),
                const SizedBox(height: 12),
                _SummaryRow(
                  'Giảm giá',
                  '-${formatVND(discount)}',
                  valueColor: AppColors.success,
                ),
                const SizedBox(height: 12),
                const Divider(
                  color: AppColors.divider,
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment
                          .spaceBetween,
                  children: [
                    Text(
                      'Tổng cộng',
                      style: AppTextStyles
                          .headingSm,
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
            onPressed: () =>
                context.push('/checkout'),
            child: const Text(
              'Tiến hành thanh toán',
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _SummaryRow(
    this.label,
    this.value, {
    this.valueColor,
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
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
