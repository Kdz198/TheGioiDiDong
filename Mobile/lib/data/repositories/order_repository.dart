import '../dummy_data.dart';
import '../models/order_model.dart';

class OrderRepository {
  bool _useDummyData = true;

  Future<List<OrderModel>> getOrders({
    OrderStatus? status,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 600),
      );
      var orders = DummyData.orders;
      if (status != null) {
        orders = orders
            .where((o) => o.status == status)
            .toList();
      }
      return orders;
    }
    throw UnimplementedError();
  }

  Future<OrderModel> getOrderById(int id) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.orders.firstWhere(
        (o) => o.id == id,
      );
    }
    throw UnimplementedError();
  }

  Future<OrderModel> placeOrder({
    required int addressId,
    required String paymentMethod,
    String? orderNote,
    String? voucherCode,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 1000),
      );
      return DummyData.orders.first;
    }
    throw UnimplementedError();
  }

  Future<void> cancelOrder(
    int orderId,
    String reason,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
    }
  }
}
