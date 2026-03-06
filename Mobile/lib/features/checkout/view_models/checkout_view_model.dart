import 'package:flutter/material.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../data/models/order_model.dart';

class CheckoutViewModel extends ChangeNotifier {
  final OrderRepository _repository;

  CheckoutViewModel({
    OrderRepository? repository,
  }) : _repository =
            repository ?? OrderRepository();

  int? _selectedAddressId;
  String _paymentMethod = 'cod';
  bool _isLoading = false;
  String? _errorMessage;
  OrderModel? _placedOrder;

  int? get selectedAddressId => _selectedAddressId;
  String get paymentMethod => _paymentMethod;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  OrderModel? get placedOrder => _placedOrder;

  void setAddressId(int addressId) {
    _selectedAddressId = addressId;
    notifyListeners();
  }

  void setPaymentMethod(String method) {
    _paymentMethod = method;
    notifyListeners();
  }

  Future<bool> placeOrder() async {
    if (_selectedAddressId == null) {
      _errorMessage =
          'Vui lòng chọn địa chỉ giao hàng.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _placedOrder = await _repository.placeOrder(
        addressId: _selectedAddressId!,
        paymentMethod: _paymentMethod,
      );
      return true;
    } catch (e) {
      _errorMessage =
          'Không thể đặt hàng. '
          'Vui lòng thử lại.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
