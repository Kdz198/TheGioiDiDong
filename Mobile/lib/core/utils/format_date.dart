import 'package:intl/intl.dart';

/// Formats order date: "Thứ Năm, 24 Tháng 10, 2024"
String formatOrderDate(DateTime date) {
  return DateFormat('EEEE, d MMMM, y', 'vi_VN').format(date);
}

/// Formats short date: "24/10/2024"
String formatShortDate(DateTime date) {
  return DateFormat('dd/MM/yyyy').format(date);
}

/// Formats relative date: "2 ngày trước", "Vừa xong"
String formatRelativeDate(DateTime date) {
  final diff = DateTime.now().difference(date);
  if (diff.inMinutes < 1) {
    return 'Vừa xong';
  }
  if (diff.inMinutes < 60) {
    return '${diff.inMinutes} phút trước';
  }
  if (diff.inHours < 24) {
    return '${diff.inHours} giờ trước';
  }
  if (diff.inDays < 30) {
    return '${diff.inDays} ngày trước';
  }
  if (diff.inDays < 365) {
    return '${(diff.inDays / 30).round()} tháng trước';
  }
  return '${(diff.inDays / 365).round()} năm trước';
}
