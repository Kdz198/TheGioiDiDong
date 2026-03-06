import 'package:flutter/material.dart';
import '../../../data/repositories/review_repository.dart';

class ReviewViewModel extends ChangeNotifier {
  final ReviewRepository _repository;

  ReviewViewModel({
    ReviewRepository? repository,
  }) : _repository =
            repository ?? ReviewRepository();

  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> submitReview({
    required int productId,
    required int rating,
    required String comment,
    List<String>? imageUrls,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      await _repository.submitReview(
        productId: productId,
        rating: rating,
        comment: comment,
        imageUrls: imageUrls,
      );
      return true;
    } catch (e) {
      _errorMessage =
          'Không thể gửi đánh giá. '
          'Vui lòng thử lại.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
