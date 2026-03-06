import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/repositories/product_repository.dart';

class ProductViewModel extends ChangeNotifier {
  final ProductRepository _repository;

  ProductViewModel({
    ProductRepository? repository,
  }) : _repository =
            repository ?? ProductRepository();

  List<ProductModel> _products = [];
  ProductModel? _selectedProduct;
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;

  List<ProductModel> get products => _products;
  ProductModel? get selectedProduct =>
      _selectedProduct;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;

  Future<void> loadProducts({
    String? categoryId,
    String? search,
    String? sortBy,
    bool refresh = false,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
    }
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final results =
          await _repository.getProducts(
        page: _currentPage,
        categoryId: categoryId,
        search: search,
        sortBy: sortBy,
      );
      if (refresh) {
        _products = results;
      } else {
        _products = [..._products, ...results];
      }
      _hasMore = results.length >= 20;
      _currentPage++;
    } catch (e) {
      _errorMessage =
          'Không thể tải sản phẩm. '
          'Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProductDetail(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _selectedProduct =
          await _repository.getProductById(id);
    } catch (e) {
      _errorMessage =
          'Không thể tải chi tiết sản phẩm.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
