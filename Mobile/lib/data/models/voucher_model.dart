enum VoucherType { percentage, fixed }

class VoucherModel {
  final String code;
  final VoucherType type;
  final double discountValue;
  final double minimumOrder;
  final double? maximumDiscount;
  final DateTime expiresAt;
  final bool isValid;

  const VoucherModel({
    required this.code,
    required this.type,
    required this.discountValue,
    required this.minimumOrder,
    this.maximumDiscount,
    required this.expiresAt,
    this.isValid = true,
  });

  double calculateDiscount(double cartTotal) {
    if (!isValid || cartTotal < minimumOrder) {
      return 0;
    }
    if (type == VoucherType.fixed) {
      return discountValue;
    }
    final discount = cartTotal * discountValue;
    if (maximumDiscount != null &&
        discount > maximumDiscount!) {
      return maximumDiscount!;
    }
    return discount;
  }

  factory VoucherModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return VoucherModel(
      code: json['code'] as String,
      type: VoucherType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => VoucherType.percentage,
      ),
      discountValue:
          (json['discountValue'] as num).toDouble(),
      minimumOrder:
          (json['minimumOrder'] as num).toDouble(),
      maximumDiscount:
          (json['maximumDiscount'] as num?)?.toDouble(),
      expiresAt: DateTime.parse(
        json['expiresAt'] as String,
      ),
      isValid: json['isValid'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'type': type.name,
      'discountValue': discountValue,
      'minimumOrder': minimumOrder,
      'maximumDiscount': maximumDiscount,
      'expiresAt': expiresAt.toIso8601String(),
      'isValid': isValid,
    };
  }
}
