import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() =>
      _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
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
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Tìm kiếm phụ kiện...',
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            filled: false,
          ),
          style: AppTextStyles.bodyLg,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => _controller.clear(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              'Tìm kiếm gần đây',
              style: AppTextStyles.labelBold,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'sạc nhanh',
                'tai nghe bluetooth',
                'ốp lưng iPhone',
                'chuột gaming',
              ]
                  .map(
                    (term) => Chip(
                      label: Text(
                        term,
                        style:
                            AppTextStyles.bodySm,
                      ),
                      backgroundColor:
                          AppColors.surfaceDark,
                      deleteIcon: const Icon(
                        Icons.close,
                        size: 16,
                      ),
                      onDeleted: () {},
                    ),
                  )
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }
}
