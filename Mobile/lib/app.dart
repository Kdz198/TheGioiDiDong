import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/view_models/auth_view_model.dart';
import 'features/home/view_models/home_view_model.dart';
import 'features/product/view_models/product_view_model.dart';
import 'features/cart/view_models/cart_view_model.dart';
import 'features/order/view_models/order_view_model.dart';
import 'features/profile/view_models/profile_view_model.dart';
import 'features/checkout/view_models/checkout_view_model.dart';
import 'features/search/view_models/search_view_model.dart';
import 'features/deals/view_models/deals_view_model.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => HomeViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => ProductViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => CartViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => OrderViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => ProfileViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => CheckoutViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => SearchViewModel(),
        ),
        ChangeNotifierProvider(
          create: (_) => DealsViewModel(),
        ),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        theme: buildAppTheme(),
        debugShowCheckedModeBanner: false,
        title: 'TechGear',
      ),
    );
  }
}
