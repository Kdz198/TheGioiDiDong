import '../dummy_data.dart';
import '../models/membership_model.dart';

class MembershipRepository {
  bool _useDummyData = true;

  Future<MembershipModel> getMembership() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.membership;
    }
    throw UnimplementedError();
  }

  Future<void> redeemPoints(int points) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
    }
  }
}
