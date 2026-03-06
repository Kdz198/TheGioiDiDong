class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String role;
  final int membershipPoints;
  final String membershipTier;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.role = 'customer',
    this.membershipPoints = 0,
    this.membershipTier = 'bronze',
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      role: json['role'] as String? ?? 'customer',
      membershipPoints:
          json['membershipPoints'] as int? ?? 0,
      membershipTier:
          json['membershipTier'] as String? ?? 'bronze',
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'role': role,
      'membershipPoints': membershipPoints,
      'membershipTier': membershipTier,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    String? role,
    int? membershipPoints,
    String? membershipTier,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      membershipPoints:
          membershipPoints ?? this.membershipPoints,
      membershipTier:
          membershipTier ?? this.membershipTier,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
