import 'package:flutter/material.dart';
import '../../../data/models/promotion_model.dart';
import '../../../data/models/product_model.dart';
import '../../../data/repositories/promotion_repository.dart';
import '../../../data/repositories/product_repository.dart';

class DealsViewModel extends ChangeNotifier {
  final PromotionRepository _promoRepo;
  final ProductRepository _productRepo;

  DealsViewModel({
    PromotionRepository? promoRepo,
    ProductRepository? productRepo,
  })  : _promoRepo =
            promoRepo ?? PromotionRepository(),
        _productRepo =
            productRepo ?? ProductRepository();

  List<PromotionModel> _promotions = [];
  List<ProductModel> _flashSaleProducts = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<PromotionModel> get promotions =>
      _promotions;
  List<ProductModel> get flashSaleProducts =>
      _flashSaleProducts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadDeals() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _promoRepo.getPromotions(),
        _productRepo.getFlashSaleProducts(),
      ]);
      _promotions =
          results[0] as List<PromotionModel>;
      _flashSaleProducts =
          results[1] as List<ProductModel>;
    } catch (e) {
      _errorMessage =
          'Không thể tải khuyến mãi.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
