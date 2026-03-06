import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/format_price.dart';
import '../../../data/dummy_data.dart';

class MembershipScreen extends StatelessWidget {
  const MembershipScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final membership = DummyData.membership;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Điểm thành viên'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Tier card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF94A3B8),
                  Color(0xFF475569),
                ],
              ),
              borderRadius:
                  BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'Thành viên Bạc',
                  style: AppTextStyles.headingLg
                      .copyWith(
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${membership.currentPoints} điểm',
                  style: AppTextStyles.displayLarge
                      .copyWith(
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                LinearProgressIndicator(
                  value: membership.totalSpent /
                      10000000,
                  backgroundColor:
                      Colors.white.withValues(
                    alpha: 0.3,
                  ),
                  valueColor:
                      const AlwaysStoppedAnimation(
                    Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Cần thêm '
                  '${formatVND(membership.nextTierSpend)} '
                  'để lên hạng Vàng',
                  style: AppTextStyles.bodySm
                      .copyWith(
                    color: Colors.white.withValues(
                      alpha: 0.9,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Points history
          Text(
            'Lịch sử điểm',
            style: AppTextStyles.headingSm,
          ),
          const SizedBox(height: 12),
          ...membership.history.map(
            (entry) => Container(
              margin: const EdgeInsets.only(
                bottom: 8,
              ),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius:
                    BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          entry.description,
                          style: AppTextStyles
                              .bodyMd,
                        ),
                      ],
                    ),
                  ),
                  Text(
                    entry.points > 0
                        ? '+${entry.points}'
                        : '${entry.points}',
                    style: AppTextStyles.labelBold
                        .copyWith(
                      color: entry.points > 0
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
