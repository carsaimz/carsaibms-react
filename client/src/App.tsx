import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './lib/api';
import { useAnalytics } from './hooks/useAnalytics';
import { useAuthStore } from './store/auth';

import AuthLayout     from './layouts/AuthLayout';
import PublicLayout   from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout    from './layouts/AdminLayout';
import StaffLayout    from './layouts/StaffLayout';
import PosLayout      from './layouts/PosLayout';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public
import Home          from './pages/public/Home';
import PubProducts   from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import PubServices   from './pages/public/Services';
import BlogIndex     from './pages/public/blog/index';
import BlogPost      from './pages/public/blog/Post';
import Contact       from './pages/public/Contact';
import ApiDocs       from './pages/public/ApiDocs';
import PubQuote      from './pages/public/Quote';
import CmsPage       from './pages/public/Page';
import NotFound      from './pages/public/NotFound';
import ErrorPage     from './pages/public/Error';
import Maintenance   from './pages/public/Maintenance';

// Customer
import Dashboard    from './pages/customer/Dashboard';
import Orders       from './pages/customer/Orders';
import OrderDetail  from './pages/customer/OrderDetail';
import Invoices     from './pages/customer/Invoices';
import Tickets      from './pages/customer/Tickets';
import TicketDetail from './pages/customer/TicketDetail';
import Profile      from './pages/customer/Profile';
import CustPayments from './pages/customer/Payments';
import CustServices from './pages/customer/Services';
import CustQuote    from './pages/customer/Quote';

// Admin
import AdminDash        from './pages/admin/Dashboard';
import AdminProducts    from './pages/admin/Products';
import AdminServices    from './pages/admin/Services';
import AdminOrders      from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminCustomers   from './pages/admin/Customers';
import AdminTickets     from './pages/admin/Tickets';
import AdminReports     from './pages/admin/Reports';
import AdminSettings    from './pages/admin/Settings';
import AdminCategories  from './pages/admin/Categories';
import AdminPosts       from './pages/admin/Posts';
import AdminCoupons     from './pages/admin/Coupons';
import AdminFinancial   from './pages/admin/Financial';
import AdminStock       from './pages/admin/Stock';
import AdminSales       from './pages/admin/Sales';
import AdminSuppliers   from './pages/admin/Suppliers';
import AdminLogs        from './pages/admin/Logs';
import AdminUsers       from './pages/admin/Users';
import AdminNotifications from './pages/admin/Notifications';
import AdminProfile     from './pages/admin/Profile';
import AdminPayments    from './pages/admin/Payments';
import AdminPages       from './pages/admin/Pages';

// Staff
import StaffTasks    from './pages/staff/Tasks';
import StaffTickets  from './pages/staff/Tickets';
import StaffMessages from './pages/staff/Messages';

// POS
import POS from './pages/pos/index';

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role ?? '')) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="text-sm text-gray-400">A carregar...</p>
      </div>
    </div>
  );
}

export default function App() {
  useAnalytics();
  const [ready, setReady] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser  = useAuthStore((s) => s.setUser);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post<{ data: { token: string; user: any } }>(
          '/auth/refresh', undefined, { skipAuth: true }
        );
        setToken(res.data.token); setUser(res.data.user);
      } catch { /**/ } finally { setReady(true); }
    })();
  }, [setToken, setUser]);

  if (!ready) return <Loader />;

  const ADMIN  = ['admin','manager'];
  const STAFF  = ['admin','manager','seller','staff'];

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/"               element={<Home />} />
        <Route path="/products"       element={<PubProducts />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/services"       element={<PubServices />} />
        <Route path="/blog"           element={<BlogIndex />} />
        <Route path="/blog/:slug"     element={<BlogPost />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/api-docs"       element={<ApiDocs />} />
        <Route path="/quote"          element={<PubQuote />} />
        <Route path="/maintenance"    element={<Maintenance />} />
        <Route path="/p/:slug"        element={<CmsPage />} />
        <Route path="/500"            element={<ErrorPage code={500} message="Erro do servidor" />} />
        <Route path="/403"            element={<ErrorPage code={403} message="Acesso negado" />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Customer */}
      <Route element={<RequireAuth><CustomerLayout /></RequireAuth>}>
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/orders"             element={<Orders />} />
        <Route path="/orders/:id"         element={<OrderDetail />} />
        <Route path="/invoices"           element={<Invoices />} />
        <Route path="/tickets"            element={<Tickets />} />
        <Route path="/tickets/:id"        element={<TicketDetail />} />
        <Route path="/profile"            element={<Profile />} />
        <Route path="/payments"           element={<CustPayments />} />
        <Route path="/my-services"        element={<CustServices />} />
        <Route path="/quote"              element={<CustQuote />} />
      </Route>

      {/* Admin */}
      <Route element={<RequireAuth roles={ADMIN}><AdminLayout /></RequireAuth>}>
        <Route path="/admin"                  element={<AdminDash />} />
        <Route path="/admin/products"         element={<AdminProducts />} />
        <Route path="/admin/services"         element={<AdminServices />} />
        <Route path="/admin/orders"           element={<AdminOrders />} />
        <Route path="/admin/orders/:id"       element={<AdminOrderDetail />} />
        <Route path="/admin/customers"        element={<AdminCustomers />} />
        <Route path="/admin/tickets"          element={<AdminTickets />} />
        <Route path="/admin/reports"          element={<AdminReports />} />
        <Route path="/admin/settings"         element={<AdminSettings />} />
        <Route path="/admin/categories"       element={<AdminCategories />} />
        <Route path="/admin/posts"            element={<AdminPosts />} />
        <Route path="/admin/coupons"          element={<AdminCoupons />} />
        <Route path="/admin/financial"        element={<AdminFinancial />} />
        <Route path="/admin/stock"            element={<AdminStock />} />
        <Route path="/admin/sales"            element={<AdminSales />} />
        <Route path="/admin/suppliers"        element={<AdminSuppliers />} />
        <Route path="/admin/logs"             element={<AdminLogs />} />
        <Route path="/admin/users"            element={<AdminUsers />} />
        <Route path="/admin/notifications"    element={<AdminNotifications />} />
        <Route path="/admin/profile"          element={<AdminProfile />} />
        <Route path="/admin/payments"         element={<AdminPayments />} />
        <Route path="/admin/pages"            element={<AdminPages />} />
      </Route>

      {/* Staff */}
      <Route element={<RequireAuth roles={STAFF}><StaffLayout /></RequireAuth>}>
        <Route path="/staff"          element={<StaffTasks />} />
        <Route path="/staff/tickets"  element={<StaffTickets />} />
        <Route path="/staff/messages" element={<StaffMessages />} />
      </Route>

      {/* POS */}
      <Route element={<RequireAuth roles={STAFF}><PosLayout /></RequireAuth>}>
        <Route path="/pos" element={<POS />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
