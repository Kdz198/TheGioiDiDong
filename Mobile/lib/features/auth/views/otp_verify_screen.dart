import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class OtpVerifyScreen extends StatelessWidget {
  const OtpVerifyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: AppColors.primary,
          ),
          onPressed: () => context.pop(),
        ),
        title: const Text('Xác minh OTP'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              'Nhập mã 6 chữ số',
              style: AppTextStyles.headingLg,
            ),
            const SizedBox(height: 8),
            Text(
              'Mã OTP đã được gửi đến '
              'email/số điện thoại của bạn.',
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceEvenly,
              children: List.generate(6, (index) {
                return SizedBox(
                  width: 48,
                  height: 56,
                  child: TextField(
                    textAlign: TextAlign.center,
                    keyboardType:
                        TextInputType.number,
                    maxLength: 1,
                    style: AppTextStyles.headingLg,
                    decoration:
                        const InputDecoration(
                      counterText: '',
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () =>
                    context.go('/login'),
                child: const Text('Xác nhận'),
              ),
            ),
            const SizedBox(height: 24),
            Center(
              child: TextButton(
                onPressed: () {},
                child: Text(
                  'Gửi lại mã OTP',
                  style: AppTextStyles.labelBold
                      .copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
