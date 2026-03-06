import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class MainShellScreen extends StatefulWidget {
  final Widget child;

  const MainShellScreen({
    super.key,
    required this.child,
  });

  @override
  State<MainShellScreen> createState() =>
      _MainShellScreenState();
}

class _MainShellScreenState
    extends State<MainShellScreen> {
  int _currentIndex = 0;

  static const _tabs = [
    '/',
    '/shop',
    '/deals',
    '/cart',
    '/profile',
  ];

  int _locationToIndex(String location) {
    if (location.startsWith('/profile')) return 4;
    if (location.startsWith('/cart')) return 3;
    if (location.startsWith('/deals')) return 2;
    if (location.startsWith('/shop')) return 1;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context)
        .uri
        .toString();
    final selectedIndex = _locationToIndex(location);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(
              color: AppColors.divider,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: selectedIndex,
          onTap: (index) {
            if (index != selectedIndex) {
              context.go(_tabs[index]);
            }
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Trang chủ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront_outlined),
              activeIcon: Icon(Icons.storefront),
              label: 'Cửa hàng',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.local_offer_outlined),
              activeIcon: Icon(Icons.local_offer),
              label: 'Ưu đãi',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                Icons.shopping_cart_outlined,
              ),
              activeIcon: Icon(Icons.shopping_cart),
              label: 'Giỏ hàng',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outlined),
              activeIcon: Icon(Icons.person),
              label: 'Tài khoản',
            ),
          ],
        ),
      ),
    );
  }
}
