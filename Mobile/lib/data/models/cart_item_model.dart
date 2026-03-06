class CartItemModel {
  final int productId;
  final String productName;
  final String brandName;
  final String imageUrl;
  final double price;
  final double? originalPrice;
  final int quantity;
  final int maxQuantity;

  const CartItemModel({
    required this.productId,
    required this.productName,
    required this.brandName,
    required this.imageUrl,
    required this.price,
    this.originalPrice,
    required this.quantity,
    required this.maxQuantity,
  });

  double get subtotal => price * quantity;

  bool get isMaxQty => quantity >= maxQuantity;

  factory CartItemModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return CartItemModel(
      productId: json['productId'] as int,
      productName: json['productName'] as String,
      brandName: json['brandName'] as String,
      imageUrl: json['imageUrl'] as String,
      price: (json['price'] as num).toDouble(),
      originalPrice:
          (json['originalPrice'] as num?)?.toDouble(),
      quantity: json['quantity'] as int,
      maxQuantity: json['maxQuantity'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'brandName': brandName,
      'imageUrl': imageUrl,
      'price': price,
      'originalPrice': originalPrice,
      'quantity': quantity,
      'maxQuantity': maxQuantity,
    };
  }

  CartItemModel copyWith({
    int? productId,
    String? productName,
    String? brandName,
    String? imageUrl,
    double? price,
    double? originalPrice,
    int? quantity,
    int? maxQuantity,
  }) {
    return CartItemModel(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      brandName: brandName ?? this.brandName,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      originalPrice:
          originalPrice ?? this.originalPrice,
      quantity: quantity ?? this.quantity,
      maxQuantity: maxQuantity ?? this.maxQuantity,
    );
  }
}
