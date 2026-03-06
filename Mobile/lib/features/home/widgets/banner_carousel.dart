import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/models/banner_model.dart';

class BannerCarousel extends StatefulWidget {
  final List<BannerModel> banners;

  const BannerCarousel({
    super.key,
    required this.banners,
  });

  @override
  State<BannerCarousel> createState() =>
      _BannerCarouselState();
}

class _BannerCarouselState
    extends State<BannerCarousel> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 320,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.banners.length,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemBuilder: (context, index) {
              final banner = widget.banners[index];
              return _BannerItem(banner: banner);
            },
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment:
              MainAxisAlignment.center,
          children: List.generate(
            widget.banners.length,
            (index) => Container(
              width: index == _currentPage ? 24 : 8,
              height: 8,
              margin:
                  const EdgeInsets.symmetric(
                horizontal: 4,
              ),
              decoration: BoxDecoration(
                color: index == _currentPage
                    ? AppColors.primary
                    : AppColors.border,
                borderRadius:
                    BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _BannerItem extends StatelessWidget {
  final BannerModel banner;

  const _BannerItem({required this.banner});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: 16,
      ),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.primaryLight,
            Color(0xFFF0FDFA),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: AppColors.accent,
              borderRadius:
                  BorderRadius.circular(6),
            ),
            child: Text(
              'Mới nhất',
              style: AppTextStyles.labelSm.copyWith(
                color: Colors.white,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const Spacer(),
          Text(
            banner.title,
            style: AppTextStyles.displayLarge,
          ),
          if (banner.subtitle != null) ...[
            const SizedBox(height: 8),
            Text(
              banner.subtitle!,
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
          const SizedBox(height: 16),
          if (banner.ctaText != null)
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius:
                    BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                    color:
                        AppColors.primaryShadow,
                    blurRadius: 12,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    banner.ctaText!,
                    style: AppTextStyles.buttonMd,
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
        ],
      ),
    );
  }
}
