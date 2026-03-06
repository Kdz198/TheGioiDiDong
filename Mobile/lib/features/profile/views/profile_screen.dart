import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0D000000),
                    blurRadius: 2,
                  ),
                ],
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor:
                        AppColors.primaryLight,
                    child: Text(
                      'N',
                      style: AppTextStyles
                          .displayLarge
                          .copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Nguyễn Văn A',
                    style: AppTextStyles.headingMd,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'user@techgear.vn',
                    style: AppTextStyles.bodyMd
                        .copyWith(
                      color:
                          AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius:
                          BorderRadius.circular(20),
                    ),
                    child: Text(
                      '🥈 Thành viên Bạc',
                      style: AppTextStyles.labelMd
                          .copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '1.250 điểm',
                    style: AppTextStyles.labelBold
                        .copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Account menu
            _MenuSection(
              title: 'Tài khoản',
              items: [
                _MenuItem(
                  icon: Icons.person_outline,
                  label: 'Thông tin cá nhân',
                  onTap: () =>
                      context.push('/profile/edit'),
                ),
                _MenuItem(
                  icon: Icons.lock_outline,
                  label: 'Đổi mật khẩu',
                  onTap: () => context.push(
                    '/profile/change-password',
                  ),
                ),
                _MenuItem(
                  icon: Icons.location_on_outlined,
                  label: 'Địa chỉ của tôi',
                  onTap: () => context.push(
                    '/profile/addresses',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Shopping menu
            _MenuSection(
              title: 'Mua sắm',
              items: [
                _MenuItem(
                  icon: Icons.inventory_2_outlined,
                  label: 'Đơn hàng',
                  onTap: () =>
                      context.push('/orders'),
                ),
                _MenuItem(
                  icon: Icons.favorite_outline,
                  label: 'Yêu thích',
                  onTap: () => context.push(
                    '/profile/wishlist',
                  ),
                ),
                _MenuItem(
                  icon: Icons.star_outline,
                  label: 'Điểm thành viên',
                  onTap: () => context.push(
                    '/profile/membership',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Support menu
            _MenuSection(
              title: 'Hỗ trợ',
              items: [
                _MenuItem(
                  icon: Icons.help_outline,
                  label: 'Hỏi & Đáp',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.phone_outlined,
                  label: 'Liên hệ hỗ trợ',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.rate_review_outlined,
                  label: 'Đánh giá ứng dụng',
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Logout button
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(
                  color: AppColors.error,
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
              child: Text(
                'Đăng xuất',
                style: AppTextStyles.buttonLg
                    .copyWith(
                  color: AppColors.error,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'v1.0.0',
                style: AppTextStyles.bodySm,
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
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
          Padding(
            padding: const EdgeInsets.fromLTRB(
              16, 16, 16, 8,
            ),
            child: Text(
              title,
              style: AppTextStyles.labelSm
                  .copyWith(
                color: AppColors.textSecondary,
                letterSpacing: 0.8,
              ),
            ),
          ),
          ...items,
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: AppColors.primary,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.bodyMd,
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.textHint,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
