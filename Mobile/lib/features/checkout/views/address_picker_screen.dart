import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/dummy_data.dart';

class AddressPickerScreen extends StatelessWidget {
  const AddressPickerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final addresses = DummyData.addresses;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Chọn địa chỉ'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...addresses.map(
            (addr) => Container(
              margin: const EdgeInsets.only(
                bottom: 12,
              ),
              child: RadioListTile<int>(
                value: addr.id,
                groupValue: 1,
                onChanged: (_) {},
                contentPadding:
                    const EdgeInsets.all(12),
                shape: RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(12),
                  side: const BorderSide(
                    color: AppColors.border,
                  ),
                ),
                activeColor: AppColors.primary,
                title: Text(
                  '${addr.recipientName} '
                  '| ${addr.phone}',
                  style: AppTextStyles.labelBold,
                ),
                subtitle: Text(
                  addr.fullAddress,
                  style: AppTextStyles.bodySm,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: () => context.pop(),
              child: const Text('Xác nhận'),
            ),
          ),
        ],
      ),
    );
  }
}
