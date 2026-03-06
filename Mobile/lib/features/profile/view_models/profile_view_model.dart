import 'package:flutter/material.dart';
import '../../../data/models/user_model.dart';
import '../../../data/models/address_model.dart';
import '../../../data/repositories/user_repository.dart';

class ProfileViewModel extends ChangeNotifier {
  final UserRepository _repository;

  ProfileViewModel({
    UserRepository? repository,
  }) : _repository =
            repository ?? UserRepository();

  UserModel? _user;
  List<AddressModel> _addresses = [];
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  List<AddressModel> get addresses => _addresses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _user = await _repository.getProfile();
    } catch (e) {
      _errorMessage =
          'Không thể tải thông tin hồ sơ.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? phone,
    String? email,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _user = await _repository.updateProfile(
        name: name,
        phone: phone,
        email: email,
      );
      return true;
    } catch (e) {
      _errorMessage =
          'Không thể cập nhật hồ sơ.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      await _repository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      return true;
    } catch (e) {
      _errorMessage =
          'Không thể đổi mật khẩu.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadAddresses() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _addresses =
          await _repository.getAddresses();
    } catch (e) {
      _errorMessage =
          'Không thể tải danh sách địa chỉ.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
