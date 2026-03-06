import '../dummy_data.dart';
import '../models/voucher_model.dart';

class VoucherRepository {
  bool _useDummyData = true;

  Future<VoucherModel> validateVoucher(
    String code,
    double cartTotal,
  ) async {
    if (_useDummyData) {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );
      final voucher = DummyData.vouchers.firstWhere(
        (v) =>
            v.code.toLowerCase() ==
            code.toLowerCase(),
        orElse: () => throw Exception(
          'Mã giảm giá không hợp lệ',
        ),
      );
      if (cartTotal < voucher.minimumOrder) {
        throw Exception(
          'Đơn hàng chưa đạt giá trị tối thiểu '
          '${voucher.minimumOrder}đ',
        );
      }
      return voucher;
    }
    throw UnimplementedError();
  }
}
