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
const ServicesPage = lazy(() =>
  import("@/pages/customer/ServicesPage").then((m) => ({ default: m.ServicesPage }))
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
const OrderCancelPage = lazy(() =>
  import("@/pages/customer/OrderCancelPage").then((m) => ({
    default: m.OrderCancelPage,
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
// const WishlistPage = lazy(() =>
//   import("@/pages/customer/WishlistPage").then((m) => ({
//     default: m.WishlistPage,
//   }))
// );
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
const StaffOrderCreatePage = lazy(() =>
  import("@/pages/staff/StaffOrderCreatePage").then((m) => ({
    default: m.StaffOrderCreatePage,
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
const StaffProductVersionManagerPage = lazy(() =>
  import("@/pages/staff/ProductVersionManagerPage").then((m) => ({
    default: m.ProductVersionManagerPage,
  }))
);
const StaffBlogManagerPage = lazy(() =>
  import("@/pages/staff/BlogManagerPage").then((m) => ({
    default: m.BlogManagerPage,
  }))
);
const StaffBlogFormPage = lazy(() =>
  import("@/pages/staff/BlogFormPage").then((m) => ({
    default: m.BlogFormPage,
  }))
);
const StaffBlogPreviewPage = lazy(() =>
  import("@/pages/staff/BlogPreviewPage").then((m) => ({
    default: m.BlogPreviewPage,
  }))
);

// Admin CRUD pages
const AdminProductManagerPage = lazy(() =>
  import("@/pages/admin/AdminProductManagerPage").then((m) => ({
    default: m.AdminProductManagerPage,
  }))
);
const AdminProductFormPage = lazy(() =>
  import("@/pages/staff/ProductFormPage").then((m) => ({
    default: m.ProductFormPage,
  }))
);
const AdminOrderManagerPage = lazy(() =>
  import("@/pages/admin/AdminOrderManagerPage").then((m) => ({
    default: m.AdminOrderManagerPage,
  }))
);
const AdminOrderDetailPage = lazy(() =>
  import("@/pages/staff/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  }))
);
const AdminBrandManagerPage = lazy(() =>
  import("@/pages/admin/BrandManagerPage").then((m) => ({
    default: m.BrandManagerPage,
  }))
);
const AdminCategoryManagerPage = lazy(() =>
  import("@/pages/admin/CategoryManagerPage").then((m) => ({
    default: m.CategoryManagerPage,
  }))
);
const AdminPromotionManagerPage = lazy(() =>
  import("@/pages/admin/PromotionManagerPage").then((m) => ({
    default: m.PromotionManagerPage,
  }))
);
const AdminFeedbackManagerPage = lazy(() =>
  import("@/pages/admin/FeedbackManagerPage").then((m) => ({
    default: m.FeedbackManagerPage,
  }))
);
const AdminProductVersionManagerPage = lazy(() =>
  import("@/pages/admin/ProductVersionManagerPage").then((m) => ({
    default: m.ProductVersionManagerPage,
  }))
);
const AdminAuditLogPage = lazy(() =>
  import("@/pages/admin/AdminAuditLogPage").then((m) => ({
    default: m.AdminAuditLogPage,
  }))
);
const AdminBlogManagerPage = lazy(() =>
  import("@/pages/admin/BlogManagerPage").then((m) => ({
    default: m.BlogManagerPage,
  }))
);
const AdminBlogFormPage = lazy(() =>
  import("@/pages/admin/BlogFormPage").then((m) => ({
    default: m.BlogFormPage,
  }))
);
const AdminBlogPreviewPage = lazy(() =>
  import("@/pages/admin/BlogPreviewPage").then((m) => ({
    default: m.BlogPreviewPage,
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
                <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
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
                  path={ROUTES.ORDER_CANCEL}
                  element={
                    <ProtectedRoute role="customer">
                      <OrderCancelPage />
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
                {/*<Route*/}
                {/*  path={ROUTES.WISHLIST}*/}
                {/*  element={*/}
                {/*    <ProtectedRoute role="customer">*/}
                {/*      <WishlistPage />*/}
                {/*    </ProtectedRoute>*/}
                {/*  }*/}
                {/*/>*/}
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
                <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductManagerPage />} />
                <Route path={ROUTES.ADMIN_PRODUCT_CREATE} element={<AdminProductFormPage />} />
                <Route path={ROUTES.ADMIN_PRODUCT_EDIT} element={<AdminProductFormPage />} />
                <Route path={ROUTES.ADMIN_BRANDS} element={<AdminBrandManagerPage />} />
                <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoryManagerPage />} />
                <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrderManagerPage />} />
                <Route path={ROUTES.ADMIN_ORDER_DETAIL} element={<AdminOrderDetailPage />} />
                <Route path={ROUTES.ADMIN_PROMOTIONS} element={<AdminPromotionManagerPage />} />
                <Route path={ROUTES.ADMIN_BLOGS} element={<AdminBlogManagerPage />} />
                <Route path={ROUTES.ADMIN_BLOG_CREATE} element={<AdminBlogFormPage />} />
                <Route path={ROUTES.ADMIN_BLOG_EDIT} element={<AdminBlogFormPage />} />
                <Route path={ROUTES.ADMIN_BLOG_PREVIEW} element={<AdminBlogPreviewPage />} />
                <Route path={ROUTES.ADMIN_FEEDBACK} element={<AdminFeedbackManagerPage />} />
                <Route
                  path={ROUTES.ADMIN_PRODUCT_VERSIONS}
                  element={<AdminProductVersionManagerPage />}
                />
                <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AdminAuditLogPage />} />
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
                <Route path={ROUTES.STAFF_ORDER_CREATE} element={<StaffOrderCreatePage />} />
                <Route path={ROUTES.STAFF_ORDER_DETAIL} element={<StaffOrderDetailPage />} />
                <Route path={ROUTES.STAFF_PROMOTIONS} element={<StaffPromotionManagerPage />} />
                <Route path={ROUTES.STAFF_BLOGS} element={<StaffBlogManagerPage />} />
                <Route path={ROUTES.STAFF_BLOG_CREATE} element={<StaffBlogFormPage />} />
                <Route path={ROUTES.STAFF_BLOG_EDIT} element={<StaffBlogFormPage />} />
                <Route path={ROUTES.STAFF_BLOG_PREVIEW} element={<StaffBlogPreviewPage />} />
                <Route path={ROUTES.STAFF_USERS} element={<StaffUserManagerPage />} />
                <Route path={ROUTES.STAFF_FEEDBACK} element={<StaffFeedbackManagerPage />} />
                <Route
                  path={ROUTES.STAFF_PRODUCT_VERSIONS}
                  element={<StaffProductVersionManagerPage />}
                />
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
