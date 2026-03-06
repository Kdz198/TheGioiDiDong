import '../dummy_data.dart';
import '../models/banner_model.dart';

class BannerRepository {
  bool _useDummyData = true;

  Future<List<BannerModel>> getBanners() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
      return DummyData.banners;
    }
    throw UnimplementedError();
  }
}
