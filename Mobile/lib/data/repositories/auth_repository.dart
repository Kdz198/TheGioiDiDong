import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../dummy_data.dart';
import '../models/user_model.dart';

class AuthRepository {
  bool _useDummyData = true;

  Future<UserModel> login(
    String identifier,
    String password,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 800),
      );
      final prefs =
          await SharedPreferences.getInstance();
      await prefs.setBool(
        AppConstants.prefIsLoggedIn,
        true,
      );
      await prefs.setString(
        AppConstants.prefAuthToken,
        'dummy_token_123',
      );
      await prefs.setInt(
        AppConstants.prefUserId,
        DummyData.user.id,
      );
      await prefs.setString(
        AppConstants.prefUserName,
        DummyData.user.name,
      );
      return DummyData.user;
    }
    throw UnimplementedError();
  }

  Future<UserModel> register({
    required String name,
    required String phone,
    required String email,
    required String password,
  }) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 800),
      );
      return DummyData.user;
    }
    throw UnimplementedError();
  }

  Future<void> logout() async {
    final prefs =
        await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.prefAuthToken);
    await prefs.remove(AppConstants.prefUserId);
    await prefs.remove(AppConstants.prefUserName);
    await prefs.setBool(
      AppConstants.prefIsLoggedIn,
      false,
    );
  }

  Future<bool> isLoggedIn() async {
    final prefs =
        await SharedPreferences.getInstance();
    return prefs.getBool(
          AppConstants.prefIsLoggedIn,
        ) ??
        false;
  }

  Future<void> forgotPassword(
    String emailOrPhone,
  ) async {
    await Future.delayed(
      const Duration(milliseconds: 500),
    );
  }

  Future<bool> verifyOtp(String otp) async {
    await Future.delayed(
      const Duration(milliseconds: 500),
    );
    return otp == '123456';
  }

  Future<void> resetPassword(
    String newPassword,
  ) async {
    await Future.delayed(
      const Duration(milliseconds: 500),
    );
  }
}
