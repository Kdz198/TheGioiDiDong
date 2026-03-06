import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class AddEditAddressScreen extends StatelessWidget {
  final int? addressId;

  const AddEditAddressScreen({
    super.key,
    this.addressId,
  });

  bool get isEditing => addressId != null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(
          isEditing
              ? 'Sửa địa chỉ'
              : 'Thêm địa chỉ mới',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            _buildField('Tên người nhận'),
            const SizedBox(height: 16),
            _buildField('Số điện thoại'),
            const SizedBox(height: 16),
            _buildField('Địa chỉ (số nhà, đường)'),
            const SizedBox(height: 16),
            _buildField('Tỉnh/Thành phố'),
            const SizedBox(height: 16),
            _buildField('Quận/Huyện'),
            const SizedBox(height: 16),
            _buildField('Phường/Xã'),
            const SizedBox(height: 16),
            Row(
              children: [
                Checkbox(
                  value: false,
                  onChanged: (_) {},
                  activeColor: AppColors.primary,
                ),
                Text(
                  'Đặt làm địa chỉ mặc định',
                  style: AppTextStyles.bodyMd,
                ),
              ],
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Lưu địa chỉ'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelBold,
        ),
        const SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: 'Nhập $label',
          ),
        ),
      ],
    );
  }
}
