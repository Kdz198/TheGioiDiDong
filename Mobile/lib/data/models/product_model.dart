class ProductModel {
  final int id;
  final String name;
  final String slug;
  final String brandName;
  final int categoryId;
  final String categoryName;
  final double price;
  final double? originalPrice;
  final double rating;
  final int reviewCount;
  final int stockQuantity;
  final bool isInStock;
  final bool isHot;
  final bool isNew;
  final bool isFlashSale;
  final List<String> imageUrls;
  final String description;
  final Map<String, String> specifications;

  const ProductModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.brandName,
    required this.categoryId,
    required this.categoryName,
    required this.price,
    this.originalPrice,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.stockQuantity = 0,
    this.isInStock = true,
    this.isHot = false,
    this.isNew = false,
    this.isFlashSale = false,
    this.imageUrls = const [],
    this.description = '',
    this.specifications = const {},
  });

  bool get isOnSale =>
      originalPrice != null && originalPrice! > price;

  double get discountPercent => isOnSale
      ? (originalPrice! - price) / originalPrice!
      : 0;

  factory ProductModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return ProductModel(
      id: json['id'] as int,
      name: json['name'] as String,
      slug: json['slug'] as String,
      brandName: json['brandName'] as String,
      categoryId: json['categoryId'] as int,
      categoryName: json['categoryName'] as String,
      price: (json['price'] as num).toDouble(),
      originalPrice:
          (json['originalPrice'] as num?)?.toDouble(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] as int? ?? 0,
      stockQuantity: json['stockQuantity'] as int? ?? 0,
      isInStock: json['isInStock'] as bool? ?? true,
      isHot: json['isHot'] as bool? ?? false,
      isNew: json['isNew'] as bool? ?? false,
      isFlashSale: json['isFlashSale'] as bool? ?? false,
      imageUrls: (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      description: json['description'] as String? ?? '',
      specifications:
          (json['specifications'] as Map<String, dynamic>?)
              ?.map(
                (k, v) => MapEntry(k, v as String),
              ) ??
          {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'brandName': brandName,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'price': price,
      'originalPrice': originalPrice,
      'rating': rating,
      'reviewCount': reviewCount,
      'stockQuantity': stockQuantity,
      'isInStock': isInStock,
      'isHot': isHot,
      'isNew': isNew,
      'isFlashSale': isFlashSale,
      'imageUrls': imageUrls,
      'description': description,
      'specifications': specifications,
    };
  }
}
