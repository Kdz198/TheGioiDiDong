# GitHub Copilot Instructions — mss301_mobile

## Tổng Quan Dự Án

**TechGear** là ứng dụng di động thương mại điện tử phụ kiện công nghệ hướng đến người dùng Việt Nam, hỗ trợ cả iOS và Android.

- **Stack**: Flutter 3.x + Dart 3.x
- **Architecture**: MVVM (Model – ViewModel – Repository)
- **State management**: ChangeNotifier / Provider
- **HTTP**: Dio
- **Navigation**: GoRouter
- **Local storage**: SharedPreferences / Hive
- **Testing**: flutter_test

---

## Ngôn Ngữ & Văn Phong

- **Giao diện**: Tiếng Việt — mọi text hiển thị cho người dùng phải bằng tiếng Việt
- **Code**: Tên class, biến, hàm viết bằng tiếng Anh (theo chuẩn Dart/Flutter)
- **Comment**: Viết bằng tiếng Anh, chỉ khi cần thiết (xem quy tắc comment)
- Số tiền: `xxx.000đ` — dùng `NumberFormat` của package `intl`

---

## Kiến Trúc MVVM

```
lib/
├── main.dart                       # Entry point
├── app.dart                        # Root widget — theme & router
│
├── core/
│   ├── constants/
│   │   ├── api_constants.dart      # Base URL, endpoint paths
│   │   └── app_constants.dart      # App name, timeout, pagination size
│   ├── utils/
│   │   ├── format_price.dart       # formatVND()
│   │   └── format_date.dart
│   ├── theme/
│   │   ├── app_theme.dart          # ThemeData tổng
│   │   ├── app_colors.dart         # Hằng số màu sắc
│   │   └── app_text_styles.dart    # TextStyle tái sử dụng
│   └── router/
│       └── app_router.dart
│
├── data/
│   ├── models/
│   │   ├── product_model.dart
│   │   ├── order_model.dart
│   │   ├── user_model.dart
│   │   └── cart_item_model.dart
│   ├── services/
│   │   ├── api_service.dart        # Dio HTTP client
│   │   ├── auth_service.dart
│   │   └── product_service.dart
│   └── repositories/
│       ├── auth_repository.dart
│       ├── product_repository.dart
│       ├── order_repository.dart
│       └── cart_repository.dart
│
└── features/
    ├── auth/
    │   ├── views/
    │   │   ├── login_screen.dart
    │   │   └── register_screen.dart
    │   └── view_models/
    │       └── auth_view_model.dart
    ├── home/
    │   ├── views/
    │   │   └── home_screen.dart
    │   └── view_models/
    │       └── home_view_model.dart
    ├── product/
    │   ├── views/
    │   │   ├── product_list_screen.dart
    │   │   └── product_detail_screen.dart
    │   └── view_models/
    │       └── product_view_model.dart
    ├── cart/
    │   ├── views/
    │   │   └── cart_screen.dart
    │   └── view_models/
    │       └── cart_view_model.dart
    ├── checkout/
    │   ├── views/
    │   │   ├── checkout_screen.dart
    │   │   └── order_success_screen.dart
    │   └── view_models/
    │       └── checkout_view_model.dart
    ├── profile/
    │   ├── views/
    │   │   └── profile_screen.dart
    │   └── view_models/
    │       └── profile_view_model.dart
    └── order/
        ├── views/
        │   └── order_history_screen.dart
        └── view_models/
            └── order_view_model.dart
```

---

## Quy Tắc Đặt Tên

| Loại                     | Quy tắc         | Ví dụ                        |
| ------------------------ | --------------- | ---------------------------- |
| Class / Widget / Enum    | `UpperCamelCase`| `ProductCard`, `AuthViewModel` |
| Biến / Hàm / Tham số     | `lowerCamelCase`| `userName`, `fetchProducts()`|
| Hằng số (const)          | `lowerCamelCase`| `defaultTimeout`, `appName`  |
| Enum value               | `lowerCamelCase`| `OrderStatus.pending`        |
| File / Thư mục           | `snake_case`    | `product_card.dart`          |
| Private member           | tiền tố `_`     | `_token`, `_loadUser()`      |

---

## Hệ Thống Màu Sắc

> Tham khảo đầy đủ tại `color.md` trong root của repository.
> Định nghĩa trong `lib/core/theme/app_colors.dart`.

```dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary — Cyan (màu thương hiệu chính)
  static const primary = Color(0xFF0891B2);         // cyan-600 #0891b2
  static const primaryLight = Color(0xFFE0F2FE);    // sky-100  #e0f2fe
  static const primaryShadow = Color(0x4D0093A3);   // rgba(0,147,163,0.30)

  // Accent — Orange (màu nhấn hành động)
  static const accent = Color(0xFFF97316);          // orange-500 #f97316
  static const accentShadow = Color(0x4DFF6B35);    // rgba(255,107,53,0.30)

  // Backgrounds
  static const background = Color(0xFFFAFAFA);      // neutral-50 / gray-50
  static const surface = Color(0xFFFFFFFF);         // white
  static const inputBackground = Color(0xFFF8FAFC); // slate-50

  // Text
  static const textPrimary = Color(0xFF1E293B);     // slate-800
  static const textSecondary = Color(0xFF64748B);   // slate-500
  static const textHint = Color(0xFF94A3B8);        // slate-400
  static const textHeading = Color(0xFF0F172A);     // slate-900

  // Borders & Dividers
  static const border = Color(0xFFE2E8F0);          // slate-200
  static const divider = Color(0xFFF1F5F9);         // slate-100
  static const borderLight = Color(0xFFF3F4F6);     // gray-100

  // Semantic
  static const success = Color(0xFF16A34A);         // green-600
  static const error = Color(0xFFF87171);           // red-400
  static const star = Color(0xFFEAB308);            // yellow-500

  // Navigation
  static const navActive = Color(0xFF0891B2);       // cyan-600
  static const navInactive = Color(0xFF94A3B8);     // slate-400
}
```

---

## Widget Patterns

### Nút CTA chính

```dart
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.primary,
    foregroundColor: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    elevation: 0,
    shadowColor: AppColors.primaryShadow,
  ),
  onPressed: onPressed,
  child: Text(
    'Khám phá ngay',
    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
  ),
);
```

### Text Field (Input)

```dart
TextField(
  decoration: InputDecoration(
    hintText: 'Nhập email hoặc số điện thoại',
    hintStyle: const TextStyle(color: AppColors.textHint),
    filled: true,
    fillColor: AppColors.inputBackground,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
    ),
  ),
);
```

### Badge giỏ hàng (Cart Badge)

```dart
Stack(
  clipBehavior: Clip.none,
  children: [
    Icon(Icons.shopping_cart_outlined, color: AppColors.navInactive),
    Positioned(
      top: -4, right: -4,
      child: Container(
        width: 16, height: 16,
        decoration: const BoxDecoration(
          color: AppColors.accent,
          shape: BoxShape.circle,
        ),
        child: const Center(
          child: Text('3', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
        ),
      ),
    ),
  ],
);
```

### Hiển thị giá sản phẩm

```dart
Row(
  children: [
    Text(
      formatVND(salePrice),
      style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 14),
    ),
    const SizedBox(width: 8),
    // Giá gốc (nếu có sale)
    if (originalPrice != null)
      Text(
        formatVND(originalPrice!),
        style: const TextStyle(color: AppColors.textHint, fontSize: 12, decoration: TextDecoration.lineThrough),
      ),
  ],
);
```

### Bottom Navigation Bar

```dart
BottomNavigationBar(
  type: BottomNavigationBarType.fixed,
  backgroundColor: Colors.white,
  selectedItemColor: AppColors.navActive,
  unselectedItemColor: AppColors.navInactive,
  selectedLabelStyle: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
  unselectedLabelStyle: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
  // items: Trang chủ, Danh mục, Ưu đãi, Giỏ hàng, Tài khoản
);
```

---

## Thứ Tự Import

```dart
// 1. Thư viện Dart gốc
import 'dart:async';
import 'dart:convert';

// 2. Package bên ngoài
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';

// 3. File nội bộ project
import '../../../core/theme/app_colors.dart';
import '../../../data/models/product_model.dart';
import '../view_models/product_view_model.dart';
```

---

## Tính Năng & Business Rules

### Màn Hình Chính

| Màn hình               | Route             | Mô tả                                     |
| ---------------------- | ----------------- | ----------------------------------------- |
| Home                   | `/`               | Banner, danh mục nổi bật, newsletter      |
| Product List           | `/products`       | Danh sách SP, filter, search              |
| Product Detail         | `/products/:id`   | Chi tiết SP, đánh giá, thêm giỏ hàng     |
| Cart                   | `/cart`           | Giỏ hàng, voucher, tổng giá              |
| Checkout               | `/checkout`       | Thông tin giao hàng, thanh toán           |
| Order Success          | `/order-success`  | Xác nhận đơn hàng thành công             |
| Login                  | `/login`          | Đăng nhập (email/phone + password, Google)|
| Register               | `/register`       | Đăng ký tài khoản                         |
| Profile                | `/profile`        | Thông tin cá nhân, điểm thành viên        |
| Order History          | `/orders`         | Lịch sử đơn hàng                          |

### Danh Mục Sản Phẩm

- Phụ Kiện Di Động (Ốp lưng, Sạc dự phòng, Cáp, Miếng dán, Bộ sạc)
- Phụ Kiện Laptop & PC (Hub, Chuột, Bàn phím, Túi laptop, USB)
- Thiết Bị Âm Thanh (Tai nghe, Loa Bluetooth, Micro)
- Thiết Bị Nhà Thông Minh (Camera, Router, Đèn thông minh)
- Phụ Kiện Gaming (Chuột gaming, Bàn phím gaming, Tay cầm)
- Thiết Bị Lưu Trữ (Ổ cứng di động, Thẻ nhớ)

### Thanh Toán

- MoMo, VNPay, COD (Thanh toán khi nhận hàng)
- Tích hợp Deep Link để mở ví điện tử

### Membership

- Tích điểm theo đơn hàng
- Đổi điểm lấy giảm giá

---

## Quy Tắc Code

### ViewModel Pattern

```dart
class ProductViewModel extends ChangeNotifier {
  final ProductRepository _repository;

  ProductViewModel(this._repository);

  List<ProductModel> _products = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ProductModel> get products => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _products = await _repository.getProducts();
    } catch (e) {
      _errorMessage = 'Không thể tải sản phẩm. Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### Repository Pattern

```dart
class ProductRepository {
  final ProductService _service;

  ProductRepository(this._service);

  Future<List<ProductModel>> getProducts() async {
    final response = await _service.fetchProducts();
    return response.map((json) => ProductModel.fromJson(json)).toList();
  }
}
```

### Khi Nào Nên Viết Comment

```dart
// ✅ Logic phức tạp
// Tính giá sau khi áp dụng giảm giá lũy tiến:
// - Dưới 500.000đ: giảm 5%
// - Từ 500.000đ–2.000.000đ: giảm 10%
// - Trên 2.000.000đ: giảm 15%
final finalPrice = calculateTieredDiscount(subtotal);

// ✅ Lý do kỹ thuật cần giải thích
// Dùng addPostFrameCallback để đảm bảo widget đã build xong trước khi scroll
WidgetsBinding.instance.addPostFrameCallback((_) {
  _scrollController.jumpTo(0);
});

// ❌ Thừa — code đã tự rõ
final isLoggedIn = token != null; // kiểm tra đăng nhập
```

### Format Tiền Việt Nam

```dart
// core/utils/format_price.dart
import 'package:intl/intl.dart';

String formatVND(num amount) {
  final formatter = NumberFormat('#,###', 'vi_VN');
  return '${formatter.format(amount)}đ';
}
// Kết quả: 850000 → "850.000đ"
```

---

## Quy Tắc Quan Trọng

1. **Không hardcode màu sắc** — luôn dùng `AppColors.primary` thay vì `Color(0xFF0891B2)` trực tiếp
2. **Không hardcode text** trong widget — đặt string vào constants hoặc file localization
3. **View không chứa business logic** — mọi logic nghiệp vụ phải ở ViewModel
4. **Tất cả file dùng `snake_case`** — không dùng `PascalCase` hay `camelCase` cho tên file
5. **Dùng `dart format`** — bật format on save trong VS Code, giới hạn 80 ký tự/dòng
6. **Luôn dùng `{}` cho if/else** — dù chỉ 1 dòng
7. **Error messages bằng tiếng Việt** — `'Không thể tải dữ liệu. Vui lòng thử lại.'`
8. **Loading states** — mọi async operation phải có loading indicator
9. **Không đặt tên kiểu** `strName`, `intCount` — dùng `name`, `count`
