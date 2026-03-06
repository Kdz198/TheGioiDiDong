class BannerModel {
  final int id;
  final String imageUrl;
  final String title;
  final String? subtitle;
  final String? ctaText;
  final String? targetRoute;

  const BannerModel({
    required this.id,
    required this.imageUrl,
    required this.title,
    this.subtitle,
    this.ctaText,
    this.targetRoute,
  });

  factory BannerModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return BannerModel(
      id: json['id'] as int,
      imageUrl: json['imageUrl'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String?,
      ctaText: json['ctaText'] as String?,
      targetRoute: json['targetRoute'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'title': title,
      'subtitle': subtitle,
      'ctaText': ctaText,
      'targetRoute': targetRoute,
    };
  }
}
