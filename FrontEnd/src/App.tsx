import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ForbiddenPage } from "@/pages/Error/ForbiddenPage";
import { GatewayTimeoutPage } from "@/pages/Error/GatewayTimeoutPage";
import { NotFoundPage } from "@/pages/Error/NotFoundPage";
import { ServerErrorPage } from "@/pages/Error/ServerErrorPage";
import { ServiceUnavailablePage } from "@/pages/Error/ServiceUnavailablePage";
import { UnauthorizedPage } from "@/pages/Error/UnauthorizedPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { ROUTES } from "@/router/routes.const";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Lazy load pages for code splitting
const HomePage = lazy(() =>
  import("@/pages/customer/HomePage").then((m) => ({ default: m.HomePage }))
);
const ProductListPage = lazy(() =>
  import("@/pages/customer/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  }))
);
const ProductDetailPage = lazy(() =>
  import("@/pages/customer/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  }))
);
const CartPage = lazy(() =>
  import("@/pages/customer/CartPage").then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import("@/pages/customer/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  }))
);
const OrderSuccessPage = lazy(() =>
  import("@/pages/customer/OrderSuccessPage").then((m) => ({
    default: m.OrderSuccessPage,
  }))
);
const OrderHistoryPage = lazy(() =>
  import("@/pages/customer/OrderHistoryPage").then((m) => ({
    default: m.OrderHistoryPage,
  }))
);
const OrderDetailPage = lazy(() =>
  import("@/pages/customer/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  }))
);
const ProfilePage = lazy(() =>
  import("@/pages/customer/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);
const WishlistPage = lazy(() =>
  import("@/pages/customer/WishlistPage").then((m) => ({
    default: m.WishlistPage,
  }))
);
const MembershipPage = lazy(() =>
  import("@/pages/customer/MembershipPage").then((m) => ({
    default: m.MembershipPage,
  }))
);

// Admin pages
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const UserManagerPage = lazy(() =>
  import("@/pages/admin/UserManagerPage").then((m) => ({
    default: m.UserManagerPage,
  }))
);
const UserDetailAdminPage = lazy(() =>
  import("@/pages/admin/UserDetailAdminPage").then((m) => ({
    default: m.UserDetailAdminPage,
  }))
);
const ReportPage = lazy(() =>
  import("@/pages/admin/ReportPage").then((m) => ({ default: m.ReportPage }))
);
const EmployeeManagerPage = lazy(() =>
  import("@/pages/admin/EmployeeManagerPage").then((m) => ({
    default: m.EmployeeManagerPage,
  }))
);
const PaymentManagerPage = lazy(() =>
  import("@/pages/admin/PaymentManagerPage").then((m) => ({
    default: m.PaymentManagerPage,
  }))
);

// Staff pages
const StaffProductManagerPage = lazy(() =>
  import("@/pages/staff/ProductManagerPage").then((m) => ({
    default: m.ProductManagerPage,
  }))
);
const StaffProductFormPage = lazy(() =>
  import("@/pages/staff/ProductFormPage").then((m) => ({
    default: m.ProductFormPage,
  }))
);
const StaffBrandManagerPage = lazy(() =>
  import("@/pages/staff/BrandManagerPage").then((m) => ({
    default: m.BrandManagerPage,
  }))
);
const StaffCategoryManagerPage = lazy(() =>
  import("@/pages/staff/CategoryManagerPage").then((m) => ({
    default: m.CategoryManagerPage,
  }))
);
const StaffPromotionManagerPage = lazy(() =>
  import("@/pages/staff/PromotionManagerPage").then((m) => ({
    default: m.PromotionManagerPage,
  }))
);
const StaffOrderManagerPage = lazy(() =>
  import("@/pages/staff/OrderManagerPage").then((m) => ({
    default: m.OrderManagerPage,
  }))
);
const StaffOrderDetailPage = lazy(() =>
  import("@/pages/staff/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  }))
);
const StaffUserManagerPage = lazy(() =>
  import("@/pages/staff/UserManagerPage").then((m) => ({
    default: m.UserManagerPage,
  }))
);
const StaffFeedbackManagerPage = lazy(() =>
  import("@/pages/staff/FeedbackManagerPage").then((m) => ({
    default: m.FeedbackManagerPage,
  }))
);

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes — MainLayout */}
              <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
                <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
                <Route path={ROUTES.CATEGORY} element={<ProductListPage />} />
                <Route path={ROUTES.SEARCH} element={<ProductListPage />} />
              </Route>

              {/* Auth Routes — AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              </Route>

              {/* Customer Routes — MainLayout + ProtectedRoute */}
              <Route element={<MainLayout />}>
                <Route
                  path={ROUTES.CART}
                  element={
                    <ProtectedRoute role="customer">
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.CHECKOUT}
                  element={
                    <ProtectedRoute role="customer">
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.ORDER_SUCCESS}
                  element={
                    <ProtectedRoute role="customer">
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.ORDER_HISTORY}
                  element={
                    <ProtectedRoute role="customer">
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.ORDER_DETAIL}
                  element={
                    <ProtectedRoute role="customer">
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <ProtectedRoute role="customer">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.WISHLIST}
                  element={
                    <ProtectedRoute role="customer">
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.MEMBERSHIP}
                  element={
                    <ProtectedRoute role="customer">
                      <MembershipPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Routes — DashboardLayout + ProtectedRoute */}
              <Route
                element={
                  <ProtectedRoute role="admin">
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                <Route
                  path={ROUTES.ADMIN}
                  element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
                />
                <Route path={ROUTES.ADMIN_DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.ADMIN_REPORTS} element={<ReportPage />} />
                <Route path={ROUTES.ADMIN_USERS} element={<UserManagerPage />} />
                <Route path={ROUTES.ADMIN_USER_DETAIL} element={<UserDetailAdminPage />} />
                <Route path={ROUTES.ADMIN_EMPLOYEES} element={<EmployeeManagerPage />} />
                <Route path={ROUTES.ADMIN_PAYMENTS} element={<PaymentManagerPage />} />
              </Route>

              {/* Staff Routes — DashboardLayout + ProtectedRoute */}
              <Route
                element={
                  <ProtectedRoute role="staff">
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                <Route
                  path={ROUTES.STAFF}
                  element={<Navigate to={ROUTES.STAFF_PRODUCTS} replace />}
                />
                <Route path={ROUTES.STAFF_PRODUCTS} element={<StaffProductManagerPage />} />
                <Route path={ROUTES.STAFF_PRODUCT_CREATE} element={<StaffProductFormPage />} />
                <Route path={ROUTES.STAFF_PRODUCT_EDIT} element={<StaffProductFormPage />} />
                <Route path={ROUTES.STAFF_BRANDS} element={<StaffBrandManagerPage />} />
                <Route path={ROUTES.STAFF_CATEGORIES} element={<StaffCategoryManagerPage />} />
                <Route path={ROUTES.STAFF_ORDERS} element={<StaffOrderManagerPage />} />
                <Route path={ROUTES.STAFF_ORDER_DETAIL} element={<StaffOrderDetailPage />} />
                <Route path={ROUTES.STAFF_PROMOTIONS} element={<StaffPromotionManagerPage />} />
                <Route path={ROUTES.STAFF_USERS} element={<StaffUserManagerPage />} />
                <Route path={ROUTES.STAFF_FEEDBACK} element={<StaffFeedbackManagerPage />} />
              </Route>

              {/* Error Routes */}
              <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
              <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
              <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
              <Route path={ROUTES.SERVICE_UNAVAILABLE} element={<ServiceUnavailablePage />} />
              <Route path={ROUTES.GATEWAY_TIMEOUT} element={<GatewayTimeoutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
