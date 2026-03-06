import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/splash/views/splash_screen.dart';
import '../../features/auth/views/login_screen.dart';
import '../../features/auth/views/register_screen.dart';
import '../../features/auth/views/forgot_password_screen.dart';
import '../../features/auth/views/otp_verify_screen.dart';
import '../../features/main_shell/views/main_shell_screen.dart';
import '../../features/home/views/home_screen.dart';
import '../../features/product/views/product_list_screen.dart';
import '../../features/product/views/product_detail_screen.dart';
import '../../features/search/views/search_screen.dart';
import '../../features/deals/views/deals_screen.dart';
import '../../features/cart/views/cart_screen.dart';
import '../../features/profile/views/profile_screen.dart';
import '../../features/profile/views/edit_profile_screen.dart';
import '../../features/profile/views/change_password_screen.dart';
import '../../features/profile/views/address_list_screen.dart';
import '../../features/profile/views/membership_screen.dart';
import '../../features/profile/views/wishlist_screen.dart';
import '../../features/checkout/views/checkout_screen.dart';
import '../../features/checkout/views/address_picker_screen.dart';
import '../../features/checkout/views/add_edit_address_screen.dart';
import '../../features/checkout/views/order_success_screen.dart';
import '../../features/order/views/order_history_screen.dart';
import '../../features/order/views/order_detail_screen.dart';
import '../../features/review/views/write_review_screen.dart';

class AppRoutes {
  static const splash = '/splash';
  static const onboarding = '/onboarding';
  static const home = '/';
  static const shop = '/shop';
  static const deals = '/deals';
  static const cart = '/cart';
  static const profile = '/profile';
  static const editProfile = '/profile/edit';
  static const changePassword =
      '/profile/change-password';
  static const addresses = '/profile/addresses';
  static const membership = '/profile/membership';
  static const wishlist = '/profile/wishlist';
  static const products = '/products';
  static const search = '/search';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const checkout = '/checkout';
  static const orderSuccess = '/order-success';
  static const orders = '/orders';
  static const reviews = '/reviews/write';

  static String productDetail(int id) =>
      '/products/$id';
  static String orderDetail(int id) => '/orders/$id';
  static String orderSuccessPage(int id) =>
      '/order-success/$id';
  static String writeReview(int productId) =>
      '/reviews/write/$productId';
  static String editAddress(int id) =>
      '/addresses/$id/edit';
}

final _rootNavigatorKey =
    GlobalKey<NavigatorState>();
final _shellNavigatorKey =
    GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: AppRoutes.splash,
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      builder: (context, state) =>
          const SplashScreen(),
    ),
    GoRoute(
      path: AppRoutes.login,
      builder: (context, state) =>
          const LoginScreen(),
    ),
    GoRoute(
      path: AppRoutes.register,
      builder: (context, state) =>
          const RegisterScreen(),
    ),
    GoRoute(
      path: AppRoutes.forgotPassword,
      builder: (context, state) =>
          const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/otp-verify',
      builder: (context, state) =>
          const OtpVerifyScreen(),
    ),

    // Main Shell with bottom navigation
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) =>
          MainShellScreen(child: child),
      routes: [
        GoRoute(
          path: AppRoutes.home,
          builder: (context, state) =>
              const HomeScreen(),
        ),
        GoRoute(
          path: AppRoutes.shop,
          builder: (context, state) =>
              const ProductListScreen(),
        ),
        GoRoute(
          path: AppRoutes.deals,
          builder: (context, state) =>
              const DealsScreen(),
        ),
        GoRoute(
          path: AppRoutes.cart,
          builder: (context, state) =>
              const CartScreen(),
        ),
        GoRoute(
          path: AppRoutes.profile,
          builder: (context, state) =>
              const ProfileScreen(),
          routes: [
            GoRoute(
              path: 'edit',
              parentNavigatorKey:
                  _rootNavigatorKey,
              builder: (context, state) =>
                  const EditProfileScreen(),
            ),
            GoRoute(
              path: 'change-password',
              parentNavigatorKey:
                  _rootNavigatorKey,
              builder: (context, state) =>
                  const ChangePasswordScreen(),
            ),
            GoRoute(
              path: 'addresses',
              parentNavigatorKey:
                  _rootNavigatorKey,
              builder: (context, state) =>
                  const AddressListScreen(),
            ),
            GoRoute(
              path: 'membership',
              parentNavigatorKey:
                  _rootNavigatorKey,
              builder: (context, state) =>
                  const MembershipScreen(),
            ),
            GoRoute(
              path: 'wishlist',
              parentNavigatorKey:
                  _rootNavigatorKey,
              builder: (context, state) =>
                  const WishlistScreen(),
            ),
          ],
        ),
      ],
    ),

    // Product routes (outside shell)
    GoRoute(
      path: AppRoutes.products,
      builder: (context, state) =>
          const ProductListScreen(),
    ),
    GoRoute(
      path: '/products/:id',
      builder: (context, state) {
        final id = int.parse(
          state.pathParameters['id']!,
        );
        return ProductDetailScreen(productId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.search,
      builder: (context, state) =>
          const SearchScreen(),
    ),
    GoRoute(
      path: AppRoutes.checkout,
      builder: (context, state) =>
          const CheckoutScreen(),
      routes: [
        GoRoute(
          path: 'addresses',
          builder: (context, state) =>
              const AddressPickerScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/addresses/add',
      builder: (context, state) =>
          const AddEditAddressScreen(),
    ),
    GoRoute(
      path: '/addresses/:id/edit',
      builder: (context, state) {
        final id = int.parse(
          state.pathParameters['id']!,
        );
        return AddEditAddressScreen(addressId: id);
      },
    ),
    GoRoute(
      path: '/order-success/:id',
      builder: (context, state) {
        final id = int.parse(
          state.pathParameters['id']!,
        );
        return OrderSuccessScreen(orderId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.orders,
      builder: (context, state) =>
          const OrderHistoryScreen(),
    ),
    GoRoute(
      path: '/orders/:id',
      builder: (context, state) {
        final id = int.parse(
          state.pathParameters['id']!,
        );
        return OrderDetailScreen(orderId: id);
      },
    ),
    GoRoute(
      path: '/reviews/write/:productId',
      builder: (context, state) {
        final productId = int.parse(
          state.pathParameters['productId']!,
        );
        return WriteReviewScreen(
          productId: productId,
        );
      },
    ),
  ],
);
