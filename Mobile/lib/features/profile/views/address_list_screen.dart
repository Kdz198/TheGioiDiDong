import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/dummy_data.dart';

class AddressListScreen extends StatelessWidget {
  const AddressListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final addresses = DummyData.addresses;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Địa chỉ của tôi'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...addresses.map(
            (addr) => Container(
              margin: const EdgeInsets.only(
                bottom: 12,
              ),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(12),
                border: Border.all(
                  color: addr.isDefault
                      ? AppColors.primary
                      : AppColors.border,
                ),
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        addr.recipientName,
                        style: AppTextStyles
                            .labelBold,
                      ),
                      if (addr.isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding:
                              const EdgeInsets
                                  .symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors
                                .primaryLight,
                            borderRadius:
                                BorderRadius
                                    .circular(4),
                          ),
                          child: Text(
                            'Mặc định',
                            style: AppTextStyles
                                .caption
                                .copyWith(
                              color:
                                  AppColors.primary,
                              fontWeight:
                                  FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    addr.phone,
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    addr.fullAddress,
                    style: AppTextStyles.bodyMd
                        .copyWith(
                      color:
                          AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () =>
                context.push('/addresses/add'),
            icon: const Icon(Icons.add),
            label: const Text('Thêm địa chỉ'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(
                color: AppColors.primary,
              ),
              shape: RoundedRectangleBorder(
                borderRadius:
                    BorderRadius.circular(12),
              ),
              minimumSize: const Size(
                double.infinity,
                52,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
