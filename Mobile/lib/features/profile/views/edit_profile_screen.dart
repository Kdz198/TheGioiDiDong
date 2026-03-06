import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Chỉnh sửa hồ sơ'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor:
                      AppColors.primaryLight,
                  child: Text(
                    'N',
                    style: AppTextStyles
                        .displayLarge
                        .copyWith(
                      color: AppColors.primary,
                      fontSize: 40,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.camera_alt,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            _buildField(
              'Họ và tên',
              'Nguyễn Văn A',
            ),
            const SizedBox(height: 16),
            _buildField(
              'Số điện thoại',
              '0901234567',
            ),
            const SizedBox(height: 16),
            _buildField(
              'Email',
              'user@techgear.vn',
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Lưu thay đổi'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(
    String label,
    String value,
  ) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelBold,
        ),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: value,
          decoration: const InputDecoration(),
        ),
      ],
    );
  }
}
