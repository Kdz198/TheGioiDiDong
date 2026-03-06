import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState
    extends State<ForgotPasswordScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

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
        title: const Text('Quên mật khẩu'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              'Nhập email hoặc số điện thoại '
              'đã đăng ký',
              style: AppTextStyles.bodyLg,
            ),
            const SizedBox(height: 8),
            Text(
              'Chúng tôi sẽ gửi mã OTP '
              'để xác minh tài khoản của bạn.',
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Email hoặc Số điện thoại',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                hintText:
                    'Nhập email hoặc số điện thoại',
              ),
              keyboardType:
                  TextInputType.emailAddress,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () =>
                    context.push('/otp-verify'),
                child: const Text('Gửi mã OTP'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
