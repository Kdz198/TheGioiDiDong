import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() =>
      _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: AppColors.primary,
          ),
          onPressed: () => context.pop(),
        ),
        title: const Text('Đăng nhập'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: 24,
        ),
        child: Column(
          children: [
            const SizedBox(height: 32),
            // Logo section
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius:
                    BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.devices,
                color: AppColors.primary,
                size: 48,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                Text(
                  'Tech',
                  style: AppTextStyles
                      .displayMedium
                      .copyWith(
                    color: AppColors.primary,
                  ),
                ),
                Text(
                  'Gear',
                  style: AppTextStyles
                      .displayMedium
                      .copyWith(
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Phụ kiện công nghệ cao cấp',
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 32),
            // Welcome
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Chào mừng trở lại!',
                style: AppTextStyles.displayMedium,
              ),
            ),
            const SizedBox(height: 32),
            // Phone/Email input
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Số điện thoại hoặc Email',
                style: AppTextStyles.labelBold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _identifierController,
              decoration: const InputDecoration(
                hintText:
                    'Nhập email hoặc số điện thoại',
              ),
              keyboardType:
                  TextInputType.emailAddress,
            ),
            const SizedBox(height: 24),
            // Password input
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Mật khẩu',
                  style: AppTextStyles.labelBold,
                ),
                GestureDetector(
                  onTap: () => context.push(
                    '/forgot-password',
                  ),
                  child: Text(
                    'Quên mật khẩu?',
                    style: AppTextStyles.labelMd
                        .copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                hintText: 'Nhập mật khẩu',
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_off
                        : Icons.visibility,
                    color: AppColors.textHint,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword =
                          !_obscurePassword;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Login button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => context.go('/'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                  elevation: 4,
                  shadowColor:
                      AppColors.primaryShadow,
                ),
                child: Row(
                  mainAxisAlignment:
                      MainAxisAlignment.center,
                  children: [
                    Text(
                      'Đăng nhập',
                      style:
                          AppTextStyles.buttonLg,
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.arrow_forward,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Divider
            Row(
              children: [
                const Expanded(
                  child: Divider(
                    color: AppColors.border,
                  ),
                ),
                Padding(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 16,
                  ),
                  child: Text(
                    'Hoặc đăng nhập với',
                    style: AppTextStyles.bodySm
                        .copyWith(
                      color: AppColors.textHint,
                    ),
                  ),
                ),
                const Expanded(
                  child: Divider(
                    color: AppColors.border,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Social buttons
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                _SocialButton(
                  icon: Icons.g_mobiledata,
                  color: AppColors.surface,
                  borderColor: AppColors.border,
                  iconColor: AppColors.textPrimary,
                  onTap: () {},
                ),
                const SizedBox(width: 16),
                _SocialButton(
                  icon: Icons.facebook,
                  color: const Color(0xFF1877F2),
                  iconColor: Colors.white,
                  onTap: () {},
                ),
                const SizedBox(width: 16),
                _SocialButton(
                  icon: Icons.apple,
                  color: Colors.black,
                  iconColor: Colors.white,
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Register link
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                Text(
                  'Chưa có tài khoản?',
                  style: AppTextStyles.bodyMd
                      .copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () =>
                      context.push('/register'),
                  child: Text(
                    'Đăng ký ngay',
                    style: AppTextStyles.labelBold
                        .copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color? borderColor;
  final Color iconColor;
  final VoidCallback onTap;

  const _SocialButton({
    required this.icon,
    required this.color,
    this.borderColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: borderColor != null
              ? Border.all(color: borderColor!)
              : null,
        ),
        child: Icon(
          icon,
          color: iconColor,
          size: 28,
        ),
      ),
    );
  }
}
