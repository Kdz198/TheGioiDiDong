import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ConfirmationDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmLabel;
  final String cancelLabel;
  final VoidCallback onConfirm;
  final bool isDangerous;

  const ConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmLabel = 'Xác nhận',
    this.cancelLabel = 'Hủy',
    required this.onConfirm,
    this.isDangerous = false,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Text(
        title,
        style: AppTextStyles.headingSm,
      ),
      content: Text(
        message,
        style: AppTextStyles.bodyMd.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      actions: [
        TextButton(
          onPressed: () =>
              Navigator.of(context).pop(false),
          child: Text(
            cancelLabel,
            style: AppTextStyles.labelBold
                .copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop(true);
            onConfirm();
          },
          child: Text(
            confirmLabel,
            style: AppTextStyles.labelBold
                .copyWith(
              color: isDangerous
                  ? AppColors.error
                  : AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}
