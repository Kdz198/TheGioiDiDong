class MembershipModel {
  final int currentPoints;
  final String tier;
  final double totalSpent;
  final double nextTierSpend;
  final List<PointsHistoryEntry> history;

  const MembershipModel({
    required this.currentPoints,
    required this.tier,
    required this.totalSpent,
    this.nextTierSpend = 0,
    this.history = const [],
  });

  factory MembershipModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return MembershipModel(
      currentPoints: json['currentPoints'] as int,
      tier: json['tier'] as String,
      totalSpent:
          (json['totalSpent'] as num).toDouble(),
      nextTierSpend:
          (json['nextTierSpend'] as num?)?.toDouble() ??
              0,
      history: (json['history'] as List<dynamic>?)
              ?.map(
                (e) => PointsHistoryEntry.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentPoints': currentPoints,
      'tier': tier,
      'totalSpent': totalSpent,
      'nextTierSpend': nextTierSpend,
      'history':
          history.map((e) => e.toJson()).toList(),
    };
  }
}

class PointsHistoryEntry {
  final int points;
  final String description;
  final DateTime createdAt;

  const PointsHistoryEntry({
    required this.points,
    required this.description,
    required this.createdAt,
  });

  factory PointsHistoryEntry.fromJson(
    Map<String, dynamic> json,
  ) {
    return PointsHistoryEntry(
      points: json['points'] as int,
      description: json['description'] as String,
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'points': points,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
