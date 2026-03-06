import '../dummy_data.dart';
import '../models/product_model.dart';

class WishlistRepository {
  final List<int> _wishlistIds = [];

  Future<List<ProductModel>> getWishlist() async {
    await Future.delayed(
      const Duration(milliseconds: 300),
    );
    return DummyData.products
        .where(
          (p) => _wishlistIds.contains(p.id),
        )
        .toList();
  }

  Future<void> addToWishlist(int productId) async {
    await Future.delayed(
      const Duration(milliseconds: 200),
    );
    if (!_wishlistIds.contains(productId)) {
      _wishlistIds.add(productId);
    }
  }

  Future<void> removeFromWishlist(
    int productId,
  ) async {
    await Future.delayed(
      const Duration(milliseconds: 200),
    );
    _wishlistIds.remove(productId);
  }

  bool isInWishlist(int productId) {
    return _wishlistIds.contains(productId);
  }
}
