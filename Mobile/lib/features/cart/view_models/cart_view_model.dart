import 'package:flutter/material.dart';
import '../../../data/models/cart_item_model.dart';
import '../../../data/models/product_model.dart';
import '../../../data/models/voucher_model.dart';
import '../../../data/repositories/cart_repository.dart';
import '../../../data/repositories/voucher_repository.dart';

class CartViewModel extends ChangeNotifier {
  final CartRepository _cartRepo;
  final VoucherRepository _voucherRepo;

  CartViewModel({
    CartRepository? cartRepo,
    VoucherRepository? voucherRepo,
  })  : _cartRepo =
            cartRepo ?? CartRepository(),
        _voucherRepo =
            voucherRepo ?? VoucherRepository();

  List<CartItemModel> _items = [];
  VoucherModel? _appliedVoucher;
  bool _isLoading = false;
  String? _errorMessage;

  List<CartItemModel> get items => _items;
  VoucherModel? get appliedVoucher =>
      _appliedVoucher;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isEmpty => _items.isEmpty;

  double get subtotal => _items.fold(
        0,
        (sum, item) => sum + item.subtotal,
      );

  double get discount => _appliedVoucher != null
      ? _appliedVoucher!.calculateDiscount(subtotal)
      : 0;

  double get total => subtotal - discount;

  int get itemCount => _items.fold(
        0,
        (sum, item) => sum + item.quantity,
      );

  Future<void> loadCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      _items = await _cartRepo.getCartItems();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addItem(
    ProductModel product,
  ) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _cartRepo.addItem(product);
      _items = await _cartRepo.getCartItems();
    } catch (e) {
      _errorMessage =
          'Không thể thêm sản phẩm vào giỏ hàng.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateQuantity(
    int productId,
    int quantity,
  ) async {
    try {
      await _cartRepo.updateQuantity(
        productId,
        quantity,
      );
      _items = await _cartRepo.getCartItems();
      notifyListeners();
    } catch (e) {
      _errorMessage =
          'Không thể cập nhật số lượng.';
      notifyListeners();
    }
  }

  Future<void> removeItem(int productId) async {
    try {
      await _cartRepo.removeItem(productId);
      _items = await _cartRepo.getCartItems();
      notifyListeners();
    } catch (e) {
      _errorMessage =
          'Không thể xóa sản phẩm.';
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    try {
      await _cartRepo.clearCart();
      _items = [];
      _appliedVoucher = null;
      notifyListeners();
    } catch (e) {
      _errorMessage =
          'Không thể xóa giỏ hàng.';
      notifyListeners();
    }
  }

  Future<bool> applyVoucher(String code) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _appliedVoucher =
          await _voucherRepo.validateVoucher(
        code,
        subtotal,
      );
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _appliedVoucher = null;
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void removeVoucher() {
    _appliedVoucher = null;
    notifyListeners();
  }
}
