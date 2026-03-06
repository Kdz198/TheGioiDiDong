import '../dummy_data.dart';
import '../models/product_model.dart';
import '../../core/constants/app_constants.dart';

class ProductRepository {
  bool _useDummyData = true;

  Future<List<ProductModel>> getProducts({
    int page = 1,
    int pageSize = AppConstants.pageSize,
    String? categoryId,
    String? search,
    String? sortBy,
    List<String>? brands,
    double? minPrice,
    double? maxPrice,
    List<String>? features,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 600),
      );
      var products = DummyData.products;
      if (search != null && search.isNotEmpty) {
        products = products
            .where(
              (p) => p.name.toLowerCase().contains(
                    search.toLowerCase(),
                  ),
            )
            .toList();
      }
      if (categoryId != null) {
        final cid = int.tryParse(categoryId);
        if (cid != null) {
          products = products
              .where((p) => p.categoryId == cid)
              .toList();
        }
      }
      return products;
    }
    throw UnimplementedError();
  }

  Future<ProductModel> getProductById(
    int id,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.products.firstWhere(
        (p) => p.id == id,
      );
    }
    throw UnimplementedError();
  }

  Future<List<ProductModel>> getFeaturedProducts() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.products
          .where((p) => p.isHot || p.isNew)
          .toList();
    }
    throw UnimplementedError();
  }

  Future<List<ProductModel>> getFlashSaleProducts() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.products
          .where((p) => p.isOnSale)
          .toList();
    }
    throw UnimplementedError();
  }

  Future<List<ProductModel>> searchProducts(
    String query,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
      return DummyData.products
          .where(
            (p) => p.name.toLowerCase().contains(
                  query.toLowerCase(),
                ),
          )
          .toList();
    }
    throw UnimplementedError();
  }

  Future<List<String>> searchSuggestions(
    String query,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 200),
      );
      return DummyData.products
          .where(
            (p) => p.name.toLowerCase().contains(
                  query.toLowerCase(),
                ),
          )
          .map((p) => p.name)
          .take(5)
          .toList();
    }
    throw UnimplementedError();
  }
}
