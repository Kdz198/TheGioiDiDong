import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';

class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerBox({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceDark,
      highlightColor: AppColors.surface,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surfaceDark,
          borderRadius: BorderRadius.circular(
            borderRadius,
          ),
        ),
      ),
    );
  }
}

class ShimmerProductCard extends StatelessWidget {
  const ShimmerProductCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        const ShimmerBox(height: 173),
        const SizedBox(height: 12),
        const ShimmerBox(
          height: 12,
          width: 60,
        ),
        const SizedBox(height: 8),
        const ShimmerBox(height: 14),
        const SizedBox(height: 4),
        const ShimmerBox(
          height: 14,
          width: 120,
        ),
        const SizedBox(height: 8),
        const ShimmerBox(
          height: 16,
          width: 80,
        ),
      ],
    );
  }
}
