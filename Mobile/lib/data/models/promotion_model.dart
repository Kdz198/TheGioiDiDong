class PromotionModel {
  final int id;
  final String title;
  final String imageUrl;
  final String? description;
  final DateTime startDate;
  final DateTime endDate;
  final bool isFlashSale;
  final String? targetRoute;

  const PromotionModel({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.description,
    required this.startDate,
    required this.endDate,
    this.isFlashSale = false,
    this.targetRoute,
  });

  factory PromotionModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return PromotionModel(
      id: json['id'] as int,
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      description: json['description'] as String?,
      startDate: DateTime.parse(
        json['startDate'] as String,
      ),
      endDate: DateTime.parse(
        json['endDate'] as String,
      ),
      isFlashSale: json['isFlashSale'] as bool? ?? false,
      targetRoute: json['targetRoute'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'imageUrl': imageUrl,
      'description': description,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'isFlashSale': isFlashSale,
      'targetRoute': targetRoute,
    };
  }
}
