import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Core Layouts & Structural Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import { CustomerRoute, AdminRoute } from './components/ProtectedRoutes';

// Lazy Loaded Customer Pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const CategoryProducts = lazy(() => import('./pages/CategoryProducts'));
const BrandProducts = lazy(() => import('./pages/BrandProducts'));
const Search = lazy(() => import('./pages/Search'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthConfirm = lazy(() => import('./pages/AuthConfirm'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Terms = lazy(() => import('./pages/Legal').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Legal').then(m => ({ default: m.Privacy })));

// Lazy Loaded Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductList = lazy(() => import('./pages/admin/ProductList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const CategoryList = lazy(() => import('./pages/admin/CategoryList'));
const BrandList = lazy(() => import('./pages/admin/BrandList'));
const OrderList = lazy(() => import('./pages/admin/OrderList'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const UserList = lazy(() => import('./pages/admin/UserList'));
const ReviewList = lazy(() => import('./pages/admin/ReviewList'));
const CouponList = lazy(() => import('./pages/admin/CouponList'));
const InventoryList = lazy(() => import('./pages/admin/InventoryList'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const NotificationList = lazy(() => import('./pages/admin/NotificationList'));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400">Loading experience...</span>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {!location.pathname.startsWith('/admin') && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/category/:slug" element={<CategoryProducts />} />
            <Route path="/brand/:slug" element={<BrandProducts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/checkout"
              element={
                <CustomerRoute>
                  <Checkout />
                </CustomerRoute>
              }
            />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route
              path="/orders"
              element={
                <CustomerRoute>
                  <Orders />
                </CustomerRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <CustomerRoute>
                  <OrderDetails />
                </CustomerRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <CustomerRoute>
                  <Profile />
                </CustomerRoute>
              }
            />
            <Route
              path="/profile/addresses"
              element={
                <CustomerRoute>
                  <Addresses />
                </CustomerRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ProductList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/create"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ProductForm />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ProductForm />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CategoryList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <BrandList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <OrderList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <OrderDetail />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <UserList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ReviewList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CouponList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <InventoryList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Analytics />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <NotificationList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Fallback 404 */}
            <Route
              path="*"
              element={
                <div className="py-24 text-center space-y-4">
                  <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
                  <p className="text-xs text-gray-500">The page you were looking for could not be found.</p>
                  <a href="/" className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                    Back to Homepage
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      {!location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
