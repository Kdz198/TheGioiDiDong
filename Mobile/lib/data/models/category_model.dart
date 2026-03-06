class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String iconName;
  final int? parentId;
  final int productCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.iconName,
    this.parentId,
    this.productCount = 0,
  });

  factory CategoryModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return CategoryModel(
      id: json['id'] as int,
      name: json['name'] as String,
      slug: json['slug'] as String,
      iconName: json['iconName'] as String,
      parentId: json['parentId'] as int?,
      productCount: json['productCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'iconName': iconName,
      'parentId': parentId,
      'productCount': productCount,
    };
  }
}
