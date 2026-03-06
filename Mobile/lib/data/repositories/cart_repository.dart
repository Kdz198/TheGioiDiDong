import '../dummy_data.dart';
import '../models/cart_item_model.dart';
import '../models/product_model.dart';

class CartRepository {
  // In-memory cart for dummy data
  final List<CartItemModel> _cartItems = [];

  Future<List<CartItemModel>> getCartItems() async {
    await Future.delayed(
      const Duration(milliseconds: 200),
    );
    return List.unmodifiable(_cartItems);
  }

  Future<void> addItem(ProductModel product) async {
    await Future.delayed(
      const Duration(milliseconds: 200),
    );
    final existingIndex = _cartItems.indexWhere(
      (item) => item.productId == product.id,
    );
    if (existingIndex >= 0) {
      final existing = _cartItems[existingIndex];
      _cartItems[existingIndex] = existing.copyWith(
        quantity: existing.quantity + 1,
      );
    } else {
      _cartItems.add(CartItemModel(
        productId: product.id,
        productName: product.name,
        brandName: product.brandName,
        imageUrl: product.imageUrls.isNotEmpty
            ? product.imageUrls.first
            : '',
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        maxQuantity: product.stockQuantity,
      ));
    }
  }

  Future<void> updateQuantity(
    int productId,
    int quantity,
  ) async {
    await Future.delayed(
      const Duration(milliseconds: 100),
    );
    final index = _cartItems.indexWhere(
      (item) => item.productId == productId,
    );
    if (index >= 0) {
      if (quantity <= 0) {
        _cartItems.removeAt(index);
      } else {
        _cartItems[index] =
            _cartItems[index].copyWith(
          quantity: quantity,
        );
      }
    }
  }

  Future<void> removeItem(int productId) async {
    await Future.delayed(
      const Duration(milliseconds: 100),
    );
    _cartItems.removeWhere(
      (item) => item.productId == productId,
    );
  }

  Future<void> clearCart() async {
    await Future.delayed(
      const Duration(milliseconds: 100),
    );
    _cartItems.clear();
  }

  int get itemCount => _cartItems.fold(
        0,
        (sum, item) => sum + item.quantity,
      );
}
