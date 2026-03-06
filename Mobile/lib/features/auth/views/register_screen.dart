import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() =>
      _RegisterScreenState();
}

class _RegisterScreenState
    extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController =
      TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
        title: const Text('Đăng ký'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: 24,
        ),
        child: Column(
          children: [
            const SizedBox(height: 24),
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
            const SizedBox(height: 24),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Tạo tài khoản mới',
                style: AppTextStyles.displayMedium,
              ),
            ),
            const SizedBox(height: 24),
            _buildField(
              'Họ và tên',
              _nameController,
              'Nhập họ và tên',
            ),
            const SizedBox(height: 16),
            _buildField(
              'Số điện thoại',
              _phoneController,
              'Nhập số điện thoại',
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            _buildField(
              'Email',
              _emailController,
              'Nhập email',
              keyboardType:
                  TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            _buildPasswordField(
              'Mật khẩu',
              _passwordController,
              'Nhập mật khẩu',
              _obscurePassword,
              () {
                setState(() {
                  _obscurePassword =
                      !_obscurePassword;
                });
              },
            ),
            const SizedBox(height: 16),
            _buildPasswordField(
              'Xác nhận mật khẩu',
              _confirmPasswordController,
              'Nhập lại mật khẩu',
              _obscureConfirm,
              () {
                setState(() {
                  _obscureConfirm =
                      !_obscureConfirm;
                });
              },
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Checkbox(
                  value: _agreedToTerms,
                  onChanged: (value) {
                    setState(() {
                      _agreedToTerms = value ?? false;
                    });
                  },
                  activeColor: AppColors.primary,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(
                      top: 12,
                    ),
                    child: Text.rich(
                      TextSpan(
                        text: 'Tôi đồng ý với ',
                        style: AppTextStyles.bodySm,
                        children: [
                          TextSpan(
                            text:
                                'Điều khoản sử dụng',
                            style: AppTextStyles
                                .bodySm
                                .copyWith(
                              color:
                                  AppColors.primary,
                              fontWeight:
                                  FontWeight.w600,
                            ),
                          ),
                          const TextSpan(
                            text: ' và ',
                          ),
                          TextSpan(
                            text:
                                'Chính sách bảo mật',
                            style: AppTextStyles
                                .bodySm
                                .copyWith(
                              color:
                                  AppColors.primary,
                              fontWeight:
                                  FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _agreedToTerms
                    ? () => context.go('/')
                    : null,
                child: const Text('Đăng ký'),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                Text(
                  'Đã có tài khoản?',
                  style: AppTextStyles.bodyMd
                      .copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () =>
                      context.push('/login'),
                  child: Text(
                    'Đăng nhập ngay',
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

  Widget _buildField(
    String label,
    TextEditingController controller,
    String hint, {
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelBold),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          decoration: InputDecoration(hintText: hint),
          keyboardType: keyboardType,
        ),
      ],
    );
  }

  Widget _buildPasswordField(
    String label,
    TextEditingController controller,
    String hint,
    bool obscure,
    VoidCallback toggleObscure,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelBold),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: obscure,
          decoration: InputDecoration(
            hintText: hint,
            suffixIcon: IconButton(
              icon: Icon(
                obscure
                    ? Icons.visibility_off
                    : Icons.visibility,
                color: AppColors.textHint,
              ),
              onPressed: toggleObscure,
            ),
          ),
        ),
      ],
    );
  }
}
