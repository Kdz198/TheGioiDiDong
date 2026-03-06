import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/repositories/product_repository.dart';

class SearchViewModel extends ChangeNotifier {
  final ProductRepository _repository;

  SearchViewModel({
    ProductRepository? repository,
  }) : _repository =
            repository ?? ProductRepository();

  List<ProductModel> _results = [];
  List<String> _suggestions = [];
  List<String> _recentSearches = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ProductModel> get results => _results;
  List<String> get suggestions => _suggestions;
  List<String> get recentSearches =>
      _recentSearches;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> search(String query) async {
    if (query.isEmpty) {
      _results = [];
      notifyListeners();
      return;
    }
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _results =
          await _repository.searchProducts(query);
      if (!_recentSearches.contains(query)) {
        _recentSearches.insert(0, query);
        if (_recentSearches.length > 10) {
          _recentSearches.removeLast();
        }
      }
    } catch (e) {
      _errorMessage =
          'Không thể tìm kiếm. Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getSuggestions(
    String query,
  ) async {
    if (query.isEmpty) {
      _suggestions = [];
      notifyListeners();
      return;
    }
    try {
      _suggestions =
          await _repository.searchSuggestions(
        query,
      );
      notifyListeners();
    } catch (e) {
      // Silently fail for suggestions
    }
  }

  void removeRecentSearch(String term) {
    _recentSearches.remove(term);
    notifyListeners();
  }

  void clearRecentSearches() {
    _recentSearches.clear();
    notifyListeners();
  }
}
