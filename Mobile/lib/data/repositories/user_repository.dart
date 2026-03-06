import '../dummy_data.dart';
import '../models/user_model.dart';
import '../models/address_model.dart';

class UserRepository {
  bool _useDummyData = true;

  Future<UserModel> getProfile() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.user;
    }
    throw UnimplementedError();
  }

  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? email,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
      return DummyData.user.copyWith(
        name: name,
        phone: phone,
        email: email,
      );
    }
    throw UnimplementedError();
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
    }
  }

  Future<List<AddressModel>> getAddresses() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
      return DummyData.addresses;
    }
    throw UnimplementedError();
  }

  Future<AddressModel> addAddress(
    AddressModel address,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
      return address;
    }
    throw UnimplementedError();
  }

  Future<void> deleteAddress(int addressId) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
    }
  }
}
