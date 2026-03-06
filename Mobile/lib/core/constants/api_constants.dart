class ApiConstants {
  ApiConstants._();

  // BASE — switch to real URL when backend is ready
  static const baseUrl = 'https://api.techgear.vn/api/v1';

  // Auth
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const logout = '/auth/logout';
  static const refreshToken = '/auth/refresh';
  static const googleLogin = '/auth/google';
  static const forgotPassword = '/auth/forgot-password';
  static const verifyOtp = '/auth/verify-otp';
  static const resetPassword = '/auth/reset-password';

  // User
  static const profile = '/users/me';
  static const updateProfile = '/users/me';
  static const uploadAvatar = '/users/me/avatar';
  static const changePassword = '/users/me/change-password';
  static const addresses = '/users/me/addresses';

  // Products
  static const products = '/products';
  static const searchProducts = '/products/search';
  static const featuredProducts = '/products/featured';
  static const flashSaleProducts = '/products/flash-sale';

  // Categories
  static const categories = '/categories';

  // Banners
  static const banners = '/banners';

  // Cart
  static const cart = '/cart';

  // Orders
  static const orders = '/orders';
  static const cancelOrder = '/orders/:id/cancel';

  // Reviews
  static const submitReview = '/reviews';

  // Vouchers
  static const validateVoucher = '/vouchers/validate';

  // Wishlist
  static const wishlist = '/wishlist';

  // Membership
  static const membershipPoints = '/membership/points';
  static const redeemPoints = '/membership/redeem';
  static const pointsHistory = '/membership/history';

  // Promotions
  static const promotions = '/promotions';
}
