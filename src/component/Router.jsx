import { MemberProvider, RealtimeProvider } from '../integrations/index.js';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '../lib/scroll-to-top.jsx';
import { MemberProtectedRoute } from './ui/member-protected-route.jsx';
import HomePage from './pages/HomePage.jsx';
import StationsPage from './pages/StationPage.jsx';
import StationDetailPage from './pages/StationDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';
import OwnerStationManagePage from './pages/OwnerStationManagePage.jsx';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage.jsx';
import StationManagementPage from './pages/StationManagementPage.jsx';
import RentalManagementPage from './pages/RentalManagementPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />, // MIXED ROUTE: Shows different content for authenticated vs anonymous users
      },
      {
        path: "stations",
        element: <StationsPage />,
      },
      {
        path: "stations/:id",
        element: <StationDetailPage />,
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access your profile">
            <ProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to view your bookings">
            <BookingsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "rentals",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to view your rentals">
            <RentalManagementPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "owner/dashboard",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access the station owner dashboard">
            <OwnerDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "owner/stations",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to manage your stations">
            <StationManagementPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "owner/stations/:id",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to manage your stations">
            <OwnerStationManagePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "owner/analytics",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to view analytics">
            <OwnerAnalyticsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to access admin panel">
            <AdminDashboardPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
    </MemberProvider>
  );
}
