import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ChangePasswordScreen extends StatelessWidget {
  const ChangePasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Đổi mật khẩu'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              'Mật khẩu hiện tại',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 8),
            const TextField(
              obscureText: true,
              decoration: InputDecoration(
                hintText:
                    'Nhập mật khẩu hiện tại',
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Mật khẩu mới',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 8),
            const TextField(
              obscureText: true,
              decoration: InputDecoration(
                hintText: 'Nhập mật khẩu mới',
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Xác nhận mật khẩu mới',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 8),
            const TextField(
              obscureText: true,
              decoration: InputDecoration(
                hintText:
                    'Nhập lại mật khẩu mới',
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text(
                  'Cập nhật mật khẩu',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
