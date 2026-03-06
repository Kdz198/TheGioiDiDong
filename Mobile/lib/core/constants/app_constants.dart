class AppConstants {
  AppConstants._();

  static const appName = 'TechGear';
  static const appVersion = '1.0.0';

  // Timeouts
  static const connectTimeout = Duration(seconds: 15);
  static const receiveTimeout = Duration(seconds: 30);

  // Pagination
  static const pageSize = 20;

  // Hive box names
  static const cartBoxName = 'cart_box';
  static const wishlistBoxName = 'wishlist_box';
  static const searchBoxName = 'search_history_box';

  // SharedPreferences keys
  static const prefAuthToken = 'auth_token';
  static const prefRefreshToken = 'refresh_token';
  static const prefUserId = 'user_id';
  static const prefUserName = 'user_name';
  static const prefIsLoggedIn = 'is_logged_in';
  static const prefOnboardingDone = 'onboarding_done';

  // Max values
  static const maxCartQuantity = 99;
  static const maxSearchHistory = 10;
  static const maxReviewImages = 3;
  static const maxAddresses = 5;

  // Points
  static const pointsPerVnd = 1000;
  static const pointsToVnd = 5000;
}
