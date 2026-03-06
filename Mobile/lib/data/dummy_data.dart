import 'models/user_model.dart';
import 'models/address_model.dart';
import 'models/product_model.dart';
import 'models/category_model.dart';
import 'models/banner_model.dart';
import 'models/order_model.dart';
import 'models/review_model.dart';
import 'models/voucher_model.dart';
import 'models/membership_model.dart';
import 'models/promotion_model.dart';

class DummyData {
  DummyData._();

  // ─── User ──────────────────────────────────────
  static final user = UserModel(
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'user@techgear.vn',
    phone: '0901234567',
    avatarUrl: null,
    membershipPoints: 1250,
    membershipTier: 'silver',
    createdAt: DateTime(2024, 1, 15),
  );

  // ─── Addresses ─────────────────────────────────
  static const addresses = [
    AddressModel(
      id: 1,
      recipientName: 'Nguyễn Văn A',
      phone: '0901234567',
      street: 'Số 123 Đường ABC',
      ward: 'Phường 4',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh',
      isDefault: true,
    ),
    AddressModel(
      id: 2,
      recipientName: 'Nguyễn Văn A',
      phone: '0901234567',
      street: '456 Lê Văn Việt',
      ward: 'Phường Tăng Nhơn Phú A',
      district: 'Thành phố Thủ Đức',
      province: 'TP. Hồ Chí Minh',
    ),
  ];

  // ─── Categories ────────────────────────────────
  static const categories = [
    CategoryModel(
      id: 1,
      name: 'Phụ Kiện Di Động',
      slug: 'phu-kien-di-dong',
      iconName: 'smartphone',
      productCount: 45,
    ),
    CategoryModel(
      id: 2,
      name: 'Phụ Kiện Laptop & PC',
      slug: 'phu-kien-laptop-pc',
      iconName: 'laptop',
      productCount: 32,
    ),
    CategoryModel(
      id: 3,
      name: 'Thiết Bị Âm Thanh',
      slug: 'thiet-bi-am-thanh',
      iconName: 'headphones',
      productCount: 28,
    ),
    CategoryModel(
      id: 4,
      name: 'Thiết Bị Nhà Thông Minh',
      slug: 'thiet-bi-nha-thong-minh',
      iconName: 'home',
      productCount: 15,
    ),
    CategoryModel(
      id: 5,
      name: 'Phụ Kiện Gaming',
      slug: 'phu-kien-gaming',
      iconName: 'sports_esports',
      productCount: 22,
    ),
    CategoryModel(
      id: 6,
      name: 'Thiết Bị Lưu Trữ',
      slug: 'thiet-bi-luu-tru',
      iconName: 'sd_storage',
      productCount: 18,
    ),
  ];

  // ─── Featured Categories (Home grid) ───────────
  static const featuredCategories = [
    CategoryModel(
      id: 101,
      name: 'Ốp lưng',
      slug: 'op-lung',
      iconName: 'phone_android',
      parentId: 1,
      productCount: 20,
    ),
    CategoryModel(
      id: 102,
      name: 'Sạc dự phòng',
      slug: 'sac-du-phong',
      iconName: 'battery_charging_full',
      parentId: 1,
      productCount: 15,
    ),
    CategoryModel(
      id: 103,
      name: 'Tai nghe',
      slug: 'tai-nghe',
      iconName: 'headphones',
      parentId: 3,
      productCount: 18,
    ),
    CategoryModel(
      id: 104,
      name: 'Apple Watch',
      slug: 'apple-watch',
      iconName: 'watch',
      parentId: 1,
      productCount: 8,
    ),
    CategoryModel(
      id: 105,
      name: 'Gậy Selfie',
      slug: 'gay-selfie',
      iconName: 'camera_alt',
      parentId: 1,
      productCount: 6,
    ),
    CategoryModel(
      id: 106,
      name: 'Loa Bluetooth',
      slug: 'loa-bluetooth',
      iconName: 'speaker',
      parentId: 3,
      productCount: 12,
    ),
  ];

  // ─── Products ──────────────────────────────────
  static const products = [
    ProductModel(
      id: 1,
      name: 'Sạc dự phòng MagGo 3-in-1',
      slug: 'sac-du-phong-maggo-3-in-1',
      brandName: 'ANKER',
      categoryId: 1,
      categoryName: 'Phụ Kiện Di Động',
      price: 850000,
      originalPrice: 1200000,
      rating: 4.8,
      reviewCount: 128,
      stockQuantity: 50,
      isInStock: true,
      isHot: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Sạc dự phòng MagGo 3-in-1 với công nghệ '
          'sạc nhanh, tương thích MagSafe, '
          'dung lượng 10.000mAh.',
      specifications: {
        'Dung lượng': '10.000mAh',
        'Công suất': '20W PD',
        'Cổng sạc': 'USB-C, Lightning',
        'Trọng lượng': '218g',
      },
    ),
    ProductModel(
      id: 2,
      name: '100W GaN Pro Power Bank',
      slug: '100w-gan-pro-power-bank',
      brandName: 'BASEUS',
      categoryId: 1,
      categoryName: 'Phụ Kiện Di Động',
      price: 1450000,
      originalPrice: 1800000,
      rating: 4.9,
      reviewCount: 95,
      stockQuantity: 30,
      isInStock: true,
      isNew: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Pin sạc dự phòng 100W GaN Pro với công '
          'nghệ GaN tiên tiến, sạc nhanh cho '
          'laptop và điện thoại.',
      specifications: {
        'Dung lượng': '20.000mAh',
        'Công suất': '100W PD',
        'Cổng sạc': '2x USB-C, 1x USB-A',
        'Trọng lượng': '450g',
      },
    ),
    ProductModel(
      id: 3,
      name: 'EB-P5300 20.000mAh',
      slug: 'eb-p5300-20000mah',
      brandName: 'SAMSUNG',
      categoryId: 1,
      categoryName: 'Phụ Kiện Di Động',
      price: 990000,
      rating: 4.5,
      reviewCount: 67,
      stockQuantity: 45,
      isInStock: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Pin sạc dự phòng Samsung EB-P5300 '
          'dung lượng 20.000mAh, sạc nhanh 25W.',
      specifications: {
        'Dung lượng': '20.000mAh',
        'Công suất': '25W',
        'Cổng sạc': 'USB-C',
        'Trọng lượng': '380g',
      },
    ),
    ProductModel(
      id: 4,
      name: 'Ốp lưng MagSafe iPhone 15',
      slug: 'op-lung-magsafe-iphone-15',
      brandName: 'ANKER',
      categoryId: 1,
      categoryName: 'Phụ Kiện Di Động',
      price: 350000,
      originalPrice: 480000,
      rating: 4.7,
      reviewCount: 203,
      stockQuantity: 100,
      isInStock: true,
      isHot: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Ốp lưng MagSafe cho iPhone 15 '
          'với chất liệu TPU cao cấp, '
          'bảo vệ toàn diện.',
      specifications: {
        'Chất liệu': 'TPU + PC',
        'Tương thích': 'iPhone 15',
        'MagSafe': 'Có',
      },
    ),
    ProductModel(
      id: 5,
      name: 'Tai nghe TWS SoundCore A40',
      slug: 'tai-nghe-tws-soundcore-a40',
      brandName: 'ANKER',
      categoryId: 3,
      categoryName: 'Thiết Bị Âm Thanh',
      price: 1200000,
      originalPrice: 1500000,
      rating: 4.8,
      reviewCount: 156,
      stockQuantity: 35,
      isInStock: true,
      isNew: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Tai nghe true wireless SoundCore A40 '
          'với chống ồn chủ động, '
          'thời gian sử dụng 50 giờ.',
      specifications: {
        'Loại': 'True Wireless',
        'Chống ồn': 'ANC',
        'Pin': '50 giờ (kèm hộp)',
        'Bluetooth': '5.3',
      },
    ),
    ProductModel(
      id: 6,
      name: 'Loa Bluetooth SoundCore 3',
      slug: 'loa-bluetooth-soundcore-3',
      brandName: 'ANKER',
      categoryId: 3,
      categoryName: 'Thiết Bị Âm Thanh',
      price: 890000,
      rating: 4.6,
      reviewCount: 89,
      stockQuantity: 40,
      isInStock: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Loa Bluetooth di động SoundCore 3 '
          'với âm thanh 360°, chống nước IPX7.',
      specifications: {
        'Công suất': '16W',
        'Pin': '24 giờ',
        'Chống nước': 'IPX7',
        'Bluetooth': '5.0',
      },
    ),
    ProductModel(
      id: 7,
      name: 'Hub USB-C 7-in-1',
      slug: 'hub-usb-c-7-in-1',
      brandName: 'BASEUS',
      categoryId: 2,
      categoryName: 'Phụ Kiện Laptop & PC',
      price: 650000,
      originalPrice: 900000,
      rating: 4.5,
      reviewCount: 74,
      stockQuantity: 25,
      isInStock: true,
      isHot: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Hub USB-C 7-in-1 hỗ trợ HDMI 4K, '
          'USB 3.0, PD 100W, SD/TF card reader.',
      specifications: {
        'Cổng': 'HDMI, 2x USB 3.0, USB-C PD, '
            'SD, TF, USB-C Data',
        'HDMI': '4K@30Hz',
        'PD': '100W',
      },
    ),
    ProductModel(
      id: 8,
      name: 'Chuột gaming G304',
      slug: 'chuot-gaming-g304',
      brandName: 'LOGITECH',
      categoryId: 5,
      categoryName: 'Phụ Kiện Gaming',
      price: 890000,
      originalPrice: 1100000,
      rating: 4.9,
      reviewCount: 312,
      stockQuantity: 60,
      isInStock: true,
      isNew: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Chuột gaming không dây Logitech G304 '
          'với cảm biến HERO 12K, '
          'pin sử dụng 250 giờ.',
      specifications: {
        'Cảm biến': 'HERO 12K',
        'DPI': '100 - 12.000',
        'Pin': '250 giờ (1x AA)',
        'Kết nối': 'LIGHTSPEED Wireless',
      },
    ),
    ProductModel(
      id: 9,
      name: 'Thẻ nhớ microSD 128GB',
      slug: 'the-nho-microsd-128gb',
      brandName: 'SAMSUNG',
      categoryId: 6,
      categoryName: 'Thiết Bị Lưu Trữ',
      price: 250000,
      originalPrice: 320000,
      rating: 4.4,
      reviewCount: 45,
      stockQuantity: 200,
      isInStock: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Thẻ nhớ Samsung EVO Select microSD '
          '128GB, tốc độ đọc 130MB/s.',
      specifications: {
        'Dung lượng': '128GB',
        'Tốc độ đọc': '130MB/s',
        'Class': 'U3, V30, A2',
      },
    ),
    ProductModel(
      id: 10,
      name: 'Camera Wifi Ngoài Trời 4MP',
      slug: 'camera-wifi-ngoai-troi-4mp',
      brandName: 'IMOU',
      categoryId: 4,
      categoryName: 'Thiết Bị Nhà Thông Minh',
      price: 750000,
      originalPrice: 950000,
      rating: 4.3,
      reviewCount: 58,
      stockQuantity: 20,
      isInStock: true,
      isHot: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Camera IP Wifi ngoài trời IMOU 4MP, '
          'quay đêm có màu, '
          'phát hiện chuyển động thông minh.',
      specifications: {
        'Độ phân giải': '4MP (2K)',
        'Tầm nhìn đêm': '30m (có màu)',
        'Lưu trữ': 'Cloud / microSD',
        'Kết nối': 'WiFi 2.4GHz',
      },
    ),
    ProductModel(
      id: 11,
      name: 'Bàn phím gaming K70 RGB',
      slug: 'ban-phim-gaming-k70-rgb',
      brandName: 'CORSAIR',
      categoryId: 5,
      categoryName: 'Phụ Kiện Gaming',
      price: 2800000,
      rating: 4.8,
      reviewCount: 142,
      stockQuantity: 15,
      isInStock: true,
      isNew: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Bàn phím cơ gaming Corsair K70 RGB '
          'với switch Cherry MX Red, '
          'LED RGB per-key.',
      specifications: {
        'Switch': 'Cherry MX Red',
        'Layout': 'Full-size',
        'LED': 'RGB per-key',
        'Kết nối': 'USB-C có dây',
      },
    ),
    ProductModel(
      id: 12,
      name: 'Cáp sạc nhanh USB-C 100W 2m',
      slug: 'cap-sac-nhanh-usb-c-100w-2m',
      brandName: 'BASEUS',
      categoryId: 1,
      categoryName: 'Phụ Kiện Di Động',
      price: 180000,
      originalPrice: 220000,
      rating: 4.7,
      reviewCount: 234,
      stockQuantity: 300,
      isInStock: true,
      imageUrls: [
        'https://placehold.co/400x400/png',
      ],
      description:
          'Cáp sạc nhanh USB-C to USB-C '
          '100W dài 2m, hỗ trợ PD 3.0.',
      specifications: {
        'Công suất': '100W PD 3.0',
        'Chiều dài': '2m',
        'Chất liệu': 'Nylon bện',
      },
    ),
  ];

  // ─── Banners ───────────────────────────────────
  static const banners = [
    BannerModel(
      id: 1,
      imageUrl: 'https://placehold.co/600x320/png',
      title: 'Phụ kiện công nghệ chính hãng',
      subtitle:
          'Trải nghiệm đỉnh cao cùng các '
          'thiết bị công nghệ hiện đại nhất.',
      ctaText: 'Khám phá ngay',
      targetRoute: '/products',
    ),
    BannerModel(
      id: 2,
      imageUrl: 'https://placehold.co/600x320/png',
      title: 'Flash Sale cuối tuần',
      subtitle: 'Giảm đến 30% cho hàng ngàn sản phẩm.',
      ctaText: 'Mua ngay',
      targetRoute: '/deals',
    ),
    BannerModel(
      id: 3,
      imageUrl: 'https://placehold.co/600x320/png',
      title: 'Tai nghe Anker — Âm thanh đỉnh cao',
      subtitle: 'Bộ sưu tập tai nghe chống ồn mới nhất.',
      ctaText: 'Xem ngay',
      targetRoute: '/products?categoryId=3',
    ),
  ];

  // ─── Orders ────────────────────────────────────
  static final orders = [
    OrderModel(
      id: 1,
      orderCode: '#TG-9948210',
      status: OrderStatus.delivered,
      deliveryAddress: addresses[0],
      items: const [
        OrderItemModel(
          productId: 1,
          productName: 'Sạc dự phòng MagGo 3-in-1',
          brandName: 'ANKER',
          imageUrl: 'https://placehold.co/80x80/png',
          price: 850000,
          quantity: 1,
          canReview: true,
        ),
        OrderItemModel(
          productId: 2,
          productName: '100W GaN Pro Power Bank',
          brandName: 'BASEUS',
          imageUrl: 'https://placehold.co/80x80/png',
          price: 1450000,
          quantity: 1,
          canReview: true,
        ),
      ],
      subtotal: 2300000,
      discount: 0,
      shippingFee: 0,
      total: 2300000,
      paymentMethod: 'cod',
      isPaid: true,
      createdAt: DateTime(2024, 10, 20),
      estimatedDelivery: DateTime(2024, 10, 24),
    ),
    OrderModel(
      id: 2,
      orderCode: '#TG-9821003',
      status: OrderStatus.shipping,
      deliveryAddress: addresses[0],
      items: const [
        OrderItemModel(
          productId: 5,
          productName: 'Tai nghe TWS SoundCore A40',
          brandName: 'ANKER',
          imageUrl: 'https://placehold.co/80x80/png',
          price: 1200000,
          quantity: 1,
        ),
      ],
      subtotal: 1200000,
      discount: 0,
      shippingFee: 0,
      total: 1200000,
      paymentMethod: 'momo',
      isPaid: true,
      createdAt: DateTime(2024, 10, 22),
      estimatedDelivery: DateTime(2024, 10, 26),
      trackingCode: 'GHN123456789',
    ),
    OrderModel(
      id: 3,
      orderCode: '#TG-9654112',
      status: OrderStatus.pending,
      deliveryAddress: addresses[0],
      items: const [
        OrderItemModel(
          productId: 7,
          productName: 'Hub USB-C 7-in-1',
          brandName: 'BASEUS',
          imageUrl: 'https://placehold.co/80x80/png',
          price: 650000,
          quantity: 1,
        ),
      ],
      subtotal: 650000,
      discount: 0,
      shippingFee: 30000,
      total: 680000,
      paymentMethod: 'vnpay',
      isPaid: true,
      createdAt: DateTime(2024, 10, 23),
    ),
  ];

  // ─── Reviews (per product, sample) ─────────────
  static List<ReviewModel> getReviewsForProduct(
    int productId,
  ) {
    return [
      ReviewModel(
        id: productId * 100 + 1,
        productId: productId,
        userId: 2,
        userName: 'Trần Thị B',
        rating: 5,
        comment:
            'Sản phẩm rất tốt, đúng mô tả. '
            'Giao hàng nhanh!',
        helpfulCount: 12,
        createdAt: DateTime(2024, 10, 15),
      ),
      ReviewModel(
        id: productId * 100 + 2,
        productId: productId,
        userId: 3,
        userName: 'Lê Văn C',
        rating: 4,
        comment:
            'Chất lượng ổn, giá hơi cao '
            'nhưng chấp nhận được.',
        helpfulCount: 5,
        createdAt: DateTime(2024, 10, 10),
      ),
      ReviewModel(
        id: productId * 100 + 3,
        productId: productId,
        userId: 4,
        userName: 'Phạm Thị D',
        rating: 5,
        comment:
            'Mua lần 2, vẫn hài lòng. '
            'Shop uy tín.',
        helpfulCount: 8,
        createdAt: DateTime(2024, 10, 5),
      ),
    ];
  }

  // ─── Vouchers ──────────────────────────────────
  static final vouchers = [
    VoucherModel(
      code: 'TECHGEAR10',
      type: VoucherType.percentage,
      discountValue: 0.10,
      minimumOrder: 500000,
      maximumDiscount: 200000,
      expiresAt: DateTime(2026, 12, 31),
    ),
    VoucherModel(
      code: 'FREESHIP',
      type: VoucherType.fixed,
      discountValue: 30000,
      minimumOrder: 200000,
      expiresAt: DateTime(2026, 12, 31),
    ),
    VoucherModel(
      code: 'NEWUSER50K',
      type: VoucherType.fixed,
      discountValue: 50000,
      minimumOrder: 300000,
      expiresAt: DateTime(2026, 6, 30),
    ),
  ];

  // ─── Membership ────────────────────────────────
  static final membership = MembershipModel(
    currentPoints: 1250,
    tier: 'silver',
    totalSpent: 5500000,
    nextTierSpend: 4500000,
    history: [
      PointsHistoryEntry(
        points: 850,
        description: 'Mua hàng đơn #TG-9948210',
        createdAt: DateTime(2024, 10, 20),
      ),
      PointsHistoryEntry(
        points: 400,
        description: 'Mua hàng đơn #TG-9821003',
        createdAt: DateTime(2024, 10, 22),
      ),
      PointsHistoryEntry(
        points: -500,
        description: 'Đổi điểm — Phiếu giảm 25.000đ',
        createdAt: DateTime(2024, 9, 15),
      ),
    ],
  );

  // ─── Promotions ────────────────────────────────
  static final promotions = [
    PromotionModel(
      id: 1,
      title: 'Flash Sale Cuối Tuần',
      imageUrl: 'https://placehold.co/600x200/png',
      description:
          'Giảm giá lên đến 50% cho các sản phẩm '
          'được chọn. Chỉ diễn ra cuối tuần!',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(
        const Duration(days: 2),
      ),
      isFlashSale: true,
      targetRoute: '/deals',
    ),
    PromotionModel(
      id: 2,
      title: 'Ưu đãi thành viên Vàng',
      imageUrl: 'https://placehold.co/600x200/png',
      description: 'Tặng thêm 200 điểm cho '
          'mỗi đơn hàng trên 1.000.000đ.',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(
        const Duration(days: 30),
      ),
    ),
    PromotionModel(
      id: 3,
      title: 'Mua 2 giảm 15%',
      imageUrl: 'https://placehold.co/600x200/png',
      description:
          'Áp dụng cho Tai nghe & Loa Bluetooth.',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(
        const Duration(days: 14),
      ),
      targetRoute: '/products?categoryId=3',
    ),
  ];
}
