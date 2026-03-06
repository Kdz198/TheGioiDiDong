import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class WriteReviewScreen extends StatefulWidget {
  final int productId;

  const WriteReviewScreen({
    super.key,
    required this.productId,
  });

  @override
  State<WriteReviewScreen> createState() =>
      _WriteReviewScreenState();
}

class _WriteReviewScreenState
    extends State<WriteReviewScreen> {
  int _rating = 0;
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Đánh giá sản phẩm'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              'Đánh giá của bạn',
              style: AppTextStyles.headingSm,
            ),
            const SizedBox(height: 16),
            // Star rating
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _rating = index + 1;
                    });
                  },
                  child: Padding(
                    padding:
                        const EdgeInsets.all(4),
                    child: Icon(
                      index < _rating
                          ? Icons.star
                          : Icons.star_border,
                      color: AppColors.star,
                      size: 40,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            Text(
              'Nhận xét của bạn',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _commentController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText:
                    'Chia sẻ trải nghiệm '
                    'của bạn về sản phẩm...',
                alignLabelWithHint: true,
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _rating > 0
                    ? () => context.pop()
                    : null,
                child: const Text('Gửi đánh giá'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
