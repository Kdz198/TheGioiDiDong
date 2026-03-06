import 'package:flutter/material.dart';
import '../../../data/models/banner_model.dart';
import '../../../data/models/category_model.dart';
import '../../../data/models/product_model.dart';
import '../../../data/repositories/banner_repository.dart';
import '../../../data/repositories/category_repository.dart';
import '../../../data/repositories/product_repository.dart';

class HomeViewModel extends ChangeNotifier {
  final BannerRepository _bannerRepo;
  final CategoryRepository _categoryRepo;
  final ProductRepository _productRepo;

  HomeViewModel({
    BannerRepository? bannerRepo,
    CategoryRepository? categoryRepo,
    ProductRepository? productRepo,
  })  : _bannerRepo =
            bannerRepo ?? BannerRepository(),
        _categoryRepo =
            categoryRepo ?? CategoryRepository(),
        _productRepo =
            productRepo ?? ProductRepository();

  List<BannerModel> _banners = [];
  List<CategoryModel> _categories = [];
  List<ProductModel> _featuredProducts = [];
  List<ProductModel> _flashSaleProducts = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<BannerModel> get banners => _banners;
  List<CategoryModel> get categories => _categories;
  List<ProductModel> get featuredProducts =>
      _featuredProducts;
  List<ProductModel> get flashSaleProducts =>
      _flashSaleProducts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadHomeData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _bannerRepo.getBanners(),
        _categoryRepo.getFeaturedCategories(),
        _productRepo.getFeaturedProducts(),
        _productRepo.getFlashSaleProducts(),
      ]);
      _banners =
          results[0] as List<BannerModel>;
      _categories =
          results[1] as List<CategoryModel>;
      _featuredProducts =
          results[2] as List<ProductModel>;
      _flashSaleProducts =
          results[3] as List<ProductModel>;
    } catch (e) {
      _errorMessage =
          'Không thể tải dữ liệu. '
          'Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
