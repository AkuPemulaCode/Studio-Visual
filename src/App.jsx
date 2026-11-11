import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthProvider from "./assets/context/AuthProvider";
import NotificationProvider from "./assets/context/NotificationProvider";
import NotificationToaster from "./assets/components/NotificationToaster";
import ScrollToTop from "./assets/components/ScrollToTop";
import OfflineGate from "./assets/components/OfflineGate";
import DatabaseAlert from "./assets/components/DatabaseAlert";
import ProtectedRoute from "./assets/components/ProtectedRoute";
import SiteLayout from "./assets/layouts/SiteLayout";
import AdminLayout from "./assets/admin/layout/AdminLayout";
import WorkerLayout from "./assets/admin/layout/WorkerLayout";

import Home from "./assets/pages/Home";
import Category from "./assets/pages/Category";
import Services from "./assets/pages/Services";
import Booking from "./assets/pages/Booking";
import Payment from "./assets/pages/Payment";
import Orders from "./assets/pages/Orders";
import Login from "./assets/pages/Login";
import Register from "./assets/pages/Register";
import ForgotPassword from "./assets/pages/ForgotPassword";
import Offline from "./assets/pages/Offline";
import NotFound from "./assets/pages/NotFound";

import Monitoring from "./assets/admin/pages/Monitoring";
import Production from "./assets/admin/pages/Production";
import AdminBookings from "./assets/admin/pages/Bookings";
import BookingCreate from "./assets/admin/pages/BookingCreate";
import AdminCustomers from "./assets/admin/pages/Customers";
import AdminUsers from "./assets/admin/pages/Users";
import AdminPackages from "./assets/admin/pages/Packages";
import AdminPortfolios from "./assets/admin/pages/Portfolios";
import AuditLogs from "./assets/admin/pages/AuditLogs";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <OfflineGate>
            <ScrollToTop />
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/layanan" element={<Services />} />
                <Route path="/kategori" element={<Category />} />
                <Route path="/kategori/:slug" element={<Category />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/pembayaran" element={<Payment />} />
                <Route path="/pesanan" element={<Orders />} />
                <Route path="/masuk" element={<Login />} />
                <Route path="/daftar" element={<Register />} />
                <Route path="/lupa-password" element={<ForgotPassword />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Monitoring />} />
                <Route path="production" element={<Production />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="bookings/baru" element={<BookingCreate />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="portfolios" element={<AdminPortfolios />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

              <Route
                path="/worker"
                element={
                  <ProtectedRoute requireStaff>
                    <WorkerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Monitoring />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="production" element={<Production />} />
                <Route path="bookings" element={<AdminBookings worker />} />
                <Route
                  path="booking-baru"
                  element={<BookingCreate worker />}
                />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="*" element={<Navigate to="/worker" replace />} />
              </Route>
            </Routes>
            <NotificationToaster />
            <DatabaseAlert />
          </OfflineGate>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
