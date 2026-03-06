import '../dummy_data.dart';
import '../models/promotion_model.dart';

class PromotionRepository {
  bool _useDummyData = true;

  Future<List<PromotionModel>>
      getPromotions() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 400),
      );
      return DummyData.promotions;
    }
    throw UnimplementedError();
  }
}
