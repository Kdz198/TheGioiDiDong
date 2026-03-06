import 'package:flutter/material.dart';
import '../../../data/models/order_model.dart';
import '../../../data/repositories/order_repository.dart';

class OrderViewModel extends ChangeNotifier {
  final OrderRepository _repository;

  OrderViewModel({
    OrderRepository? repository,
  }) : _repository =
            repository ?? OrderRepository();

  List<OrderModel> _orders = [];
  OrderModel? _selectedOrder;
  bool _isLoading = false;
  String? _errorMessage;

  List<OrderModel> get orders => _orders;
  OrderModel? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadOrders({
    OrderStatus? status,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _orders = await _repository.getOrders(
        status: status,
      );
    } catch (e) {
      _errorMessage =
          'Không thể tải danh sách đơn hàng.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadOrderDetail(int orderId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _selectedOrder =
          await _repository.getOrderById(orderId);
    } catch (e) {
      _errorMessage =
          'Không thể tải chi tiết đơn hàng.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelOrder(
    int orderId,
    String reason,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      await _repository.cancelOrder(
        orderId,
        reason,
      );
      await loadOrders();
      return true;
    } catch (e) {
      _errorMessage =
          'Không thể hủy đơn hàng.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
