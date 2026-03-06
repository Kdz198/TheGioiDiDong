class AddressModel {
  final int id;
  final String recipientName;
  final String phone;
  final String street;
  final String ward;
  final String district;
  final String province;
  final bool isDefault;

  const AddressModel({
    required this.id,
    required this.recipientName,
    required this.phone,
    required this.street,
    required this.ward,
    required this.district,
    required this.province,
    this.isDefault = false,
  });

  String get fullAddress =>
      '$street, $ward, $district, $province';

  factory AddressModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return AddressModel(
      id: json['id'] as int,
      recipientName: json['recipientName'] as String,
      phone: json['phone'] as String,
      street: json['street'] as String,
      ward: json['ward'] as String,
      district: json['district'] as String,
      province: json['province'] as String,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recipientName': recipientName,
      'phone': phone,
      'street': street,
      'ward': ward,
      'district': district,
      'province': province,
      'isDefault': isDefault,
    };
  }

  AddressModel copyWith({
    int? id,
    String? recipientName,
    String? phone,
    String? street,
    String? ward,
    String? district,
    String? province,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      recipientName:
          recipientName ?? this.recipientName,
      phone: phone ?? this.phone,
      street: street ?? this.street,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      province: province ?? this.province,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
