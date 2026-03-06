import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class EmptyStateWidget extends StatelessWidget {
  final String? imagePath;
  final IconData? icon;
  final String title;
  final String? subtitle;
  final String? ctaLabel;
  final VoidCallback? onCta;

  const EmptyStateWidget({
    super.key,
    this.imagePath,
    this.icon,
    required this.title,
    this.subtitle,
    this.ctaLabel,
    this.onCta,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center,
          children: [
            if (icon != null)
              Icon(
                icon,
                size: 80,
                color: AppColors.border,
              ),
            const SizedBox(height: 16),
            Text(
              title,
              style: AppTextStyles.headingSm,
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: AppTextStyles.bodyMd
                    .copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (ctaLabel != null &&
                onCta != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: 200,
                child: ElevatedButton(
                  onPressed: onCta,
                  child: Text(ctaLabel!),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
