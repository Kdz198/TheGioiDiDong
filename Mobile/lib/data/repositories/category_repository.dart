import '../dummy_data.dart';
import '../models/category_model.dart';

class CategoryRepository {
  bool _useDummyData = true;

  Future<List<CategoryModel>>
      getCategories() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
      return DummyData.categories;
    }
    throw UnimplementedError();
  }

  Future<List<CategoryModel>>
      getFeaturedCategories() async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );
      return DummyData.featuredCategories;
    }
    throw UnimplementedError();
  }
}
