class ReviewModel {
  final int id;
  final int productId;
  final int userId;
  final String userName;
  final String? userAvatarUrl;
  final int rating;
  final String comment;
  final List<String> imageUrls;
  final int helpfulCount;
  final bool isHelpful;
  final DateTime createdAt;

  const ReviewModel({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.userAvatarUrl,
    required this.rating,
    required this.comment,
    this.imageUrls = const [],
    this.helpfulCount = 0,
    this.isHelpful = false,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return ReviewModel(
      id: json['id'] as int,
      productId: json['productId'] as int,
      userId: json['userId'] as int,
      userName: json['userName'] as String,
      userAvatarUrl: json['userAvatarUrl'] as String?,
      rating: json['rating'] as int,
      comment: json['comment'] as String,
      imageUrls: (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      helpfulCount: json['helpfulCount'] as int? ?? 0,
      isHelpful: json['isHelpful'] as bool? ?? false,
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'userId': userId,
      'userName': userName,
      'userAvatarUrl': userAvatarUrl,
      'rating': rating,
      'comment': comment,
      'imageUrls': imageUrls,
      'helpfulCount': helpfulCount,
      'isHelpful': isHelpful,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
