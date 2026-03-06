import 'address_model.dart';

enum OrderStatus {
  pending,
  confirmed,
  processing,
  shipping,
  delivered,
  cancelled,
  returned,
}

class OrderModel {
  final int id;
  final String orderCode;
  final OrderStatus status;
  final AddressModel deliveryAddress;
  final List<OrderItemModel> items;
  final double subtotal;
  final double discount;
  final double shippingFee;
  final double total;
  final String paymentMethod;
  final bool isPaid;
  final DateTime createdAt;
  final DateTime? estimatedDelivery;
  final String? trackingCode;
  final String? cancelReason;

  const OrderModel({
    required this.id,
    required this.orderCode,
    required this.status,
    required this.deliveryAddress,
    required this.items,
    required this.subtotal,
    this.discount = 0,
    this.shippingFee = 0,
    required this.total,
    required this.paymentMethod,
    this.isPaid = false,
    required this.createdAt,
    this.estimatedDelivery,
    this.trackingCode,
    this.cancelReason,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as int,
      orderCode: json['orderCode'] as String,
      status: OrderStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => OrderStatus.pending,
      ),
      deliveryAddress: AddressModel.fromJson(
        json['deliveryAddress'] as Map<String, dynamic>,
      ),
      items: (json['items'] as List<dynamic>)
          .map(
            (e) => OrderItemModel.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      subtotal: (json['subtotal'] as num).toDouble(),
      discount:
          (json['discount'] as num?)?.toDouble() ?? 0,
      shippingFee:
          (json['shippingFee'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num).toDouble(),
      paymentMethod: json['paymentMethod'] as String,
      isPaid: json['isPaid'] as bool? ?? false,
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
      estimatedDelivery:
          json['estimatedDelivery'] != null
              ? DateTime.parse(
                  json['estimatedDelivery'] as String,
                )
              : null,
      trackingCode: json['trackingCode'] as String?,
      cancelReason: json['cancelReason'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderCode': orderCode,
      'status': status.name,
      'deliveryAddress': deliveryAddress.toJson(),
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'shippingFee': shippingFee,
      'total': total,
      'paymentMethod': paymentMethod,
      'isPaid': isPaid,
      'createdAt': createdAt.toIso8601String(),
      'estimatedDelivery':
          estimatedDelivery?.toIso8601String(),
      'trackingCode': trackingCode,
      'cancelReason': cancelReason,
    };
  }
}

class OrderItemModel {
  final int productId;
  final String productName;
  final String brandName;
  final String imageUrl;
  final double price;
  final int quantity;
  final bool canReview;

  const OrderItemModel({
    required this.productId,
    required this.productName,
    required this.brandName,
    required this.imageUrl,
    required this.price,
    required this.quantity,
    this.canReview = false,
  });

  factory OrderItemModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return OrderItemModel(
      productId: json['productId'] as int,
      productName: json['productName'] as String,
      brandName: json['brandName'] as String,
      imageUrl: json['imageUrl'] as String,
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'] as int,
      canReview: json['canReview'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'brandName': brandName,
      'imageUrl': imageUrl,
      'price': price,
      'quantity': quantity,
      'canReview': canReview,
    };
  }
}
