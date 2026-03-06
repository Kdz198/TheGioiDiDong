import 'package:intl/intl.dart';

/// Formats a number as Vietnamese Dong currency.
/// Example: 850000 → "850.000đ"
String formatVND(num amount) {
  final formatter = NumberFormat('#,###', 'vi_VN');
  return '${formatter.format(amount)}đ';
}

/// Formats discount percentage.
/// Example: 0.29 → "-29%"
String formatDiscount(double discount) {
  return '-${(discount * 100).round()}%';
}
